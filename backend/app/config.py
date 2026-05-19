from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    DATABASE_URL: str = "sqlite:///./ai_coach.db"

    OPENAI_API_KEY: str = "sk-placeholder"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"

    MONTHLY_SESSION_GOAL: int = 10  # 本月练习次数目标（首页环形进度）

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    def openai_key_configured(self) -> bool:
        k = (self.OPENAI_API_KEY or "").strip()
        if not k:
            return False
        blocked = (
            "sk-placeholder",
            "your-api-key",
            "sk-your-api-key",
            "sk-your-api-key-here",
        )
        if k.lower() in {b.lower() for b in blocked}:
            return False
        return True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
