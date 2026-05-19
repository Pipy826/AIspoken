"""用户学习数据聚合：会话、时长、连续天、报告指标（全部来自数据库）"""
from __future__ import annotations

from calendar import monthrange
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from . import models, schemas


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _today_utc() -> date:
    return _utcnow().date()


def _month_bounds_utc() -> Tuple[datetime, datetime]:
    now = _utcnow()
    # 使用 naive datetime（无时区），与 SQLite 存储格式一致
    start = datetime(now.year, now.month, 1, 0, 0, 0)
    last = monthrange(now.year, now.month)[1]
    end = datetime(now.year, now.month, last, 23, 59, 59, 999999)
    return start, end + timedelta(microseconds=1)


def _day_bounds(d: date) -> Tuple[datetime, datetime]:
    # 使用 naive datetime（无时区），与 SQLite 存储格式一致
    start = datetime(d.year, d.month, d.day)
    return start, start + timedelta(days=1)


def today_study_minutes(db: Session, user_id: int) -> int:
    start, end = _day_bounds(_today_utc())
    v = (
        db.query(func.coalesce(func.sum(models.StudySession.duration_minutes), 0))
        .filter(
            models.StudySession.user_id == user_id,
            models.StudySession.created_at >= start,
            models.StudySession.created_at < end,
        )
        .scalar()
    )
    return int(v or 0)


def month_session_count(db: Session, user_id: int) -> int:
    start, end = _month_bounds_utc()
    return (
        db.query(func.count(models.StudySession.id))
        .filter(
            models.StudySession.user_id == user_id,
            models.StudySession.created_at >= start,
            models.StudySession.created_at < end,
        )
        .scalar()
        or 0
    )


def essay_count(db: Session, user_id: int) -> int:
    return db.query(func.count(models.Essay.id)).filter(models.Essay.user_id == user_id).scalar() or 0


def distinct_study_dates(db: Session, user_id: int) -> set:
    rows = (
        db.query(func.date(models.StudySession.created_at))
        .filter(models.StudySession.user_id == user_id)
        .distinct()
        .all()
    )
    out: set = set()
    for (d,) in rows:
        if d is None:
            continue
        if isinstance(d, str):
            y, m, day = (int(x) for x in d.split("-")[:3])
            out.add(date(y, m, day))
        else:
            out.add(d)
    return out


def compute_streak(db: Session, user_id: int) -> int:
    dates = distinct_study_dates(db, user_id)
    if not dates:
        return 0
    today = _today_utc()
    yesterday = today - timedelta(days=1)
    if today in dates:
        cursor = today
    elif yesterday in dates:
        cursor = yesterday
    else:
        return 0
    n = 0
    while cursor in dates:
        n += 1
        cursor -= timedelta(days=1)
    return n


def sync_user_aggregate(db: Session, user: models.User) -> None:
    uid = user.id
    user.total_sessions = (
        db.query(func.count(models.StudySession.id)).filter(models.StudySession.user_id == uid).scalar() or 0
    )
    total_m = (
        db.query(func.coalesce(func.sum(models.StudySession.duration_minutes), 0))
        .filter(models.StudySession.user_id == uid)
        .scalar()
    )
    user.total_minutes = int(total_m or 0)
    user.total_days = (
        db.query(func.count(distinct(func.date(models.StudySession.created_at))))
        .filter(models.StudySession.user_id == uid)
        .scalar()
        or 0
    )
    user.streak = compute_streak(db, uid)


def record_study_session(
    db: Session,
    user: models.User,
    session_type: str,
    duration_minutes: int,
    score: Optional[float],
    details: Optional[Dict[str, Any]],
) -> models.StudySession:
    row = models.StudySession(
        user_id=user.id,
        session_type=session_type,
        duration_minutes=max(0, int(duration_minutes)),
        score=score,
        details=details,
    )
    db.add(row)
    db.flush()
    sync_user_aggregate(db, user)
    return row


def today_goal_progress(db: Session, user_id: int, total: int = 5) -> Tuple[int, int]:
    start, end = _day_bounds(_today_utc())
    done = (
        db.query(func.count(models.StudySession.id))
        .filter(
            models.StudySession.user_id == user_id,
            models.StudySession.created_at >= start,
            models.StudySession.created_at < end,
        )
        .scalar()
        or 0
    )
    return min(int(done), total), total


def week_minutes_series(db: Session, user_id: int) -> List[int]:
    today = _today_utc()
    monday = today - timedelta(days=today.weekday())
    out: List[int] = []
    for i in range(7):
        d = monday + timedelta(days=i)
        a, b = _day_bounds(d)
        m = (
            db.query(func.coalesce(func.sum(models.StudySession.duration_minutes), 0))
            .filter(
                models.StudySession.user_id == user_id,
                models.StudySession.created_at >= a,
                models.StudySession.created_at < b,
            )
            .scalar()
        )
        out.append(int(m or 0))
    return out


