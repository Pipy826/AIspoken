"""
AI 服务层 —— 调用 OpenAI 兼容接口。
未在 .env 中配置有效 OPENAI_API_KEY 时抛出 AIUnavailableError（由路由返回 503）。
"""
import json
import re
from typing import List, Optional

from openai import AsyncOpenAI, APITimeoutError, APIConnectionError, AuthenticationError, APIStatusError

from .config import settings
from .schemas import (
    ExamResultResponse,
    SpeakResponse,
    WriteResponse,
)

_client: Optional[AsyncOpenAI] = None
_client_api_key: Optional[str] = None


class AIUnavailableError(Exception):
    """未配置有效 API Key 或无法连接模型服务"""

    def __init__(self, message: str | None = None):
        super().__init__(
            message
            or "未配置有效的 OPENAI_API_KEY。请在 backend/.env 中设置真实密钥与 OPENAI_BASE_URL。"
        )


def get_client() -> AsyncOpenAI:
    """获取 OpenAI 客户端，当 .env 中的 Key 变化时自动重建"""
    global _client, _client_api_key
    # 每次重新读取配置，检测 Key 是否变化
    from .config import Settings
    current_settings = Settings()
    current_key = current_settings.OPENAI_API_KEY.strip()

    if _client is None or current_key != _client_api_key:
        _client = AsyncOpenAI(
            api_key=current_key,
            base_url=current_settings.OPENAI_BASE_URL,
            timeout=60.0,
        )
        _client_api_key = current_key
    return _client


def reset_client():
    """强制重置客户端（认证失败时调用）"""
    global _client, _client_api_key
    _client = None
    _client_api_key = None


def require_ai() -> None:
    """检查 AI 是否可用（每次重新读取 .env，支持热更新 Key）"""
    from .config import Settings
    current_settings = Settings()
    if not current_settings.openai_key_configured():
        raise AIUnavailableError()


# ── 口语教练（结构化 JSON 输出）──────────────────────────
SCENE_NAMES = {
    "free": "自由对话",
    "interview": "职场面试",
    "ielts": "雅思口语模考",
    "travel": "旅行出行",
    "business": "商务谈判",
    "campus": "校园生活",
}

SPEAK_JSON_SYSTEM = """你是专业英语口语教练「小鱼」。当前场景：{scene}
根据对话用英文回复学生（面向其最新消息）。语气自然、简洁（不超过 4 句英文）。

你必须只输出一个 JSON 对象（不要 markdown，不要前后说明文字），结构如下：
{{
  "reply": "string，英文回复，可含简单 HTML 如 <span class=\\"highlight-good\\">短语</span>",
  "tip": null 或 {{"label":"中文短标签","content":"中文提示"}},
  "scores": {{
    "total": 数字,
    "max": 9,
    "dims": [
      {{"key":"pronunciation","label":"发音","pct":0-100的整数}},
      {{"key":"grammar","label":"语法","pct":0-100的整数}},
      {{"key":"vocabulary","label":"词汇","pct":0-100的整数}},
      {{"key":"fluency","label":"流利度","pct":0-100的整数}}
    ],
    "tags": [{{"text":"中文短评","warn":false}},{{"text":"...","warn":true}}],
    "coaching": "中文一句可操作的建议"
  }}
}}
total 为 0-9 的一位小数；dims 必须恰好 4 项且 key 与示例一致；tags 2-4 条。"""


async def chat_speak(scene: str, messages: list) -> SpeakResponse:
    require_ai()
    system = SPEAK_JSON_SYSTEM.format(scene=SCENE_NAMES.get(scene, scene))
    openai_msgs: List[dict] = [{"role": "system", "content": system}]
    for m in messages[-12:]:
        openai_msgs.append({"role": m["role"], "content": m["content"]})

    try:
        resp = await get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=openai_msgs,
            temperature=0.75,
            max_tokens=900,
            response_format={"type": "json_object"},
        )
    except AuthenticationError as e:
        reset_client()
        raise AIUnavailableError("API Key 无效或已过期，请在 backend/.env 中更新 OPENAI_API_KEY 并重试") from e
    except (APITimeoutError, APIConnectionError) as e:
        raise AIUnavailableError(f"AI 服务请求超时或连接失败，请稍后重试：{e}") from e
    except APIStatusError as e:
        raise AIUnavailableError(f"AI 服务返回错误（{e.status_code}）：{e.message}") from e
    raw = resp.choices[0].message.content or "{}"
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # 尝试提取 markdown 代码块中的 JSON
        match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", raw, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(1))
            except json.JSONDecodeError:
                raise AIUnavailableError("模型返回非 JSON，请重试")
        else:
            # 尝试找到第一个 { 和最后一个 } 之间的内容
            start = raw.find("{")
            end = raw.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    data = json.loads(raw[start:end + 1])
                except json.JSONDecodeError:
                    raise AIUnavailableError("模型返回非 JSON，请重试")
            else:
                raise AIUnavailableError("模型返回非 JSON，请重试")

    reply = (data.get("reply") or "").strip() or "I'm here — could you say that again?"
    tip = data.get("tip")
    scores = data.get("scores")
    if not isinstance(scores, dict):
        scores = None
    return SpeakResponse(reply=reply, tip=tip if isinstance(tip, dict) else None, scores=scores)


