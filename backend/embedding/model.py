from sentence_transformers import SentenceTransformer
import os

_embedding_model = None

def get_embedding_model():
    """
    Singleton for the embedding model.
    384 dimensions for BAAI/bge-small-en-v1.5.
    """
    global _embedding_model
    if _embedding_model is None:
        emb_model = os.environ["EMBEDDING_MODEL"]
        _embedding_model = SentenceTransformer(emb_model)
    return _embedding_model
