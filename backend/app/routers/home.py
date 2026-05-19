"""首页仪表盘：数据来自学习会话聚合"""
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..stats_service import compute_streak, home_recommendations, month_session_count, today_study_minutes

router = APIRouter(prefix="/api/home", tags=["首页"])


def _greeting_prefix() -> str:
    h = datetime.now().hour
    if 5 <= h < 12:
        return "早上好"
    if 12 <= h < 18:
        return "下午好"
    return "晚上好"


@router.get("/dashboard", response_model=schemas.HomeDashboard)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target = settings.MONTHLY_SESSION_GOAL
    done = min(target, month_session_count(db, current_user.id))
    ring = min(100, int(round(done / target * 100))) if target else 0
    bar = ring  # 进度条与环形进度保持一致

    today_m = today_study_minutes(db, current_user.id)
    streak = compute_streak(db, current_user.id)
    sub = f"今日学习 {today_m} 分钟 · 连续学习 {streak} 天"

    recs = home_recommendations(db, current_user.id)

    return schemas.HomeDashboard(
        greeting_prefix=_greeting_prefix(),
        display_name=current_user.username,
        greeting_sub=sub,
        monthly_goal=schemas.HomeMonthlyGoal(
            label=f"本月目标：完成 {target} 次练习",
            target=target,
            done=done,
            ring_percent=max(0, min(100, ring)),
            bar_percent=max(0, min(100, bar)),
            sub_text=f"已达成 {done}/{target} · 剩余 {max(0, target - done)} 次",
        ),
        recommendations=recs,
    )
