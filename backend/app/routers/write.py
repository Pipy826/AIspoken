from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..ai_service import AIUnavailableError, correct_essay
from ..auth import get_current_user
from ..database import get_db
from ..stats_service import (
    estimate_write_duration_minutes,
    persist_annotation_errors,
    record_study_session,
    reset_daily_quota_if_needed,
)

router = APIRouter(prefix="/api/write", tags=["作文批改"])

TOPICS = [
    {"id": 5, "year": "2026", "type": "练习", "genre": "议论文", "wordCount": 280, "text": "论科技对生活的影响"},
    {
        "id": 1,
        "year": "2026",
        "type": "雅思",
        "genre": "议论文",
        "wordCount": 250,
        "text": "Some people think that the best way to reduce crime is to give longer prison sentences. To what extent do you agree or disagree?",
    },
    {
        "id": 2,
        "year": "2025",
        "type": "雅思",
        "genre": "议论文",
        "wordCount": 250,
        "text": "Some people believe that it is best to accept a bad situation. Others argue that it is better to try to improve such situations. Discuss both views and give your own opinion.",
    },
    {
        "id": 3,
        "year": "2026",
        "type": "托福",
        "genre": "综合写作",
        "wordCount": 300,
        "text": "Do you agree or disagree: Technology has made it easier for people to connect with others.",
    },
    {
        "id": 4,
        "year": "2025",
        "type": "高考",
        "genre": "应用文",
        "wordCount": 150,
        "text": "假设你是李华，请写一封回信，介绍一个你最喜欢的中国传统节日。",
    },
]


@router.get("/topics")
def get_topics():
    return TOPICS


@router.post("/correct", response_model=schemas.WriteResponse)
async def correct(
    data: schemas.WriteRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    essay_len = len(data.essay.strip())
    if essay_len < 50:
        raise HTTPException(status_code=400, detail="作文内容过短，请至少输入 50 字")
    if essay_len > 3000:
        raise HTTPException(status_code=400, detail="作文内容过长，请控制在 3000 字以内")

    topic_text = data.topic_text.strip() or "（无指定题目，请对作文进行综合批改）"

    try:
        result = await correct_essay(topic_text, data.essay, data.mode)
    except AIUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    essay = models.Essay(
        user_id=current_user.id,
        topic_id=data.topic_id,
        content=data.essay,
        mode=data.mode,
        overall_score=result.overall,
        correction_result=result.model_dump(),
    )
    db.add(essay)
    db.flush()

    persist_annotation_errors(db, current_user.id, list(result.annotations)[:12])

    record_study_session(
        db,
        current_user,
        "write",
        estimate_write_duration_minutes(data.essay),
        float(result.overall),
        {"topic_id": data.topic_id, "mode": data.mode, "essay_id": essay.id},
    )

    db.commit()
    return result


@router.post("/ocr")
async def ocr_image(
    data: dict,
    current_user: models.User = Depends(get_current_user),
):
    """使用 AI 识别图片中的题目文字"""
    from ..ai_service import get_client, require_ai
    from ..config import settings
    import json

    require_ai()

    image_data = data.get("image", "")
    if not image_data:
        raise HTTPException(status_code=400, detail="未提供图片")

    # 如果模型支持 vision（如 GPT-4o），使用图片输入
    # DeepSeek 目前不支持 vision，用文本提示让用户知道
    # 这里我们尝试用 DeepSeek 的文本能力做 base64 图片描述
    # 如果模型不支持 vision，返回提示

    try:
        client = get_client()
        # 尝试发送带图片的请求（兼容支持 vision 的模型）
        resp = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "你是一个 OCR 工具。请识别图片中的所有文字内容，原样输出，不要添加任何解释。如果是英语作文题目，请完整输出题目要求。只输出 JSON：{\"text\": \"识别到的文字\"}"
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "请识别这张图片中的文字内容："},
                        {"type": "image_url", "image_url": {"url": image_data}},
                    ],
                },
            ],
            temperature=0.1,
            max_tokens=500,
        )
        raw = resp.choices[0].message.content or ""
        # 尝试解析 JSON
        try:
            result = json.loads(raw)
            return {"text": result.get("text", raw)}
        except json.JSONDecodeError:
            # 直接返回文本
            return {"text": raw.strip()}
    except Exception as e:
        error_msg = str(e)
        if "image" in error_msg.lower() or "vision" in error_msg.lower() or "content" in error_msg.lower():
            raise HTTPException(
                status_code=400,
                detail="当前 AI 模型不支持图片识别，请手动输入题目"
            )
        raise HTTPException(status_code=500, detail=f"OCR 识别失败：{error_msg}")
