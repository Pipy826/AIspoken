from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session

from .. import models, schemas
from ..ai_service import AIUnavailableError, chat_speak
from ..auth import get_current_user
from ..database import get_db
from ..stats_service import estimate_speak_duration_minutes, record_study_session, reset_daily_quota_if_needed
from ..tts_service import text_to_speech, get_available_voices

router = APIRouter(prefix="/api/speak", tags=["口语教练"])


@router.post("/chat", response_model=schemas.SpeakResponse)
async def speak_chat(
    data: schemas.SpeakRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # 每日重置
    reset_daily_quota_if_needed(db, current_user)

    messages = [{"role": m.role, "content": m.content} for m in data.messages]
    try:
        result = await chat_speak(data.scene, messages)
    except AIUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    score = None
    if result.scores and result.scores.get("total") is not None:
        try:
            score = float(result.scores["total"])
        except (TypeError, ValueError):
            pass

    record_study_session(
        db,
        current_user,
        "speak",
        estimate_speak_duration_minutes(messages),
        score,
        {"scene": data.scene, "scores": result.scores},
    )

    db.commit()
    return result


@router.post("/tts")
async def speak_tts(
    data: schemas.TTSRequest,
    current_user: models.User = Depends(get_current_user),
):
    """将文本转为语音（MP3），用于 AI 回复的语音播放"""
    try:
        audio_bytes = await text_to_speech(
            text=data.text,
            scene=data.scene or "free",
            voice_key=data.voice,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"语音合成失败：{str(e)}")

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="文本为空，无法生成语音")

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={"Content-Disposition": "inline; filename=tts.wav"},
    )


@router.get("/voices")
def get_voices():
    """获取可用的 TTS 声音列表"""
    return get_available_voices()


@router.post("/voice-chat")
async def voice_chat(
    audio: UploadFile = File(default=None),
    scene: str = Form(default="free"),
    history: str = Form(default="[]"),
    transcript: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    语音对话：接收用户语音或已识别文本，返回 AI 语音回复。
    
    支持两种模式：
    1. 发送 audio 文件 → 后端 Whisper 识别 → AI 对话 → TTS
    2. 发送 transcript 文本（浏览器端已识别）→ AI 对话 → TTS
    """
    import json
    import base64

    # 每日重置
    reset_daily_quota_if_needed(db, current_user)

    # 确定用户说的话
    user_text = ""

    if audio:
        # 使用后端 Whisper 模型识别语音
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="音频文件为空")
        try:
            from ..stt_service import transcribe_audio, is_model_available
            if not is_model_available():
                raise HTTPException(status_code=503, detail="语音识别模型未安装，请联系管理员")
            stt_result = transcribe_audio(audio_bytes, language="")
            detected_lang = stt_result.get("language", "")
            user_text = stt_result.get("text", "").strip()
            # 检测到非英文时提示用户说英文
            if user_text and detected_lang != "en":
                raise HTTPException(status_code=400, detail="请说英文哦～Please speak in English!")
        except HTTPException:
            raise
        except Exception as e:
            print(f"[voice-chat] Whisper 识别失败: {e}")
            raise HTTPException(status_code=500, detail=f"语音识别失败：{str(e)}")
    elif transcript.strip():
        # 兼容文本直传模式（APP 端可能自带 STT）
        user_text = transcript.strip()

    if not user_text:
        raise HTTPException(status_code=400, detail="未识别到语音内容，请说话声音大一些或录音时间长一些再试")

    # 构建对话历史并调用 AI
    try:
        prev_messages = json.loads(history)
    except (json.JSONDecodeError, TypeError):
        prev_messages = []

    messages = prev_messages + [{"role": "user", "content": user_text}]

    try:
        result = await chat_speak(scene, messages)
    except AIUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # 记录学习数据
    score = None
    if result.scores and result.scores.get("total") is not None:
        try:
            score = float(result.scores["total"])
        except (TypeError, ValueError):
            pass

    record_study_session(
        db, current_user, "speak",
        estimate_speak_duration_minutes(messages),
        score,
        {"scene": scene, "scores": result.scores},
    )

    db.commit()

    # TTS 合成 AI 回复
    try:
        audio_reply = await text_to_speech(result.reply, scene)
        audio_b64 = base64.b64encode(audio_reply).decode("utf-8") if audio_reply else ""
    except Exception as e:
        print(f"[voice-chat] TTS 失败: {e}")
        audio_b64 = ""

    return {
        "user_text": user_text,
        "reply": result.reply,
        "audio_base64": audio_b64,
        "tip": result.tip,
        "scores": result.scores,
    }


@router.get("/scenes")
def get_scenes():
    return [
        {"id": "free", "label": "自由对话", "icon": "chat"},
        {"id": "interview", "label": "职场面试", "icon": "briefcase"},
        {"id": "ielts", "label": "雅思模考", "icon": "clipboard"},
        {"id": "travel", "label": "旅行出行", "icon": "plane"},
        {"id": "business", "label": "商务谈判", "icon": "handshake"},
        {"id": "campus", "label": "校园生活", "icon": "school"},
    ]


# ── 对话历史 ──────────────────────────────────────────

@router.get("/conversations")
def get_conversations(
    scene: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """获取用户的对话列表，可按场景筛选"""
    query = db.query(models.Conversation).filter(models.Conversation.user_id == current_user.id)
    if scene:
        query = query.filter(models.Conversation.scene == scene)
    convs = query.order_by(models.Conversation.updated_at.desc()).limit(50).all()
    return [
        {
            "id": c.id,
            "scene": c.scene,
            "message_count": len(c.messages or []),
            "last_message": (c.messages or [])[-1].get("content", "")[:50] if c.messages else "",
            "updated_at": str(c.updated_at),
            "created_at": str(c.created_at),
        }
        for c in convs
    ]


@router.get("/conversations/{conv_id}")
def get_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """获取单个对话的完整消息"""
    conv = (
        db.query(models.Conversation)
        .filter(models.Conversation.id == conv_id, models.Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    return {
        "id": conv.id,
        "scene": conv.scene,
        "messages": conv.messages or [],
        "last_scores": conv.last_scores,
        "updated_at": str(conv.updated_at),
    }


@router.post("/conversations/save")
def save_conversation(
    data: schemas.SaveConversationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """保存/更新对话记录"""
    if data.id:
        # 更新已有对话
        conv = (
            db.query(models.Conversation)
            .filter(models.Conversation.id == data.id, models.Conversation.user_id == current_user.id)
            .first()
        )
        if conv:
            conv.messages = data.messages
            conv.scene = data.scene
            conv.last_scores = data.last_scores
            db.commit()
            return {"id": conv.id, "status": "updated"}

    # 创建新对话
    conv = models.Conversation(
        user_id=current_user.id,
        scene=data.scene,
        messages=data.messages,
        last_scores=data.last_scores,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {"id": conv.id, "status": "created"}


@router.delete("/conversations/{conv_id}")
def delete_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """删除对话"""
    conv = (
        db.query(models.Conversation)
        .filter(models.Conversation.id == conv_id, models.Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    db.delete(conv)
    db.commit()
    return {"status": "deleted"}
