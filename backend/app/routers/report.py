from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..stats_service import (
    aggregate_radar_and_scores,
    essay_count,
    today_study_minutes,
    period_minutes_series,
)

router = APIRouter(prefix="/api/report", tags=["学习报告"])


@router.get("", response_model=schemas.ReportResponse)
def get_report(
    period: str = "month",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    uid = current_user.id
    radar, speak_score, write_score, speak_trend, write_trend = aggregate_radar_and_scores(db, uid)
    history = period_minutes_series(db, uid, period)

    # 生成对应的标签
    from datetime import date as _date, timedelta as _td
    from calendar import monthrange as _mr
    import datetime as _dt
    today = _date.today()
    labels: list = []
    if period == "week":
        weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        monday = today - _td(days=today.weekday())
        for i in range(7):
            d = monday + _td(days=i)
            if d == today:
                labels.append('今天')
            else:
                labels.append(weekdays[d.weekday()])
    elif period == "month":
        first_day = _date(today.year, today.month, 1)
        last_day_num = _mr(today.year, today.month)[1]
        week_start = first_day
        week_idx = 1
        while week_start.day <= last_day_num:
            week_end_day = min(week_start.day + 6, last_day_num)
            labels.append(f'第{week_idx}周')
            week_idx += 1
            week_start = _date(today.year, today.month, week_end_day) + _td(days=1)
            if week_start.month != today.month:
                break
    elif period == "year":
        labels = [f'{m}月' for m in range(1, 13)]

    today_m = today_study_minutes(db, uid)
    essays = essay_count(db, uid)
    avg_dim = (
        radar.pronunciation
        + radar.grammar
        + radar.vocabulary
        + radar.fluency
        + radar.writing
        + radar.logic
    ) / 6.0
    percentile = int(min(96, max(18, round(avg_dim * 0.65 + min(current_user.total_sessions, 25) * 1.2))))

    return schemas.ReportResponse(
        period=period,
        radar=radar,
        study_history=history,
        study_labels=labels,
        speak_score=speak_score,
        write_score=write_score,
        speak_trend=speak_trend,
        write_trend=write_trend,
        today_minutes=today_m,
        essay_count=essays,
        percentile=percentile,
    )


@router.get("/error-book")
def get_error_book(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.ErrorItem)
        .filter(models.ErrorItem.user_id == current_user.id)
        .order_by(models.ErrorItem.created_at.desc())
        .limit(20)
        .all()
    )
    total = db.query(models.ErrorItem).filter(models.ErrorItem.user_id == current_user.id).count()
    today_review = (
        db.query(models.ErrorItem)
        .filter(
            models.ErrorItem.user_id == current_user.id,
            models.ErrorItem.reviewed == False,  # noqa: E712
        )
        .count()
    )
    return {
        "total": total,
        "today_review": today_review,
        "items": [schemas.ErrorItemOut.model_validate(item) for item in items],
    }


@router.post("/error-book/{item_id}/review")
def review_error_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """标记错题为已复习"""
    item = (
        db.query(models.ErrorItem)
        .filter(models.ErrorItem.id == item_id, models.ErrorItem.user_id == current_user.id)
        .first()
    )
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="错题不存在")
    item.reviewed = True
    db.commit()
    return {"success": True, "message": "已标记为已复习"}


@router.get("/ai-insight")
def get_ai_insight(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """AI 数据洞察 - 基于用户真实学习数据生成建议"""
    from ..stats_service import aggregate_radar_and_scores, today_study_minutes, compute_streak

    radar, speak_score, write_score, speak_trend, write_trend = aggregate_radar_and_scores(db, current_user.id)
    today_m = today_study_minutes(db, current_user.id)
    streak = compute_streak(db, current_user.id)

    # 找最弱维度
    dims = {
        "发音": radar.pronunciation, "语法": radar.grammar,
        "词汇": radar.vocabulary, "流利度": radar.fluency,
        "写作": radar.writing, "逻辑": radar.logic,
    }
    weakest = min(dims, key=dims.get)
    strongest = max(dims, key=dims.get)

    tips = []
    if speak_trend > 0:
        tips.append(f"口语流利度提升 +{speak_trend:.1f}，继续保持每日对话练习")
    elif speak_score > 0:
        tips.append(f"口语评分 {speak_score:.1f}，建议增加每日对话频率")

    if write_trend > 0:
        tips.append(f"作文评分提升 +{write_trend:.1f}，写作能力稳步进步")
    elif write_score > 0:
        tips.append(f"作文逻辑得分偏低，建议重点练习论证结构")

    if streak >= 7:
        tips.append(f"已连续学习 {streak} 天，坚持就是胜利！")
    elif streak > 0:
        tips.append(f"连续学习 {streak} 天，再坚持 {7 - streak} 天解锁成就")

    tips.append(f"{strongest}是你的强项（{dims[strongest]}%），继续保持")

    return {
        "tips": tips,
        "weakest_area": weakest,
        "strongest_area": strongest,
        "suggestion": f"本周重点关注{weakest}专项训练",
        "today_minutes": today_m,
        "streak": streak,
    }
