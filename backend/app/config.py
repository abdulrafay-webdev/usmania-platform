import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./jamia_usmania.db"
    IMAGEKIT_PUBLIC_KEY: str = ""
    IMAGEKIT_PRIVATE_KEY: str = ""
    IMAGEKIT_URL_ENDPOINT: str = ""
    SECRET_KEY: str = "super-secret-jamia-key-2026"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
