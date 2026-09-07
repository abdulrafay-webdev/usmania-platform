import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    IMAGEKIT_PUBLIC_KEY: str = ""
    IMAGEKIT_PRIVATE_KEY: str = ""
    IMAGEKIT_URL_ENDPOINT: str = ""
    
    SECRET_KEY: str = "h4ye6ng78f4lp3h749jkmh70njd86km3"
    JWT_SECRET_KEY: str = "jamia-usmania-jwt-secret-key-2026-auth-access-control"
    JWT_EXPIRY_MINUTES: int = 1440 # 24 hours
    
    # SMTP Email Configuration (Gmail)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "jamiausmaniatrust1994@gmail.com"
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Jamia Usmania Trust"
    
    # Frontend Base URL for reset links
    APP_BASE_URL: str = "https://usmania-platform.vercel.app"
    
    # Initial Super Admin Seed
    INITIAL_ADMIN_EMAIL: str = "usmaniatrust@gmail.com"
    INITIAL_ADMIN_PASSWORD: str = "Usmania@1994"
    INITIAL_ADMIN_NAME: str = "Super Administrator"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
