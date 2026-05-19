from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=schemas.Token)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="邮箱已注册")

    user = models.User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return schemas.Token(access_token=token)


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    """JSON 登录接口：{ username, password }"""
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token({"sub": user.id})
    return schemas.Token(access_token=token)


@router.post("/login/form", response_model=schemas.Token)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Form 登录接口（兼容 OAuth2 标准，供 Swagger UI 使用）"""
    user = db.query(models.User).filter(models.User.username == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token({"sub": user.id})
    return schemas.Token(access_token=token)


@router.get("/me", response_model=schemas.UserOut)
def get_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from ..stats_service import today_goal_progress, distinct_study_dates, _today_utc, reset_daily_quota_if_needed
    from datetime import timedelta

    # 每日重置免费用户次数
    reset_daily_quota_if_needed(db, current_user)

    done, total = today_goal_progress(db, current_user.id)
    # 近 14 天打卡日期
    today = _today_utc()
    study_dates = distinct_study_dates(db, current_user.id)
    streak_dates = [
        (today - timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(14)
        if (today - timedelta(days=i)) in study_dates
    ]
    base = schemas.UserOut.model_validate(current_user)
    return base.model_copy(update={
        "today_goal": {"done": done, "total": total},
        "streak_dates": streak_dates,
    })
