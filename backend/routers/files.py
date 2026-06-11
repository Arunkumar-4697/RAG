# Standard library imports
import os
import logging
import uuid

# Third-party imports
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue

# Local application imports
from chunking.parser import parse_document
from chunking.semantic import generate_chunks
from embedding.model import get_embedding_model
from retrieval.qdrant_client import get_qdrant_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["Files"])

STORAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../storage/primary_user"))
SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}

def get_safe_path(target_path: str) -> str:
    """
    Validates and resolves the target path against the base storage directory.
    Prevents path traversal vulnerabilities.
    """
    if not target_path:
        return STORAGE_PATH
    safe_target = target_path.lstrip("/")
    final_path = os.path.abspath(os.path.join(STORAGE_PATH, safe_target))
    if not final_path.startswith(STORAGE_PATH):
        raise HTTPException(status_code=400, detail="Invalid path")
    return final_path

class FileDelete(BaseModel):
    file_path: str = None
    file_paths: list[str] = None

@router.post("/upload")
def upload_file(folder_path: str = Form(""), file: UploadFile = File(...)):
    """
    Uploads a document file, parses its contents, chunks the text, 
    generates embeddings, and stores them in Qdrant for retrieval.
    """
    full_folder_path = get_safe_path(folder_path)
    if not os.path.exists(full_folder_path):
        os.makedirs(full_folder_path, exist_ok=True)
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    file_path = os.path.join(full_folder_path, file.filename)
    try:
        logger.info(f"upload start: {file.filename}")
        with open(file_path, "wb") as f:
            f.write(file.file.read())
            
        pages = parse_document(file_path)
        chunks = generate_chunks(pages)
        logger.info(f"chunks generated: {len(chunks)}")
        
        if chunks:
            model = get_embedding_model()
            qdrant = get_qdrant_client()
            collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
            
            texts = [c['text'] for c in chunks]
            embeddings = model.encode(texts)
            logger.info(f"embeddings generated: {len(embeddings)}")
            
            points = []
            rel_path = os.path.relpath(file_path, os.path.join(STORAGE_PATH, ".."))
            folder_name = os.path.basename(full_folder_path) if full_folder_path != STORAGE_PATH else ""
            
            for i, chunk in enumerate(chunks):
                metadata = {
                    "model_used_for_chunking": os.environ["EMBEDDING_MODEL"],
                    "relative_path": rel_path,
                    "folder_name": folder_name,
                    "file_name": file.filename,
                    "page_number": chunk['page_number'],
                    "chunk_index": chunk['chunk_index'],
                    "text": chunk['text']
                }
                points.append(PointStruct(id=uuid.uuid4().hex, vector=embeddings[i].tolist(), payload=metadata))
            
            qdrant.upsert(collection_name=collection_name, points=points)
            logger.info(f"vectors inserted: {len(points)}")
            
        logger.info(f"upload completion: {file.filename}")
        return {"message": "File uploaded successfully"}
    except Exception as e:
        logger.error(f"Error uploading file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")

@router.delete("")
def delete_file(req: FileDelete):
    """
    Deletes one or multiple files from local storage and removes 
    their associated chunks from the Qdrant vector database.
    """
    paths_to_delete = []
    if req.file_path:
        paths_to_delete.append(req.file_path)
    if req.file_paths:
        paths_to_delete.extend(req.file_paths)
        
    if not paths_to_delete:
        raise HTTPException(status_code=400, detail="No file paths provided")
        
    try:
        qdrant = get_qdrant_client()
        collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
        
        for p in paths_to_delete:
            f_path = get_safe_path(p)
            if os.path.exists(f_path) and not os.path.isdir(f_path):
                os.remove(f_path)
                logger.info(f"Deleted file: {p}")
                
            rel_path = os.path.relpath(f_path, os.path.join(STORAGE_PATH, ".."))
            qdrant.delete(
                collection_name=collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="relative_path",
                            match=MatchValue(value=rel_path)
                        )
                    ]
                )
            )
        logger.info(f"vectors deleted for files: {paths_to_delete}")
        return {"message": "Files deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting files: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")
