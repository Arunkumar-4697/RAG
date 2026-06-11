from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
import os

_qdrant_client = None

def get_qdrant_client():
    """
    Singleton for Qdrant client.
    Connects to the Qdrant instance and creates the 'documents' collection if it doesn't exist.
    """
    global _qdrant_client
    if _qdrant_client is None:
        qdrant_host = os.getenv("QDRANT_HOST", "qdrant")
        qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))
        _qdrant_client = QdrantClient(host=qdrant_host, port=qdrant_port)
        
        # Ensure collection exists
        try:
            collections = _qdrant_client.get_collections().collections
            if not any(c.name == "documents" for c in collections):
                _qdrant_client.create_collection(
                    collection_name="documents",
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
        except Exception as e:
            print(f"Error initializing Qdrant: {e}")
            
    return _qdrant_client
