from sentence_transformers import SentenceTransformer, CrossEncoder
import os

def preload():
    emb_model = os.environ["EMBEDDING_MODEL"]
    rerank_model = os.environ["RERANKER_MODEL"]
    
    print(f"Downloading embedding model: {emb_model}...")
    SentenceTransformer(emb_model)
    
    print(f"Downloading reranker model: {rerank_model}...")
    CrossEncoder(rerank_model)
    
    print("All models successfully pre-downloaded and cached!")

if __name__ == "__main__":
    preload()
