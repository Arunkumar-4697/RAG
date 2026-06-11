from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
import os

from retrieval.qdrant_client import get_qdrant_client
from embedding.model import get_embedding_model
from rerank.model import get_reranker_model
from llm.client import get_llm_client

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Initialization
    logger.info("Initializing models and connections on startup...")
    
    # 1. Qdrant Client
    logger.info("Connecting to Qdrant...")
    qdrant = get_qdrant_client()
    collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
    logger.info(f"Qdrant initialized. Target collection: '{collection_name}'")
    
    # 2. Embedding Model
    logger.info("Loading Embedding Model...")
    get_embedding_model()
    logger.info("Embedding Model loaded successfully.")
    
    # 3. Reranker Model
    logger.info("Loading Reranker Model...")
    get_reranker_model()
    logger.info("Reranker Model loaded successfully.")
    
    # 4. LLM Client
    logger.info("Initializing LLM Client...")
    get_llm_client()
    logger.info("LLM Client initialized successfully.")
    
    yield
    # Shutdown logic
    logger.info("Shutting down the application...")
