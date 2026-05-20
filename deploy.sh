#!/bin/bash
# ============================================================
# AI 口语·作文教练 Docker 一键部署脚本
# 服务器：121.43.250.191:5173
# 使用：cd ~/AIspoken && sudo bash deploy.sh
# ============================================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="121.43.250.191"
PORT=5173

echo "=========================================="
echo "  AI 口语·作文教练 Docker 部署"
echo "  访问地址: http://$DOMAIN:$PORT"
echo "=========================================="
echo ""

# ── 1. 检查 Docker ───────────────────────────────────
echo "[1/5] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "  安装 Docker..."
    curl -fsSL https://get.docker.com | sh
fi
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "  安装 Docker Compose..."
    apt-get install -y docker-compose-plugin 2>/dev/null || pip install docker-compose
fi
echo "  ✓ Docker $(docker --version | cut -d' ' -f3)"

# ── 2. 配置 .env ─────────────────────────────────────
echo ""
echo "[2/5] 配置环境变量..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
    cat > "$APP_DIR/backend/.env" << 'EOF'
SECRET_KEY=ai-coach-production-secret-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite:///./ai_coach.db
OPENAI_API_KEY=sk-5d7db2b6a6aa4e548e104fb2932398ed
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
CORS_ORIGINS=http://121.43.250.191:5173,http://localhost:5173
HF_ENDPOINT=https://hf-mirror.com
EOF
    echo "  ✓ .env 已创建"
else
    echo "  ✓ .env 已存在"
fi

# ── 3. 下载 Whisper 模型 ──────────────────────────────
echo ""
echo "[3/5] 检查 Whisper 模型..."
WHISPER_DIR="$APP_DIR/backend/models/whisper-small"
mkdir -p "$WHISPER_DIR"

if [ ! -f "$WHISPER_DIR/model.bin" ]; then
    echo "  下载 Whisper 模型（约 500MB）..."
    pip install huggingface_hub 2>/dev/null || pip3 install huggingface_hub
    python3 -c "
import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from huggingface_hub import snapshot_download
snapshot_download('Systran/faster-whisper-small', local_dir='$WHISPER_DIR')
print('  ✓ 模型下载完成')
"
else
    echo "  ✓ 模型已存在"
fi

# ── 4. 构建前端 ──────────────────────────────────────
echo ""
echo "[4/5] 构建前端..."
cd "$APP_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install --quiet 2>/dev/null
fi
npm run build 2>/dev/null
echo "  ✓ 前端构建完成"

# ── 5. 启动 Docker 容器 ──────────────────────────────
echo ""
echo "[5/5] 启动 Docker 容器..."
cd "$APP_DIR"

# 停止旧容器
docker compose down 2>/dev/null || docker-compose down 2>/dev/null

# 构建并启动
docker compose up -d --build 2>/dev/null || docker-compose up -d --build

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
echo "    查看日志:     docker compose logs -f"
echo "    重启服务:     docker compose restart"
echo "    停止服务:     docker compose down"
echo "    查看状态:     docker compose ps"
echo "    编辑配置:     nano $APP_DIR/backend/.env"
echo "    重建部署:     docker compose up -d --build"
echo ""
