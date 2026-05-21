from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

_BACKEND_DIR = Path(__file__).resolve().parent.parent


def _resolve_db_url(url: str) -> str:
    """将相对路径的 SQLite URL 解析为基于 backend/ 目录的绝对路径"""
    if url.startswith("sqlite:///./"):
        relative = url.replace("sqlite:///./", "")
        absolute = _BACKEND_DIR / relative
        return f"sqlite:///{absolute}"
    return url


_db_url = _resolve_db_url(settings.DATABASE_URL)

engine = create_engine(
    _db_url,
    connect_args={"check_same_thread": False} if "sqlite" in _db_url else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
