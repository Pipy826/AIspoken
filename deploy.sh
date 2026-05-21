#!/bin/bash
# ============================================================
# AI 口语·作文教练 Docker 一键部署脚本
# 前端在宿主机构建，Docker 只跑后端 + Nginx (HTTPS)
# 服务器：121.43.250.191
# 使用：cd ~/AIspoken && sudo bash deploy.sh
# ============================================================

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="121.43.250.191"
PORT=5173

echo "=========================================="
echo "  AI 口语·作文教练 Docker 部署 (HTTPS)"
echo "  访问地址: https://$DOMAIN:$PORT"
echo "=========================================="
echo ""

# ── 0. 检查必要工具 ──────────────────────────────────
echo "[0/8] 检查系统依赖..."

if ! command -v docker &> /dev/null; then
    echo "  安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
    echo "  ✓ Docker 安装完成"
else
    echo "  ✓ Docker 已安装"
fi

if ! docker compose version &> /dev/null; then
    echo "  ❌ docker compose 不可用，请升级 Docker 到最新版本"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "  安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo "  ✓ Node.js 安装完成"
else
    echo "  ✓ Node.js 已安装 ($(node -v))"
fi

if ! command -v openssl &> /dev/null; then
    echo "  安装 openssl..."
    apt-get install -y openssl
fi

echo ""

# ── 1. 停掉冲突服务 ──────────────────────────────────
echo "[1/8] 清理冲突服务..."
systemctl stop ai-coach 2>/dev/null || true
systemctl disable ai-coach 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
cd "$APP_DIR"
docker compose down 2>/dev/null || true
echo "  ✓ 已清理"

# ── 2. 生成 SSL 证书 ─────────────────────────────────
echo ""
echo "[2/8] 配置 SSL 证书..."
SSL_DIR="$APP_DIR/docker/ssl"
mkdir -p "$SSL_DIR"

if [ ! -f "$SSL_DIR/cert.pem" ] || [ ! -f "$SSL_DIR/key.pem" ]; then
    echo "  生成自签名证书（有效期 10 年）..."
    openssl req -x509 -nodes -days 3650 \
        -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=CN/ST=China/L=Beijing/O=AI-Coach/CN=$DOMAIN" \
        -addext "subjectAltName=IP:$DOMAIN,DNS:localhost" \
        2>/dev/null
    echo "  ✓ SSL 证书已生成"
    echo "  ⚠️  首次访问浏览器会提示不安全，点击「高级」→「继续访问」即可"
else
    echo "  ✓ SSL 证书已存在"
fi

# ── 3. 配置 .env ─────────────────────────────────────
echo ""
echo "[3/8] 配置环境变量..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
    if [ -f "$APP_DIR/backend/.env.example" ]; then
        cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
        sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=https://$DOMAIN:$PORT,http://localhost:5173|" "$APP_DIR/backend/.env"
        echo "  ⚠️  .env 已从 .env.example 复制，请编辑填写真实的 OPENAI_API_KEY："
        echo "     vim $APP_DIR/backend/.env"
    else
        cat > "$APP_DIR/backend/.env" << EOF
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite:///./ai_coach.db
OPENAI_API_KEY=请填写你的API_KEY
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
CORS_ORIGINS=https://$DOMAIN:$PORT,http://localhost:5173
MONTHLY_SESSION_GOAL=10
EOF
        echo "  ⚠️  .env 已创建，请编辑填写真实的 OPENAI_API_KEY："
        echo "     vim $APP_DIR/backend/.env"
    fi
else
    # 确保 CORS 包含 https
    if ! grep -q "https://$DOMAIN:$PORT" "$APP_DIR/backend/.env"; then
        sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=https://$DOMAIN:$PORT,http://$DOMAIN:$PORT,http://localhost:5173|" "$APP_DIR/backend/.env"
        echo "  ✓ 已更新 CORS 配置（添加 HTTPS）"
    else
        echo "  ✓ .env 已存在"
    fi
fi

touch "$APP_DIR/backend/ai_coach.db"

# ── 4. 下载 Whisper 模型 ─────────────────────────────
echo ""
echo "[4/8] 检查 Whisper 模型..."
WHISPER_DIR="$APP_DIR/backend/models/whisper-small"
mkdir -p "$WHISPER_DIR"

if [ ! -f "$WHISPER_DIR/model.bin" ]; then
    echo "  下载 Whisper 模型（约 500MB，使用国内镜像）..."
    docker run --rm \
        -v "$WHISPER_DIR:/models" \
        -e HF_ENDPOINT=https://hf-mirror.com \
        python:3.10-slim \
        bash -c "
            pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --quiet huggingface_hub && \
            python -c \"
import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from huggingface_hub import snapshot_download
snapshot_download('Systran/faster-whisper-small', local_dir='/models')
print('  ✓ 模型下载完成')
\"
        "
    if [ ! -f "$WHISPER_DIR/model.bin" ]; then
        echo "  ⚠️  模型下载可能失败，语音识别功能将不可用"
    fi
else
    echo "  ✓ 模型已存在"
fi

# ── 5. 构建前端 ──────────────────────────────────────
echo ""
echo "[5/8] 构建前端..."
cd "$APP_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "  安装前端依赖..."
    npm install --registry=https://registry.npmmirror.com
fi
npm run build
echo "  ✓ 前端构建完成"

# ── 6. 写入 Docker 配置 ──────────────────────────────
echo ""
echo "[6/8] 检查 Docker 配置..."
cd "$APP_DIR"
echo "  ✓ 使用仓库中的 Dockerfile / docker-compose.yml / nginx.conf"

# ── 7. 构建并启动 ────────────────────────────────────
echo ""
echo "[7/8] 构建并启动 Docker 容器..."

if docker images | grep -q "aispoken"; then
    echo "  使用缓存构建..."
    docker compose build
else
    echo "  首次构建..."
    docker compose build --no-cache
fi

docker compose up -d

# ── 8. 验证部署 ──────────────────────────────────────
echo ""
echo "[8/8] 验证部署状态..."
sleep 5

echo ""
echo "容器状态："
docker compose ps

echo ""
echo "等待后端启动..."
for i in $(seq 1 30); do
    if docker exec ai-coach-backend curl -sf http://localhost:8001/health > /dev/null 2>&1; then
        echo "  ✓ 后端服务正常"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ⚠️  后端启动超时，请检查: docker compose logs backend"
    fi
    sleep 2
done

if curl -sk https://localhost:$PORT > /dev/null 2>&1; then
    echo "  ✓ Nginx HTTPS 服务正常"
else
    echo "  ⚠️  Nginx 可能未就绪: docker compose logs nginx"
fi

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  访问地址: https://$DOMAIN:$PORT"
echo ""
echo "  ⚠️  部署后请确认："
echo "    1. 阿里云安全组已开放 $PORT 端口"
echo "    2. backend/.env 中 OPENAI_API_KEY 已填写正确"
echo "    3. 首次访问浏览器提示不安全时，点击「高级」→「继续访问」"
echo "       （自签名证书的正常现象，不影响加密和录音功能）"
echo ""
echo "  常用命令："
echo "    查看日志:     docker compose logs -f"
echo "    后端日志:     docker compose logs -f backend"
echo "    重启:        docker compose restart"
echo "    停止:        docker compose down"
echo "    更新重建:    git pull && sudo bash deploy.sh"
echo "    重新生成证书: rm -rf docker/ssl && sudo bash deploy.sh"
echo ""