def month_minutes_series(db: Session, user_id: int) -> List[int]:
    """返回本月每周的学习分钟数（最多5周）"""
    today = _today_utc()
    first_day = date(today.year, today.month, 1)
    last_day_num = monthrange(today.year, today.month)[1]
    out: List[int] = []
    week_start = first_day
    while week_start.day <= last_day_num:
        week_end_day = min(week_start.day + 6, last_day_num)
        week_end = date(today.year, today.month, week_end_day)
        a = datetime(week_start.year, week_start.month, week_start.day)
        b = datetime(week_end.year, week_end.month, week_end.day) + timedelta(days=1)
        m = (
            db.query(func.coalesce(func.sum(models.StudySession.duration_minutes), 0))
            .filter(
                models.StudySession.user_id == user_id,
                models.StudySession.created_at >= a,
                models.StudySession.created_at < b,
            )
            .scalar()
        )
        out.append(int(m or 0))
        week_start = week_end + timedelta(days=1)
        if week_start.month != today.month:
            break
    return out


def year_minutes_series(db: Session, user_id: int) -> List[int]:
    """返回本年每月的学习分钟数（12个月）"""
    today = _today_utc()
    out: List[int] = []
    for month in range(1, 13):
        last_day = monthrange(today.year, month)[1]
        a = datetime(today.year, month, 1)
        b = datetime(today.year, month, last_day) + timedelta(days=1)
        m = (
            db.query(func.coalesce(func.sum(models.StudySession.duration_minutes), 0))
            .filter(
                models.StudySession.user_id == user_id,
                models.StudySession.created_at >= a,
                models.StudySession.created_at < b,
            )
            .scalar()
        )
        out.append(int(m or 0))
    return out


def period_minutes_series(db: Session, user_id: int, period: str) -> List[int]:
    """根据 period 返回对应的学习时长序列"""
    if period == "month":
        return month_minutes_series(db, user_id)
    elif period == "year":
        return year_minutes_series(db, user_id)
    else:
        return week_minutes_series(db, user_id)


def aggregate_radar_and_scores(
    db: Session, user_id: int
) -> Tuple[schemas.RadarData, float, float, float, float]:
    speak_rows = (
        db.query(models.StudySession)
        .filter(
            models.StudySession.user_id == user_id,
            models.StudySession.session_type == "speak",
        )
        .order_by(models.StudySession.created_at.desc())
        .limit(40)
        .all()
    )
    dims_acc: Dict[str, List[float]] = {
        "pronunciation": [],
        "grammar": [],
        "vocabulary": [],
        "fluency": [],
    }
    speak_scores: List[float] = []
    for r in speak_rows:
        sc = (r.details or {}).get("scores") or {}
        if sc.get("total") is not None:
            try:
                speak_scores.append(float(sc["total"]))
            except (TypeError, ValueError):
                pass
        for d in sc.get("dims") or []:
            key = str(d.get("key", ""))
            if key not in dims_acc:
                continue
            try:
                pct = float(d.get("pct", 0))
            except (TypeError, ValueError):
                continue
            dims_acc[key].append(pct * 100 if pct <= 1 else pct)

    def avg(lst: List[float], default: float = 0.0) -> int:
        if not lst:
            return int(default)
        return int(round(sum(lst) / len(lst)))

    pronunciation = avg(dims_acc["pronunciation"])
    grammar = avg(dims_acc["grammar"])
    vocabulary = avg(dims_acc["vocabulary"])
    fluency = avg(dims_acc["fluency"])

    essays = (
        db.query(models.Essay)
        .filter(models.Essay.user_id == user_id)
        .order_by(models.Essay.created_at.desc())
        .limit(25)
        .all()
    )
    writing_vals: List[float] = []
    logic_vals: List[float] = []
    write_overall: List[float] = []
    for e in essays:
        if e.overall_score is not None:
            write_overall.append(float(e.overall_score))
        cr = e.correction_result or {}
        for dim in cr.get("dimensions") or []:
            try:
                sc = float(dim.get("score", 0))
            except (TypeError, ValueError):
                continue
            pct = sc / 9.0 * 100 if sc <= 10 else sc
            lab = str(dim.get("label", ""))
            key = str(dim.get("key", ""))
            if "结构" in lab or key == "structure" or "连贯" in lab or "coherence" in key:
                writing_vals.append(pct)
            if "逻辑" in lab or key == "logic" or "task" in key.lower():
                logic_vals.append(pct)

    if write_overall:
        base = sum(write_overall) / len(write_overall) / 9.0 * 100
        if not writing_vals:
            writing_vals.append(base)
        if not logic_vals:
            logic_vals.append(base * 0.92)

    writing = avg(writing_vals, 0)
    logic = avg(logic_vals, 0)

    speak_avg = round(sum(speak_scores) / len(speak_scores), 2) if speak_scores else 0.0
    write_avg = round(sum(write_overall) / len(write_overall), 2) if write_overall else 0.0

    older_speak = speak_rows[20:40] if len(speak_rows) > 20 else []
    os_scores: List[float] = []
    for r in older_speak:
        sc = (r.details or {}).get("scores") or {}
        if sc.get("total") is not None:
            try:
                os_scores.append(float(sc["total"]))
            except (TypeError, ValueError):
                pass
    older_avg = sum(os_scores) / len(os_scores) if os_scores else speak_avg
    speak_trend = round(speak_avg - older_avg, 2) if speak_scores else 0.0

    older_essays = essays[10:25] if len(essays) > 10 else []
    o_scores = [float(x.overall_score) for x in older_essays if x.overall_score is not None]
    older_w = sum(o_scores) / len(o_scores) if o_scores else write_avg
    write_trend = round(write_avg - older_w, 2) if write_overall else 0.0

    radar = schemas.RadarData(
        pronunciation=min(100, pronunciation),
        grammar=min(100, grammar),
        vocabulary=min(100, vocabulary),
        fluency=min(100, fluency),
        writing=min(100, writing),
        logic=min(100, logic),
    )
    return radar, speak_avg, write_avg, speak_trend, write_trend


