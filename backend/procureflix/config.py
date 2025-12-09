"""Configuration for Sourcevia backend - Production ready."""

import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB Configuration
    mongo_url: str = "mongodb://localhost:27017"
    mongo_db_name: str = "sourcevia"
    
    # API Keys
    openai_api_key: Optional[str] = None
    emergent_llm_key: Optional[str] = None  # Backward compatibility
    
    # AI Configuration
    enable_ai: bool = False
    ai_model: str = "gpt-4o"
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:3000,http://localhost:80"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    
    # Environment
    environment: str = "production"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

    def get_allowed_origins_list(self) -> list[str]:
        """Parse ALLOWED_ORIGINS into a list."""
        if not self.allowed_origins:
            return []
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
