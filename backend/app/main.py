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
