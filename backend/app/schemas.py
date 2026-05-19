from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar: str
    is_vip: bool
    vip_expiry: Optional[str]
    streak: int
    total_days: int
    total_sessions: int
    total_minutes: int
    speak_remaining: int
    write_remaining: int
    created_at: Optional[datetime] = None
    today_goal: dict = {"done": 0, "total": 5}
    streak_dates: List[str] = []   # 近 14 天已打卡日期，格式 "YYYY-MM-DD"

    class Config:
        from_attributes = True


# ── Speak ─────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str           # user | assistant
    content: str


class SpeakRequest(BaseModel):
    scene: str
    messages: List[ChatMessage]


class TTSRequest(BaseModel):
    text: str
    scene: Optional[str] = "free"
    voice: Optional[str] = None  # 可选指定声音 key


class SpeakResponse(BaseModel):
    reply: str
    tip: Optional[dict] = None
    scores: Optional[dict] = None


class SaveConversationRequest(BaseModel):
    id: Optional[int] = None
    scene: str = "free"
    messages: List[Dict[str, Any]] = []
    last_scores: Optional[Dict[str, Any]] = None


# ── Write ─────────────────────────────────────────────
class WriteRequest(BaseModel):
    topic_id: Optional[int] = None
    topic_text: str = ""
    essay: str
    mode: str = "quick"   # quick | deep


class AnnotationItem(BaseModel):
    original: str
    type: str             # error | warning | good
    suggestion: str


class DimensionScore(BaseModel):
    key: str
    label: str
    score: float
    color: str


class WriteSummary(BaseModel):
    strengths: List[str]
    improvements: List[str]


class GradingLevelItem(BaseModel):
    """四层批改梯度（与前端原型一致）"""
    dot: str       # green | orange | blue | purple
    category: str  # 如：基础纠错
    text: str


class WriteResponse(BaseModel):
    overall: float
    dimensions: List[DimensionScore]
    summary: WriteSummary
    annotations: List[AnnotationItem]
    optimized: str
    grading_levels: List[GradingLevelItem] = Field(default_factory=list)


# ── Home 首页 ───────────────────────────────────────────
class HomeRecommendItem(BaseModel):
    icon: str
    title: str
    desc: str
    action_label: str


class HomeMonthlyGoal(BaseModel):
    label: str
    target: int
    done: int
    ring_percent: int
    bar_percent: int
    sub_text: str


class HomeDashboard(BaseModel):
    greeting_prefix: str
    display_name: str
    greeting_sub: str
    monthly_goal: HomeMonthlyGoal
    recommendations: List[HomeRecommendItem]


# ── VIP ────────────────────────────────────────────────
class VipPlanItem(BaseModel):
    id: str
    price_display: str
    price_sub: str
    name: str
    tag: Optional[str] = None
    note: Optional[str] = None
    highlight: bool = False


class VipPlansResponse(BaseModel):
    banner_title: str
    banner_desc: str
    badges: List[str]
    plans: List[VipPlanItem]
    features: List[str]
    addons: List[Dict[str, str]]


# ── Exam ──────────────────────────────────────────────
class ExamResultRequest(BaseModel):
    exam_type: str
    duration_seconds: int
    transcript: Optional[str] = None


class ExamResultResponse(BaseModel):
    overall: float
    pronunciation: float
    grammar: float
    fluency: float
    comment: str


# ── Report ────────────────────────────────────────────
class RadarData(BaseModel):
    pronunciation: int
    grammar: int
    vocabulary: int
    fluency: int
    writing: int
    logic: int


class ReportResponse(BaseModel):
    period: str
    radar: RadarData
    study_history: List[int]
    study_labels: List[str] = []   # 对应 study_history 的标签
    speak_score: float
    write_score: float
    speak_trend: float
    write_trend: float
    today_minutes: int = 0
    essay_count: int = 0
    percentile: int = 0


# ── Error Book ────────────────────────────────────────
class ErrorItemOut(BaseModel):
    id: int
    error_type: str
    content: str
    correction: str
    reviewed: bool
    created_at: datetime

    class Config:
        from_attributes = True
