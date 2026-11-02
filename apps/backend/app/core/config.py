"""
OneView Monitor — Application Configuration

All settings loaded from environment variables.
Never hardcode secrets or credentials.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    # ── Application ──────────────────────────────────────────────────────
    APP_NAME: str = "OneView Monitor"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["dev", "qa", "uat", "prod"] = "dev"
    DEBUG: bool = False
    DEMO_MODE: bool = True  # Feature flag: ONEVIEW_DEMO_MODE

    # ── API ──────────────────────────────────────────────────────────────
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    API_RATE_LIMIT: int = 100  # requests per minute

    # ── Auth ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://oneview:oneview@localhost:5432/oneview"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # ── Redis ────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Docker ───────────────────────────────────────────────────────────
    DOCKER_HOST: str = "unix:///var/run/docker.sock"
    DOCKER_TLS_VERIFY: bool = False
    DOCKER_CERT_PATH: str = ""
    DOCKER_ENV_ALLOWLIST: list[str] = [
        "NODE_ENV", "PORT", "LOG_LEVEL", "APP_VERSION"
    ]

    # ── AWS S3 ───────────────────────────────────────────────────────────
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # ── Data Freshness ───────────────────────────────────────────────────
    STALE_THRESHOLD_SECONDS: int = 300  # 5 minutes
    LIVE_THRESHOLD_SECONDS: int = 5

    # ── Health Score ─────────────────────────────────────────────────────
    MIN_SIGNALS_FOR_SCORE: int = 3

    model_config = {
        "env_prefix": "ONEVIEW_",
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
