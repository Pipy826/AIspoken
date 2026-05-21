"""
TTS 服务 —— 优先使用 edge-tts（微软在线语音，音质好），
fallback 到 pyttsx3（离线）。
"""
import io
import os
import re
import tempfile
import threading


async def text_to_speech(text: str, scene: str = "free", voice_key: str = None) -> bytes:
    """
    将英文文本转为音频字节。
    优先使用 edge-tts（需要网络），失败则 fallback 到 pyttsx3。
    """
    # 清理 HTML 标签
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if not clean_text:
        return b''

    # 尝试 edge-tts
    try:
        return await _edge_tts(clean_text, voice_key)
    except Exception as e:
        print(f"[TTS] edge-tts 失败: {e}，尝试 pyttsx3 fallback")

    # Fallback: pyttsx3
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _pyttsx3_tts, clean_text)
    except Exception as e:
        print(f"[TTS] pyttsx3 也失败: {e}")
        return b''


async def _edge_tts(text: str, voice_key: str = None) -> bytes:
    """使用 edge-tts 生成语音"""
    import edge_tts

    voice = voice_key or "en-US-JennyNeural"
    communicate = edge_tts.Communicate(text, voice)
    audio_buffer = io.BytesIO()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    data = audio_buffer.getvalue()
    if not data:
        raise RuntimeError("edge-tts 返回空音频")
    return data


_engine_lock = threading.Lock()


def _pyttsx3_tts(text: str) -> bytes:
    """使用 pyttsx3 离线生成语音（fallback）"""
    import pyttsx3

    with _engine_lock:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        for v in voices:
            if 'zira' in v.name.lower() or 'english' in v.name.lower():
                engine.setProperty('voice', v.id)
                break
        engine.setProperty('rate', 160)
        engine.setProperty('volume', 1.0)

        tmp = tempfile.mktemp(suffix='.wav')
        try:
            engine.save_to_file(text, tmp)
            engine.runAndWait()
            if os.path.exists(tmp):
                with open(tmp, 'rb') as f:
                    return f.read()
            return b''
        finally:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            try:
                engine.stop()
            except Exception:
                pass


def get_available_voices():
    """返回可用的 TTS 声音列表"""
    return [
        {"key": "en-US-JennyNeural", "name": "Jenny", "label": "Jenny (女声)"},
        {"key": "en-US-GuyNeural", "name": "Guy", "label": "Guy (男声)"},
        {"key": "en-US-AriaNeural", "name": "Aria", "label": "Aria (女声)"},
        {"key": "en-GB-SoniaNeural", "name": "Sonia", "label": "Sonia (英式女声)"},
    ]
