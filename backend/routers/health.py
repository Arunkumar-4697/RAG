from fastapi import APIRouter
from qdrant_client import QdrantClient
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["System"])

QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

@router.get("/")
def read_root():
    return {"message": "Chat With Your Docs API"}

@router.get("/health")
def health_check():
    qdrant_status = False
    try:
        client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=2.0)
        # Verify connection
        client.get_collections()
        qdrant_status = True
    except Exception as e:
        logger.error(f"Failed to connect to Qdrant: {e}")
        
    return {
        "backend": True,
        "qdrant": qdrant_status
    }
