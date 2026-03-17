"""
API Router aggregation
"""

from fastapi import APIRouter
from .v1.support import router as support_router

# Create v1 router
v1_router = APIRouter(prefix="/v1")

# Include v1 routers
v1_router.include_router(support_router, prefix="/support", tags=["support"])
