import fitz # PyMuPDF
import os

def parse_document(file_path: str):
    """
    Extracts text and page numbers from a supported file.
    Returns a list of dicts: [{'text': str, 'page_number': int}]
    """
    ext = os.path.splitext(file_path)[1].lower()
    pages = []
    
    if ext == '.pdf':
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                pages.append({"text": text.strip(), "page_number": page_num + 1})
    elif ext in ['.txt', '.md']:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            if text.strip():
                pages.append({"text": text.strip(), "page_number": 1})
    else:
        raise ValueError(f"Unsupported file format: {ext}")
        
    return pages
