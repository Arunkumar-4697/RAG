from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader
import os

API_KEY_HEADER = APIKeyHeader(name="X-App-Token", auto_error=False)

def verify_app_key(api_key_header: str = Security(API_KEY_HEADER)):
    expected_key = os.getenv("APP_KEY")
    if expected_key:
        if api_key_header != expected_key:
            raise HTTPException(status_code=403, detail="Could not validate credentials")
    return api_key_header
