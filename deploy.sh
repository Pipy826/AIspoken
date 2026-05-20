#!/bin/bash
# ============================================================
# AI 口语·作文教练 一键部署脚本
# 适配：Ubuntu 22.04 + Python 3.10 + Node 20
# 服务器：121.43.250.191:5173
# 使用：cd ~/AIspoken && sudo bash deploy.sh
# ============================================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="121.43.250.191"
PORT=5173
BACKEND_PORT=8000

echo "=========================================="
echo "  AI 口语·作文教练 一键部署"
echo "  项目目录: $APP_DIR"
echo "  访问地址: http://$DOMAIN:$PORT"
echo "=========================================="
echo ""

# ── 1. 后端 Python 环境 ──────────────────────────────
echo "[1/6] 配置后端 Python 环境..."
cd "$APP_DIR/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
pip install --quiet edge-tts
deactivate
echo "  ✓ 后端依赖安装完成"

# ── 2. 配置 .env ─────────────────────────────────────
echo ""
echo "[2/6] 配置环境变量..."
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
SECRET_KEY=ai-coach-production-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite:///./ai_coach.db
OPENAI_API_KEY=sk-5d7db2b6a6aa4e548e104fb2932398ed
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
CORS_ORIGINS=http://121.43.250.191:5173,http://localhost:5173
HF_ENDPOINT=https://hf-mirror.com
ENVEOF
    echo "  ✓ .env 已创建（使用默认 API Key）"
else
    echo "  ✓ .env 已存在，跳过"
fi

# ── 3. TTS 服务适配 Linux ─────────────────────────────
echo ""
echo "[3/6] 配置 Linux TTS 服务..."
cat > "$APP_DIR/backend/app/tts_service.py" << 'TTSEOF'
"""TTS 服务 - Linux 部署版，优先 edge-tts，fallback espeak"""
import io, os, re, tempfile, subprocess

async def text_to_speech(text: str, scene: str = "free", voice_key: str = None) -> bytes:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if not clean_text:
        return b''
    # 尝试 edge-tts
    try:
        import edge_tts
        voice = "en-US-JennyNeural"
        communicate = edge_tts.Communicate(clean_text, voice)
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        data = buf.getvalue()
        if data:
            return data
    except Exception:
        pass
    # Fallback: espeak
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _espeak_tts, clean_text)

def _espeak_tts(text: str) -> bytes:
    tmp = tempfile.mktemp(suffix='.wav')
    try:
        subprocess.run(['espeak', '-v', 'en', '-s', '150', '-w', tmp, text], capture_output=True, timeout=10)
        if os.path.exists(tmp):
            with open(tmp, 'rb') as f:
                return f.read()
    except Exception:
        pass
    finally:
        try: os.unlink(tmp)
        except: pass
    return b''

def get_available_voices():
    return [{"key": "en-US-JennyNeural", "name": "Jenny", "label": "English Female"}]
TTSEOF
echo "  ✓ TTS 服务已配置"

# ── 4. 下载 Whisper 模型 ──────────────────────────────
echo ""
echo "[4/6] 检查 Whisper 模型..."
WHISPER_DIR="$APP_DIR/backend/models/whisper-small"
mkdir -p "$WHISPER_DIR"

if [ ! -f "$WHISPER_DIR/model.bin" ]; then
    echo "  下载 Whisper small 模型（约 500MB，请耐心等待）..."
    cd "$APP_DIR/backend"
    source venv/bin/activate
    pip install --quiet huggingface_hub
    python3 -c "
import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from huggingface_hub import snapshot_download
snapshot_download('Systran/faster-whisper-small', local_dir='$WHISPER_DIR')
print('  ✓ 模型下载完成')
"
    deactivate
else
    echo "  ✓ 模型已存在，跳过"
fi

# ── 5. 前端构建 ──────────────────────────────────────
echo ""
echo "[5/6] 构建前端..."
cd "$APP_DIR/frontend"
npm install --quiet 2>/dev/null
npm run build
echo "  ✓ 前端构建完成"

# ── 6. 配置 Nginx + Systemd ──────────────────────────
echo ""
echo "[6/6] 配置 Nginx 和系统服务..."

# Nginx 配置
cat > /etc/nginx/sites-available/ai-coach << EOF
server {
    listen $PORT;
    server_name $DOMAIN;

    root $APP_DIR/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
        client_max_body_size 20M;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/ai-coach /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null
nginx -t && systemctl restart nginx
echo "  ✓ Nginx 已配置"

# Systemd 服务
cat > /etc/systemd/system/ai-coach.service << EOF
[Unit]
Description=AI Coach Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend
Environment=PATH=$APP_DIR/backend/venv/bin:/usr/bin:/bin
ExecStart=$APP_DIR/backend/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port $BACKEND_PORT
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ai-coach
systemctl restart ai-coach
echo "  ✓ 后端服务已启动"

# ── 完成 ─────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  访问地址: http://$DOMAIN:$PORT"
echo ""
echo "  确保阿里云安全组已开放 $PORT 端口！"
echo ""
echo "  常用命令："
echo "    查看后端日志: journalctl -u ai-coach -f"
echo "    重启后端:    systemctl restart ai-coach"
echo "    重启Nginx:   systemctl restart nginx"
echo "    编辑配置:    nano $APP_DIR/backend/.env"
echo ""
