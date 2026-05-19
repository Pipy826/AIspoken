from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..ai_service import AIUnavailableError, evaluate_exam
from ..auth import get_current_user
from ..database import get_db
from ..stats_service import record_study_session

router = APIRouter(prefix="/api/exam", tags=["全真模考"])

EXAM_TYPES = [
    {
        "id": "ielts",
        "name": "雅思",
        "icon": "graduation-cap",
        "color": "#4A6CF7",
        "parts": ["口语 Part 1", "口语 Part 2", "口语 Part 3"],
        "duration": 14,
    },
    {
        "id": "toefl",
        "name": "托福",
        "icon": "globe",
        "color": "#64b5f6",
        "parts": ["Independent Speaking", "Integrated Speaking"],
        "duration": 20,
    },
    {
        "id": "cet6",
        "name": "四六级",
        "icon": "book-open",
        "color": "#ba68c8",
        "parts": ["口语考试", "写作"],
        "duration": 15,
    },
    {
        "id": "gaokao",
        "name": "高考",
        "icon": "home",
        "color": "#ff8a65",
        "parts": ["英语写作", "口语"],
        "duration": 20,
    },
    {
        "id": "postgrad",
        "name": "考研",
        "icon": "target",
        "color": "#4db6ac",
        "parts": ["英语写作", "翻译"],
        "duration": 30,
    },
]


@router.get("/types")
def get_exam_types():
    return EXAM_TYPES


@router.post("/result", response_model=schemas.ExamResultResponse)
async def submit_exam_result(
    data: schemas.ExamResultRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    text = (data.transcript or "").strip()
    # 过滤掉占位文本，允许空转写（AI 会给出通用评分）
    placeholder_texts = {"（未提供转写文本）", "(no transcript provided)"}
    if text in placeholder_texts:
        text = ""
    if len(text) > 0 and len(text) < 5:
        raise HTTPException(status_code=400, detail="请提交有效的口语转写文本")

    try:
        result = await evaluate_exam(data.exam_type, text or None)
    except AIUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    record_study_session(
        db,
        current_user,
        "exam",
        max(1, data.duration_seconds // 60),
        float(result.overall),
        {"exam_type": data.exam_type, "result": result.model_dump()},
    )
    db.commit()
    return result


@router.get("/history")
def get_exam_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sessions = (
        db.query(models.StudySession)
        .filter(
            models.StudySession.user_id == current_user.id,
            models.StudySession.session_type == "exam",
        )
        .order_by(models.StudySession.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": s.id,
            "exam_type": (s.details or {}).get("exam_type", ""),
            "score": s.score,
            "duration_minutes": s.duration_minutes,
            "created_at": s.created_at,
        }
        for s in sessions
    ]