# ── 作文批改 ──────────────────────────────────────────
WRITE_SYSTEM = """你是一位专业的英语写作批改老师（雅思/托福/国内英语考试）。
请对学生的作文进行{mode}批改，只输出一个 JSON 对象（不要 markdown，不要额外文字），结构：
{{
  "overall": <0-9 的一位小数>,
  "dimensions": [
    {{"key":"total","label":"总分","score":<与 overall 相同>,"color":"#4A6CF7"}},
    {{"key":"grammar","label":"语法","score":<0-9>,"color":"#4A6CF7"}},
    {{"key":"logic","label":"逻辑","score":<0-9>,"color":"#4A6CF7"}},
    {{"key":"vocabulary","label":"词汇","score":<0-9>,"color":"#4A6CF7"}},
    {{"key":"structure","label":"结构","score":<0-9>,"color":"#4A6CF7"}}
  ],
  "summary": {{
    "strengths": ["亮点1","亮点2"],
    "improvements": ["待提升1","待提升2"]
  }},
  "annotations": [
    {{"original":"作文中出现的原文片段","type":"error|warning|good","suggestion":"修改建议"}}
  ],
  "optimized": "优化后的全文（HTML，用 <strong> 标出关键改动）",
  "grading_levels": [
    {{"dot":"green","category":"基础纠错","text":"具体说明"}},
    {{"dot":"orange","category":"语言优化","text":"具体说明"}},
    {{"dot":"blue","category":"结构逻辑","text":"具体说明"}},
    {{"dot":"purple","category":"文体适配","text":"具体说明"}}
  ]
}}
annotations 尽量覆盖学生作文中真实出现的片段；grading_levels 必须 4 条且 dot 依次为 green, orange, blue, purple。"""


async def correct_essay(topic: str, essay: str, mode: str) -> WriteResponse:
    require_ai()
    mode_label = "快速（重点指出主要问题）" if mode == "quick" else "深度（逐句分析，全面详尽）"
    prompt = f"题目：{topic}\n\n学生作文：\n{essay}"

    try:
        resp = await get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": WRITE_SYSTEM.format(mode=mode_label)},
                {"role": "user", "content": prompt},
            ],
            temperature=0.25,
            max_tokens=4000,
            response_format={"type": "json_object"},
        )
    except AuthenticationError as e:
        reset_client()
        raise AIUnavailableError("API Key 无效或已过期，请在 backend/.env 中更新 OPENAI_API_KEY 并重试") from e
    except (APITimeoutError, APIConnectionError) as e:
        raise AIUnavailableError(f"AI 服务请求超时或连接失败，请稍后重试：{e}") from e
    except APIStatusError as e:
        raise AIUnavailableError(f"AI 服务返回错误（{e.status_code}）：{e.message}") from e
    raw = resp.choices[0].message.content or "{}"
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # 尝试提取 markdown 代码块中的 JSON
        match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", raw, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(1))
            except json.JSONDecodeError as e:
                raise AIUnavailableError(f"模型返回无效 JSON：{e}") from e
        else:
            start = raw.find("{")
            end = raw.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    data = json.loads(raw[start:end + 1])
                except json.JSONDecodeError as e:
                    raise AIUnavailableError(f"模型返回无效 JSON：{e}") from e
            else:
                raise AIUnavailableError(f"模型返回无效 JSON")

    data.setdefault("grading_levels", [])
    # 为必需字段提供默认值，防止 Pydantic 验证失败
    data.setdefault("overall", 0.0)
    data.setdefault("dimensions", [])
    data.setdefault("summary", {"strengths": [], "improvements": []})
    data.setdefault("annotations", [])
    data.setdefault("optimized", "")
    try:
        return WriteResponse(**data)
    except Exception as e:
        raise AIUnavailableError(f"批改结果格式异常：{e}") from e


# ── 模考评分 ──────────────────────────────────────────
async def evaluate_exam(exam_type: str, transcript: Optional[str]) -> ExamResultResponse:
    require_ai()
    try:
        resp = await get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是英语口语考官。根据转写文本从发音、语法、流利度、整体表现打分。"
                        "只输出 JSON："
                        '{"overall":0-9,"pronunciation":0-9,"grammar":0-9,"fluency":0-9,"comment":"中文+英文简短点评"}'
                    ),
                },
                {"role": "user", "content": f"考试类型：{exam_type}\n\n转写：\n{(transcript or '').strip()}"},
            ],
            temperature=0.2,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
    except AuthenticationError as e:
        reset_client()
        raise AIUnavailableError("API Key 无效或已过期，请在 backend/.env 中更新 OPENAI_API_KEY 并重试") from e
    except (APITimeoutError, APIConnectionError) as e:
        raise AIUnavailableError(f"AI 服务请求超时或连接失败，请稍后重试：{e}") from e
    except APIStatusError as e:
        raise AIUnavailableError(f"AI 服务返回错误（{e.status_code}）：{e.message}") from e
    data = json.loads(resp.choices[0].message.content or "{}")
    return ExamResultResponse(**data)
