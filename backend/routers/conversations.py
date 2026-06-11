# Standard library imports
import os
import json
from datetime import datetime

# Third-party imports
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/conversations", tags=["Conversations"])

DATA_DIR = "data"
TRANSCRIPTS_DIR = os.path.join(DATA_DIR, "transcripts")

@router.get("")
def list_conversations():
    """
    Retrieves metadata about all existing conversation transcripts.
    Sorted by the latest accessed time.
    """
    convos = []
        
    for file in os.listdir(TRANSCRIPTS_DIR):
        if file.endswith('.json'):
            with open(os.path.join(TRANSCRIPTS_DIR, file), 'r') as f:
                data = json.load(f)
                convos.append({
                    "id": file.replace('.json', ''),
                    "title": data.get("title", "New Conversation"),
                    "accessed_at": data.get("accessed_at")
                })
    
    convos.sort(key=lambda x: x.get("accessed_at") or "", reverse=True)
    return convos

@router.get("/{convo_id}")
def get_conversation(convo_id: str):
    """
    Retrieves the full transcript of a specific conversation by ID.
    """
    file_path = os.path.join(TRANSCRIPTS_DIR, f"{convo_id}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Conversation not found")

@router.delete("/{convo_id}")
def delete_conversation(convo_id: str):
    """
    Deletes a specific conversation transcript by ID.
    """
    file_path = os.path.join(TRANSCRIPTS_DIR, f"{convo_id}.json")
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": "Conversation deleted successfully"}
    raise HTTPException(status_code=404, detail="Conversation not found")
