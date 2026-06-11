# Standard library imports
import os

# Third-party imports
from fastapi import APIRouter

# Local application imports
from retrieval.qdrant_client import get_qdrant_client
from routers.folders import STORAGE_PATH

router = APIRouter(prefix="/stats", tags=["Stats"])

def get_total_documents(path=STORAGE_PATH):
    """
    Scans the local storage directory and computes the total count
    of stored documents and the latest modification time.
    """
    count = 0
    latest_time = 0
    if not os.path.exists(path):
        return 0, 0
    for root, dirs, files in os.walk(path):
        for file in files:
            count += 1
            file_time = os.path.getmtime(os.path.join(root, file))
            if file_time > latest_time:
                latest_time = file_time
    return count, latest_time

@router.get("")
def get_stats():
    """
    Retrieves system statistics including total documents indexed, 
    number of vector chunks, and the time of the latest document upload.
    """
    total_docs, last_upload_time = get_total_documents()
    try:
        qclient = get_qdrant_client()
        collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
        coll = qclient.get_collection(collection_name)
        indexed_chunks = coll.points_count
    except Exception:
        indexed_chunks = 0
    
    return {
        "total_documents": total_docs,
        "indexed_chunks": indexed_chunks,
        "last_upload_time": last_upload_time
    }
