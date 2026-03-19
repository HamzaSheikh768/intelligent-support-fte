"""
API Router aggregation
"""

from fastapi import APIRouter
from .v1.support import router as support_router
from .v1.escalations import router as escalations_router
from .v1.admin import router as admin_router

# Create v1 router
v1_router = APIRouter(prefix="/v1")

# Include v1 routers
v1_router.include_router(support_router, prefix="/support", tags=["support"])
v1_router.include_router(escalations_router, tags=["escalations"])
v1_router.include_router(admin_router, prefix="/admin", tags=["admin"])
