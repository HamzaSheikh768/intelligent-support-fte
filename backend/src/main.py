"""
FastAPI application - Main entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.config import settings
from .core.logging import setup_logging, get_logger
from .database.session import init_db, cleanup_db
from .api.routers import v1_router

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting Customer Success FTE API...")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Customer Success FTE API...")
    await cleanup_db()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Customer Success FTE API",
    description="24/7 AI-powered customer support across Email, WhatsApp, and Web",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(v1_router, prefix="/api")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "channels": {
            "email": "active",
            "whatsapp": "active",
            "web_form": "active",
        },
    }


@app.get("/")
async def root():
    """
    Root endpoint - API information.
    
    Returns:
        dict: API information
    """
    return {
        "name": "Customer Success FTE API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# Import datetime for health check
from datetime import datetime
