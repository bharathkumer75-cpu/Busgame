import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tamil Nadu 3D Bus Simulator Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_tamil_nadu_bus_sim_key_2026_jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite default, or PostgreSQL if configured
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bussimulator.db")
    
    # Initial player rewards
    STARTING_COINS: int = 25000
    STARTING_EXPERIENCE: int = 0
    STARTING_FUEL: float = 100.0  # Percentage

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