def persist_annotation_errors(db: Session, user_id: int, annotations: Optional[List[Any]]) -> int:
    """将作文批注中的问题写入错题本。"""
    if not annotations:
        return 0
    n = 0
    for raw in annotations:
        d = raw.model_dump() if hasattr(raw, "model_dump") else dict(raw)
        t = d.get("type")
        if t not in ("error", "warning"):
            continue
        original = d.get("original")
        suggestion = d.get("suggestion")
        if not original or not suggestion:
            continue
        err_type = "grammar" if t == "error" else "vocab"
        db.add(
            models.ErrorItem(
                user_id=user_id,
                error_type=err_type,
                content=str(original)[:500],
                correction=str(suggestion)[:500],
            )
        )
        n += 1
    return n


def estimate_write_duration_minutes(essay: str) -> int:
    t = essay.strip()
    if not t:
        return 1
    if any("\u4e00" <= c <= "\u9fff" for c in t):
        return max(1, min(45, len(t) // 120))
    words = len(t.split())
    return max(1, min(40, words // 80))


def estimate_speak_duration_minutes(messages: List[Dict[str, str]]) -> int:
    n_user = sum(1 for m in messages if m.get("role") == "user")
    return max(1, min(30, n_user * 2))


def reset_daily_quota_if_needed(db: Session, user: models.User) -> bool:
    """如果今天还没重置过，重置免费用户的每日使用次数。返回是否发生了重置。"""
    if user.is_vip:
        return False
    today_str = _today_utc().strftime("%Y-%m-%d")
    if user.last_reset_date == today_str:
        return False  # 今天已重置过
    user.speak_remaining = 5
    user.write_remaining = 2
    user.last_reset_date = today_str
    db.commit()
    return True


def home_recommendations(db: Session, user_id: int) -> List[schemas.HomeRecommendItem]:
    """根据历史弱项生成推荐（仍无记录时用通用推荐）。"""
    radar, _, _, _, _ = aggregate_radar_and_scores(db, user_id)
    items: List[schemas.HomeRecommendItem] = []
    weak = [
        ("发音", radar.pronunciation, "volume", "每日跟读 · 地道发音", "重音 & 连读专项训练", "speak"),
        ("语法", radar.grammar, "edit", "语法巩固 · 错题复习", "结合最近作文批改查漏补缺", "write"),
        ("流利度", radar.fluency, "mic", "流利度强化 · 对话", "加长连续输出，减少停顿", "speak"),
    ]
    weak.sort(key=lambda x: x[1])
    for _, _score, icon, title, desc, target in weak[:2]:
        action = "去口语" if target == "speak" else "去作文"
        items.append(schemas.HomeRecommendItem(icon=icon, title=title, desc=desc, action_label=action))
    if len(items) < 3:
        items.append(
            schemas.HomeRecommendItem(
                icon="book",
                title="金句积累 · 雅思口语",
                desc="高分表达与例句",
                action_label="查看",
            )
        )
    return items[:3]
