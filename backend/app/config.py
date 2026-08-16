import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://neondb_owner:npg_lnYmWDI2B4ji@ep-soft-waterfall-ayulgoo7.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
    IMAGEKIT_PUBLIC_KEY: str = "public_HDD3aZeYcPD+AfTBm7Aonpm8RGI="
    IMAGEKIT_PRIVATE_KEY: str = "private_2CFi1ujCbatChFCoANT/0O045qA="
    IMAGEKIT_URL_ENDPOINT: str = "https://ik.imagekit.io/usmania"
    
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
