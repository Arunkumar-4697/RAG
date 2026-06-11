# Standard library imports
import os
import shutil
import logging

# Third-party imports
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

# Local application imports
from retrieval.qdrant_client import get_qdrant_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/folders", tags=["Folders"])

STORAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../storage/primary_user"))

def get_safe_path(target_path: str) -> str:
    """
    Validates and resolves the target path against the base storage directory.
    Prevents path traversal vulnerabilities.
    """
    safe_target = target_path.lstrip("/")
    final_path = os.path.abspath(os.path.join(STORAGE_PATH, safe_target))
    if not final_path.startswith(STORAGE_PATH):
        raise HTTPException(status_code=400, detail="Invalid path")
    return final_path

class FolderCreate(BaseModel):
    folder_path: str

@router.post("", status_code=status.HTTP_201_CREATED)
def create_folder(req: FolderCreate):
    """
    Creates a new folder in the local storage directory.
    """
    folder_path = get_safe_path(req.folder_path)
    if os.path.exists(folder_path):
        raise HTTPException(status_code=409, detail="Folder already exists")
    try:
        os.makedirs(folder_path, exist_ok=True)
        logger.info(f"Created folder: {req.folder_path}")
        return {"message": "Folder created successfully"}
    except Exception as e:
        logger.error(f"Error creating folder {req.folder_path}: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")

def build_tree(dir_path: str, base_path: str):
    """
    Recursively builds a tree structure of the files and folders.
    """
    tree = []
    try:
        items = os.listdir(dir_path)
    except PermissionError:
        return []

    for item in items:
        full_path = os.path.join(dir_path, item)
        rel_path = os.path.relpath(full_path, base_path)
        
        if os.path.isdir(full_path):
            tree.append({
                "name": item,
                "type": "folder",
                "path": rel_path,
                "children": build_tree(full_path, base_path)
            })
        else:
            tree.append({
                "name": item,
                "type": "file",
                "path": rel_path
            })
            
    tree.sort(key=lambda x: (0 if x["type"] == "folder" else 1, x["name"].lower()))
    return tree

@router.get("")
def list_folders():
    """
    Retrieves the entire nested tree structure of files and folders in the workspace.
    """
    try:
        if not os.path.exists(STORAGE_PATH):
            return []
        return build_tree(STORAGE_PATH, STORAGE_PATH)
    except Exception as e:
        logger.error(f"Error listing folders: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")

@router.delete("/{folder_path:path}")
def delete_folder(folder_path: str):
    """
    Deletes a folder and all of its contents. Also purges associated chunks 
    from the Qdrant vector database.
    """
    full_path = get_safe_path(folder_path)
    if not os.path.exists(full_path) or full_path == STORAGE_PATH:
        raise HTTPException(status_code=404, detail="Folder not found")
        
    try:
        shutil.rmtree(full_path)
        logger.info(f"Deleted folder and its contents: {folder_path}")
        
        qdrant = get_qdrant_client()
        collection_name = os.getenv("QDRANT_COLLECTION_NAME", "documents")
        folder_name = os.path.basename(full_path)
        
        qdrant.delete(
            collection_name=collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="folder_name",
                        match=MatchValue(value=folder_name)
                    )
                ]
            )
        )
        logger.info(f"vectors deleted for folder: {folder_name}")
        
        return {"message": "Folder and contents deleted"}
    except Exception as e:
        logger.error(f"Error deleting folder and contents {folder_path}: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")
