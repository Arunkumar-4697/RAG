"""
The `routers` package contains all the FastAPI APIRouter instances used to segregate
the backend application endpoints logically.
This `__init__.py` exposes the directory as a standard Python module and provides a method to include all routers.
"""
from fastapi import FastAPI
from . import folders, files, search, config, stats, conversations, health

def include_routers(app: FastAPI):
    app.include_router(health.router)
    app.include_router(folders.router)
    app.include_router(files.router)
    app.include_router(search.router)
    app.include_router(config.router)
    app.include_router(stats.router)
    app.include_router(conversations.router)
