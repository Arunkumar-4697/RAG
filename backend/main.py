from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

@app.get("/")
def read_root():
    return {"message": "Chat With Your Docs API"}

@app.get("/health")
def health_check():
    qdrant_status = False
    try:
        client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=2.0)
        # Verify connection
        client.get_collections()
        qdrant_status = True
    except Exception as e:
        logger.error(f"Failed to connect to Qdrant: {e}")
        qdrant_status = False
        
    return {
        "backend": True,
        "qdrant": qdrant_status
    }
