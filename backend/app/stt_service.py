"""
STT 服务 —— 使用本地 faster-whisper 模型进行语音识别。
模型文件放在 backend/models/whisper-small/ 目录下。
"""
import io
import tempfile
import os
from pathlib import Path
from typing import Optional

_model = None
# 本地模型路径（相对于 backend 目录）
_model_path = str(Path(__file__).parent.parent / "models" / "whisper-small")


def get_model():
    """懒加载 Whisper 模型（单例），使用本地模型文件"""
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        
        # 检查本地模型文件是否存在
        model_bin = os.path.join(_model_path, "model.bin")
        if not os.path.exists(model_bin):
            raise RuntimeError(
                f"Whisper 模型文件不存在：{model_bin}\n"
                "请从 https://huggingface.co/Systran/faster-whisper-small 下载以下文件到 backend/models/whisper-small/ 目录：\n"
                "  - config.json\n  - model.bin\n  - tokenizer.json\n  - vocabulary.txt"
            )
        
        # 直接使用本地路径加载，不需要网络
        _model = WhisperModel(
            _model_path,
            device="cpu",
            compute_type="int8",
        )
    return _model


def is_model_available() -> bool:
    """检查 Whisper 模型文件是否已下载到本地"""
    model_bin = os.path.join(_model_path, "model.bin")
    return os.path.exists(model_bin)


def transcribe_audio(audio_bytes: bytes, language: str = "en") -> dict:
    """
    将音频字节转为文本。
    
    Args:
        audio_bytes: 音频文件的字节内容（支持 webm, wav, mp3, ogg 等格式）
        language: 语言代码，默认英语
    
    Returns:
        {
            "text": "识别到的完整文本",
            "segments": [{"start": 0.0, "end": 1.5, "text": "..."}],
            "language": "en",
            "duration": 5.2
        }
    """
    model = get_model()
    
    # 将音频字节写入临时文件（faster-whisper 需要文件路径）
    suffix = ".webm"  # 浏览器录音通常是 webm 格式
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language=language,
            beam_size=5,
            vad_filter=True,  # 过滤静音段
        )
        
        result_segments = []
        full_text = ""
        for segment in segments:
            result_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
            })
            full_text += segment.text
        
        return {
            "text": full_text.strip(),
            "segments": result_segments,
            "language": info.language,
            "duration": round(info.duration, 2),
        }
    finally:
        # 清理临时文件
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
