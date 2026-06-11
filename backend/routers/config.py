# Third-party imports
from fastapi import APIRouter

import os

router = APIRouter(prefix="/config", tags=["Config"])

# In-memory dictionary replacing the JSON file
APP_CONFIG = {
    "semantic_count": 10,
    "reranker_count": 3,
    "embedding_model": os.environ["EMBEDDING_MODEL"],
    "language_model": os.environ["LLM_MODEL"]
}

def load_config():
    """
    Returns the system configuration from the in-memory dictionary.
    """
    return APP_CONFIG

@router.get("")
def read_config():
    """
    Retrieves the system-wide application configuration.
    """
    return APP_CONFIG

@router.post("")
def update_config(config: dict):
    """
    Updates the system-wide application configuration dictionary with the provided payload.
    """
    APP_CONFIG.update(config)
    return {"status": "success", "config": APP_CONFIG}
