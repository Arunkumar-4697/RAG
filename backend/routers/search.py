# Standard library imports
import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import List, Optional

# Third-party imports
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

# Local application imports
from embedding.model import get_embedding_model
from retrieval.qdrant_client import get_qdrant_client
from rerank.model import get_reranker_model
from llm.client import get_llm_client, build_prompt
from routers.config import load_config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Search"])

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    question: str
    search_mode: str = "all"
    folders: List[str] = []
    files: List[str] = []

@router.post("")
def chat(req: ChatRequest):
    """
    Handles chat requests by finding semantically similar document chunks in Qdrant,
    reranking them, and using them as context for the language model to generate an answer.
    Also handles transcript creation and appending.
    """
    logger.info(f"Chat request received. Question: {req.question}")
    logger.info(f"Payload: search_mode={req.search_mode}, files={req.files}, folders={req.folders}")
    
    try:
        # Embedding
        model = get_embedding_model()
        query_vector = model.encode(req.question).tolist()
        
        # Qdrant search
        qdrant = get_qdrant_client()
        collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
        
        query_filter = None
        if req.search_mode == "selected":
            conditions = []
            for f in req.files:
                qdrant_path = f"primary_user/{f}" if not f.startswith("primary_user/") else f
                conditions.append(FieldCondition(key="relative_path", match=MatchValue(value=qdrant_path)))
            for folder in req.folders:
                folder_basename = os.path.basename(folder)
                conditions.append(FieldCondition(key="folder_name", match=MatchValue(value=folder_basename)))
            
            if conditions:
                query_filter = Filter(should=conditions)
        
        app_config = load_config()
        limit = int(app_config.get("semantic_count", 10))
        top_k = int(app_config.get("reranker_count", 3))

        search_result = qdrant.query_points(
            collection_name=collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=limit
        ).points
        
        if not search_result:
            return {"answer": "I cannot answer this based on the provided documents.", "sources": []}
            
        logger.info(f"Retrieval count: {len(search_result)}")
        
        # Rerank
        reranker = get_reranker_model()
        pairs = [[req.question, hit.payload['text']] for hit in search_result]
        scores = reranker.predict(pairs)
        
        logger.info(f"Reranking scores: {scores.tolist()}")
        
        # Sort and get top_k
        scored_hits = list(zip(search_result, scores))
        scored_hits.sort(key=lambda x: x[1], reverse=True)
        top_hits = scored_hits[:top_k]
        
        # Build prompt
        chunks = [hit.payload for hit, score in top_hits]
        messages = build_prompt(req.question, chunks)
        
        # Call LLM
        llm = get_llm_client()
        start_time = time.time()
        
        response = llm.chat.completions.create(
            model=app_config["language_model"],
            messages=messages,
            temperature=0.1,
            max_tokens=1024,
            stream=False
        )
        
        latency = time.time() - start_time
        logger.info(f"LLM latency: {latency:.2f}s")
        
        answer = response.choices[0].message.content
        
        source_dict = {}
        for chunk in chunks:
            fname = chunk['file_name']
            page = chunk['page_number']
            if fname not in source_dict:
                source_dict[fname] = set()
            if page is not None:
                source_dict[fname].add(page)
                
        sources = []
        for fname, pages in source_dict.items():
            sorted_pages = sorted(list(pages))
            page_str = ", ".join(str(p) for p in sorted_pages) if sorted_pages else ""
            sources.append({
                "file_name": fname,
                "page": page_str
            })
        
        # Save transcript
        convo_id = req.conversation_id
        if not convo_id:
            convo_id = f"c-{int(time.time()*1000)}"
            
        transcripts_dir = "data/transcripts"
        file_path = os.path.join(transcripts_dir, f"{convo_id}.json")
        
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                transcript_data = json.load(f)
        else:
            # First query, use it as title
            transcript_data = {
                "id": convo_id,
                "title": req.question[:30] + ("..." if len(req.question) > 30 else ""),
                "accessed_at": datetime.now(timezone.utc).isoformat(),
                "messages": []
            }
            
        transcript_data["accessed_at"] = datetime.now(timezone.utc).isoformat()
        
        # Append user message
        transcript_data["messages"].append({
            "role": "user",
            "content": req.question,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Append system message
        transcript_data["messages"].append({
            "role": "system",
            "content": answer,
            "sources": sources,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        with open(file_path, 'w') as f:
            json.dump(transcript_data, f, indent=4)

        return {
            "answer": answer,
            "sources": sources,
            "conversation_id": convo_id
        }
    except Exception as e:
        logger.error(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail="LLM or processing failure")
