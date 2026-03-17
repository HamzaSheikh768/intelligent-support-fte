"""
Database session management with asyncpg connection pool
"""

from typing import AsyncGenerator
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
import logging
import os

logger = logging.getLogger(__name__)


# Fix DATABASE_URL for asyncpg compatibility
def get_asyncpg_url():
    """Get DATABASE_URL fixed for asyncpg."""
    url = settings.DATABASE_URL
    if 'asyncpg' not in url:
        url = url.replace('postgresql://', 'postgresql+asyncpg://')
    # Remove query params that asyncpg doesn't support
    if '?' in url:
        url = url.split('?')[0]
    return url


# Create async engine
engine = create_async_engine(
    get_asyncpg_url(),
    echo=settings.is_development,  # Log SQL queries in development
    pool_pre_ping=True,  # Verify connections before use
    pool_size=10,  # Number of connections to keep open
    max_overflow=20,  # Additional connections allowed
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={'ssl': True},  # SSL for Neon
)


# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session for dependency injection.
    
    Yields:
        AsyncSession: Database session
    
    Example:
        ```python
        @app.get("/items")
        async def get_items(session: AsyncSession = Depends(get_session)):
            # Use session here
        ```
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database - create all tables.
    
    This should be called on application startup.
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed (running without database): {e}")
        # Continue without database - useful for development


async def cleanup_db() -> None:
    """
    Cleanup database connections.
    
    This should be called on application shutdown.
    """
    await engine.dispose()
