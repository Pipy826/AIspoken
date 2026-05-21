from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import auth, speak, write, exam, report, home, vip, improve

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI 口语·作文教练 API",
    description="AI Coach Backend API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(speak.router)
app.include_router(write.router)
app.include_router(exam.router)
app.include_router(report.router)
app.include_router(home.router)
app.include_router(vip.router)
app.include_router(improve.router)


@app.get("/")
def root():
    return {"message": "AI Coach API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
async def preload_whisper():
    """预加载 Whisper 模型，避免首次请求超时"""
    try:
        from .stt_service import is_model_available, get_model
        if is_model_available():
            import asyncio
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, get_model)
            print("[startup] Whisper 模型预加载完成")
    except Exception as e:
        print(f"[startup] Whisper 模型预加载失败（不影响运行）: {e}")
