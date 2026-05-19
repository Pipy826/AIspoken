#!/bin/bash
# ============================================================
# AI 口语·作文教练 一键部署脚本
# 目标服务器：121.43.250.191:5173
# 系统要求：Ubuntu 20.04+ / Debian 11+
# 使用方法：
#   1. 将整个项目上传到服务器 /opt/ai-coach/
#   2. chmod +x deploy.sh
#   3. sudo ./deploy.sh
# ============================================================

set -e

APP_DIR="/opt/ai-coach"
DOMAIN="121.43.250.191"
PORT=5173
BACKEND_PORT=8000

echo "=========================================="
echo "  AI 口语·作文教练 部署脚本"
echo "  服务器: $DOMAIN:$PORT"
echo "=========================================="

# ── 1. 系统依赖 ──────────────────────────────────────
echo ""
echo "[1/8] 安装系统依赖..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv nodejs npm nginx curl git espeak libespeak-dev

# 确保 Node.js 版本 >= 18
NODE_VER=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ] 2>/dev/null; then
    echo "  升级 Node.js 到 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

echo "  Python: $(python3 --version)"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"

# ── 2. 项目目录 ──────────────────────────────────────
echo ""
echo "[2/8] 设置项目目录..."
mkdir -p $APP_DIR
cd $APP_DIR

# 如果脚本不在 APP_DIR 运行，复制文件
if [ "$(pwd)" != "$(dirname $(readlink -f $0))" ]; then
    SCRIPT_DIR="$(dirname $(readlink -f $0))"
    cp -r $SCRIPT_DIR/* $APP_DIR/ 2>/dev/null || true
    cp -r $SCRIPT_DIR/.* $APP_DIR/ 2>/dev/null || true
fi

# ── 3. 后端设置 ──────────────────────────────────────
echo ""
echo "[3/8] 设置后端..."
cd $APP_DIR/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# 配置 .env（如果不存在）
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "  ⚠️  请编辑 $APP_DIR/backend/.env 填入你的 DeepSeek API Key"
    echo "  vim $APP_DIR/backend/.env"
fi

# TTS 服务：Linux 上使用 edge-tts（服务器通常能访问微软服务）
# 如果 edge-tts 不可用，fallback 到 espeak
pip install --quiet edge-tts

deactivate

# ── 4. 下载 Whisper 模型 ──────────────────────────────
echo ""
echo "[4/8] 检查 Whisper 模型..."
WHISPER_DIR="$APP_DIR/backend/models/whisper-small"
mkdir -p $WHISPER_DIR

if [ ! -f "$WHISPER_DIR/model.bin" ]; then
    echo "  下载 Whisper small 模型（约 500MB）..."
    pip install --quiet huggingface_hub
    python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('Systran/faster-whisper-small', local_dir='$WHISPER_DIR')
print('  模型下载完成')
"
else
    echo "  模型已存在，跳过下载"
fi

# ── 5. 前端构建 ──────────────────────────────────────
echo ""
echo "[5/8] 构建前端..."
cd $APP_DIR/frontend
npm install --quiet
npm run build

# ── 6. TTS 服务适配 Linux ─────────────────────────────
echo ""
echo "[6/8] 配置 Linux TTS 服务..."
cat > $APP_DIR/backend/app/tts_service.py << 'TTSEOF'
"""
TTS 服务 —— Linux 部署版本，优先使用 edge-tts，fallback 到 espeak。
"""
import io
import os
import re
import tempfile
import subprocess

async def text_to_speech(text: str, scene: str = "free", voice_key: str = None) -> bytes:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if not clean_text:
        return b''

    # 尝试 edge-tts
    try:
        import edge_tts
        voice = "en-US-JennyNeural"
        communicate = edge_tts.Communicate(clean_text, voice)
        audio_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])
        data = audio_buffer.getvalue()
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
        subprocess.run(
            ['espeak', '-v', 'en', '-s', '150', '-w', tmp, text],
            capture_output=True, timeout=10
        )
        if os.path.exists(tmp):
            with open(tmp, 'rb') as f:
                return f.read()
    except Exception:
        pass
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass
    return b''


def get_available_voices():
    return [{"key": "en-US-JennyNeural", "name": "Jenny", "label": "English Female"}]
TTSEOF

# ── 7. Systemd 服务 ──────────────────────────────────
echo ""
echo "[7/8] 配置系统服务..."

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

echo "  后端服务已启动"

# ── 8. Nginx 配置 ─────────────────────────────────────
echo ""
echo "[8/8] 配置 Nginx..."

cat > /etc/nginx/sites-available/ai-coach << EOF
server {
    listen $PORT;
    server_name $DOMAIN;

    # 前端静态文件
    root $APP_DIR/frontend/dist;
    index index.html;

    # API 反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
        client_max_body_size 20M;
    }

    # Vue Router history 模式
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/ai-coach /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null

# 测试并重启 Nginx
nginx -t && systemctl restart nginx

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  访问地址: http://$DOMAIN:$PORT"
echo ""
echo "  ⚠️  重要：请确认以下事项："
echo "  1. 编辑 $APP_DIR/backend/.env 填入 DeepSeek API Key"
echo "  2. 服务器防火墙开放 $PORT 端口"
echo "  3. 如需 HTTPS，配置 SSL 证书"
echo ""
echo "  常用命令："
echo "  查看后端日志: journalctl -u ai-coach -f"
echo "  重启后端:    systemctl restart ai-coach"
echo "  重启 Nginx:  systemctl restart nginx"
echo ""
