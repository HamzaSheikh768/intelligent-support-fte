"""
Application configuration using pydantic-settings
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "DEBUG"
    SECRET_KEY: str = "change-me-in-production"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://fte_user:fte_password@localhost:5432/fte_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "fte_user"
    POSTGRES_PASSWORD: str = "fte_password"
    POSTGRES_DB: str = "fte_db"
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_TICKETS_INCOMING: str = "fte.tickets.incoming"
    KAFKA_TOPIC_ESCALATIONS: str = "fte.escalations"
    KAFKA_TOPIC_METRICS: str = "fte.metrics"
    
    # OpenRouter API Configuration
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "gpt-4o"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Returns:
        Settings: Application settings
    """
    return Settings()


# Global settings instance
# Reset cache on module reload for development
import os
if os.getenv('ENVIRONMENT') == 'development':
    get_settings.cache_clear()

settings = get_settings()
