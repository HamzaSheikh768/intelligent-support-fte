"""Debug script to check settings"""
import sys
sys.path.insert(0, 'src')

from core.config import settings

print("=" * 60)
print("DATABASE_URL:", settings.DATABASE_URL)
print("ENVIRONMENT:", settings.ENVIRONMENT)
print("OPENROUTER_API_KEY:", settings.OPENROUTER_API_KEY[:10] + "..." if settings.OPENROUTER_API_KEY else "NOT SET")
print("=" * 60)

# Check if URL contains asyncpg
if "asyncpg" in settings.DATABASE_URL:
    print("✅ DATABASE_URL is correct (uses asyncpg)")
else:
    print("❌ DATABASE_URL is WRONG (should use postgresql+asyncpg)")
    print("\nFix: Update .env file with:")
    print("DATABASE_URL=postgresql+asyncpg://fte_user:fte_password@localhost:5432/fte_db")
