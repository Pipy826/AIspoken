"""
TTS 服务 —— 使用本地 pyttsx3 引擎（完全离线，使用系统自带语音）。
Windows 自带 Microsoft Zira (英文女声)。
"""
import io
import os
import re
import tempfile
import threading

import pyttsx3

_engine_lock = threading.Lock()


def _create_engine():
    """创建并配置 TTS 引擎"""
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    # 优先选择英文声音
    for v in voices:
        if 'zira' in v.name.lower() or 'david' in v.name.lower() or 'english' in v.name.lower():
            engine.setProperty('voice', v.id)
            break
    engine.setProperty('rate', 160)  # 语速适中
    engine.setProperty('volume', 1.0)
    return engine


async def text_to_speech(text: str, scene: str = "free", voice_key: str = None) -> bytes:
    """
    将英文文本转为 WAV 音频字节（本地离线生成）。
    """
    # 清理 HTML 标签
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if not clean_text:
        return b''

    # pyttsx3 不是线程安全的，需要在同步上下文中运行
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_tts, clean_text)


def _sync_tts(text: str) -> bytes:
    """同步生成 TTS 音频"""
    with _engine_lock:
        engine = _create_engine()
        tmp = tempfile.mktemp(suffix='.wav')
        try:
            engine.save_to_file(text, tmp)
            engine.runAndWait()
            with open(tmp, 'rb') as f:
                return f.read()
        finally:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            engine.stop()


def get_available_voices():
    """返回可用的声音列表"""
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    result = []
    for v in voices:
        result.append({
            "key": v.id,
            "name": v.name,
            "label": v.name,
        })
    engine.stop()
    return result
