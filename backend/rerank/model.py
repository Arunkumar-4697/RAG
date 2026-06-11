from sentence_transformers import CrossEncoder
import os

_reranker_model = None

def get_reranker_model():
    """
    Singleton for the reranker model.
    Used for re-ranking chunks based on question.
    """
    global _reranker_model
    if _reranker_model is None:
        rerank_model = os.environ["RERANKER_MODEL"]
        _reranker_model = CrossEncoder(rerank_model)
    return _reranker_model
