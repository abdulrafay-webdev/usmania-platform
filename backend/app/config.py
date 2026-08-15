import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://neondb_owner:npg_lnYmWDI2B4ji@ep-soft-waterfall-ayulgoo7.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
    IMAGEKIT_PUBLIC_KEY: str = "public_HDD3aZeYcPD+AfTBm7Aonpm8RGI="
    IMAGEKIT_PRIVATE_KEY: str = "private_2CFi1ujCbatChFCoANT/0O045qA="
    IMAGEKIT_URL_ENDPOINT: str = "https://ik.imagekit.io/usmania"
    SECRET_KEY: str = "h4ye6ng78f4lp3h749jkmh70njd86km3"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
