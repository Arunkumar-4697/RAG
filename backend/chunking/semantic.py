import nltk
from nltk.tokenize import sent_tokenize
from embedding.model import get_embedding_model
import numpy as np

# Download punkt_tab explicitly if missing
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

def get_cosine_similarity(vec1, vec2):
    dot = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)

def generate_chunks(pages: list, max_chunk_size=800, overlap=150, similarity_threshold=0.5):
    """
    Semantic chunking using sentence embeddings.
    """
    model = get_embedding_model()
    chunks = []
    chunk_index = 0
    
    for page in pages:
        page_num = page['page_number']
        text = page['text']
        
        sentences = sent_tokenize(text)
        if not sentences:
            continue
            
        # Encode all sentences on this page
        embeddings = model.encode(sentences)
        
        current_chunk = []
        current_length = 0
        
        for i, sentence in enumerate(sentences):
            sentence_len = len(sentence)
            
            if i == 0:
                current_chunk.append(sentence)
                current_length += sentence_len
                continue
                
            # Compare with previous sentence
            similarity = get_cosine_similarity(embeddings[i], embeddings[i-1])
            
            # If semantically different OR exceeding max chunk size, we start a new chunk
            if similarity < similarity_threshold or (current_length + sentence_len > max_chunk_size):
                # Save current chunk
                chunk_text = " ".join(current_chunk)
                
                # Enforce max chunk size rigidly if a single semantic block is too large
                if len(chunk_text) > max_chunk_size:
                    # Hard split using overlap
                    while len(chunk_text) > max_chunk_size:
                        split_text = chunk_text[:max_chunk_size]
                        chunks.append({
                            "text": split_text,
                            "page_number": page_num,
                            "chunk_index": chunk_index
                        })
                        chunk_index += 1
                        chunk_text = chunk_text[max_chunk_size - overlap:]
                    
                    if len(chunk_text.strip()) > 0:
                        chunks.append({
                            "text": chunk_text,
                            "page_number": page_num,
                            "chunk_index": chunk_index
                        })
                        chunk_index += 1
                else:
                    chunks.append({
                        "text": chunk_text,
                        "page_number": page_num,
                        "chunk_index": chunk_index
                    })
                    chunk_index += 1
                
                current_chunk = [sentence]
                current_length = sentence_len
            else:
                current_chunk.append(sentence)
                current_length += sentence_len + 1 # +1 for space
                
        # Save remaining chunk for the page
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            if len(chunk_text) > max_chunk_size:
                while len(chunk_text) > max_chunk_size:
                    split_text = chunk_text[:max_chunk_size]
                    chunks.append({
                        "text": split_text,
                        "page_number": page_num,
                        "chunk_index": chunk_index
                    })
                    chunk_index += 1
                    chunk_text = chunk_text[max_chunk_size - overlap:]
            if len(chunk_text.strip()) > 0:
                chunks.append({
                    "text": chunk_text,
                    "page_number": page_num,
                    "chunk_index": chunk_index
                })
                chunk_index += 1

    return chunks
