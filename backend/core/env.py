import os
import sys
import logging

logger = logging.getLogger(__name__)

REQUIRED_ENV_VARS = [
    "NVIDIA_API_KEY",
    "APP_KEY",
    "QDRANT_COLLECTION_NAME",
    "EMBEDDING_MODEL",
    "RERANKER_MODEL",
    "LLM_MODEL",
    "LLM_BASE_URL",
    "HF_TOKEN"
]

def validate_environment():
    """
    Validates that all strictly required environment variables are present.
    If any are missing, prints a fatal error and aggressively exits the process.
    """
    missing_vars = [var for var in REQUIRED_ENV_VARS if not os.environ.get(var)]
    
    if missing_vars:
        logger.error("="*50)
        logger.error("FATAL: Missing required environment variables!")
        logger.error("The application cannot start until these are set in .env:")
        for var in missing_vars:
            logger.error(f"  ❌ {var}")
        logger.error("="*50)
        sys.exit(1)
