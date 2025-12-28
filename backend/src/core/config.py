"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # ChromaDB Settings (local, no API key needed)
    CHROMADB_PERSIST_DIR: str = "data/chromadb"
    
    # Groq Settings
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  # Fast and powerful model from Groq
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    
    # Embedding Settings (using free sentence-transformers)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"  # Free, fast, 384 dimensions
    
    # Application Settings
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra env vars


settings = Settings()
