import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from core.env import validate_environment
validate_environment()

from fastapi import FastAPI, Depends
from routers import include_routers
from core.lifespan import lifespan
from core.middleware import add_middleware
from core.security import verify_app_key

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ManDoc", 
    description="Manager Of Documents API V1",
    dependencies=[Depends(verify_app_key)],
    lifespan=lifespan
)

# Enable CORS for frontend
add_middleware(app)

# Include all API routes
include_routers(app)
