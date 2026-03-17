"""
DATABASE SETUP SCRIPT
=====================
Quick script to initialize the database with all tables.

Usage:
    python setup_database.py
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Force load correct DATABASE_URL from .env file
from dotenv import load_dotenv
load_dotenv()

# Now import settings (will use the loaded env)
from src.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from src.database import models  # noqa: F401 - Import registers models


async def setup_database():
    """Create all database tables."""
    print("=" * 60)
    print("DATABASE SETUP")
    print("=" * 60)
    
    # Override with explicit asyncpg URL if needed
    database_url = os.getenv('DATABASE_URL', '')
    if 'asyncpg' not in database_url:
        print("⚠️  WARNING: DATABASE_URL missing 'asyncpg'. Fixing...")
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://')
    
    # Fix asyncpg-specific parameters - remove query params and handle SSL separately
    if 'asyncpg' in database_url:
        # Remove all query params - asyncpg handles SSL differently
        if '?' in database_url:
            base_url = database_url.split('?')[0]
            database_url = base_url
            print("ℹ️  Removing query parameters for asyncpg compatibility")
    
    os.environ['DATABASE_URL'] = database_url
    
    # Reload settings
    from importlib import reload
    import src.core.config
    reload(src.core.config)
    from src.core.config import settings as new_settings
    globals()['settings'] = new_settings
    
    print(f"\nDatabase URL: {settings.DATABASE_URL[:50]}...")
    
    # Create engine with explicit SSL settings for Neon
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,  # Show SQL
        pool_pre_ping=True,
        connect_args={'ssl': True},  # Explicit SSL for Neon
    )
    
    print("\nCreating tables...")
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    print("\n✅ Database tables created successfully!")
    
    # List tables
    from sqlalchemy import text
    
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result.fetchall()]
        
        print(f"\nCreated tables ({len(tables)}):")
        for table in tables:
            print(f"  - {table}")
    
    await engine.dispose()
    
    print("\n" + "=" * 60)
    print("SETUP COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(setup_database())
