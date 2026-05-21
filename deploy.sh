#!/bin/bash
# ============================================================
# AI 口语·作文教练 Docker 一键部署脚本（轻量版）
# 前端在宿主机构建，Docker 只跑后端 + Nginx
# 服务器：121.43.250.191
# 使用：cd ~/AIspoken && sudo bash deploy.sh
# ============================================================

set -e  # 遇到错误立即退出

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="121.43.250.191"
PORT=5173

echo "=========================================="
echo "  AI 口语·作文教练 Docker 部署"
echo "  访问地址: http://$DOMAIN:$PORT"
echo "=========================================="
echo ""

# ── 0. 检查必要工具 ──────────────────────────────────
echo "[0/7] 检查系统依赖..."

# 检查并安装 Docker
if ! command -v docker &> /dev/null; then
    echo "  安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
    echo "  ✓ Docker 安装完成"
else
    echo "  ✓ Docker 已安装"
fi

# 检查 docker compose
if ! docker compose version &> /dev/null; then
    echo "  ❌ docker compose 不可用，请升级 Docker 到最新版本"
    exit 1
fi

# 检查并安装 Node.js
if ! command -v node &> /dev/null; then
    echo "  安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo "  ✓ Node.js 安装完成"
else
    echo "  ✓ Node.js 已安装 ($(node -v))"
fi

echo ""

# ── 1. 停掉冲突服务 ──────────────────────────────────
echo "[1/7] 清理冲突服务..."
systemctl stop ai-coach 2>/dev/null || true
systemctl disable ai-coach 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
# 停掉旧 Docker 容器
cd "$APP_DIR"
docker compose down 2>/dev/null || true
echo "  ✓ 已清理"

# ── 2. 配置 .env ─────────────────────────────────────
echo ""
echo "[2/7] 配置环境变量..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
    if [ -f "$APP_DIR/backend/.env.example" ]; then
        cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
        # 更新 CORS 配置
        sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=http://$DOMAIN:$PORT,http://localhost:5173|" "$APP_DIR/backend/.env"
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
CORS_ORIGINS=http://$DOMAIN:$PORT,http://localhost:5173
HF_ENDPOINT=https://hf-mirror.com
MONTHLY_SESSION_GOAL=10
EOF
        echo "  ⚠️  .env 已创建，请编辑填写真实的 OPENAI_API_KEY："
        echo "     vim $APP_DIR/backend/.env"
    fi
else
    echo "  ✓ .env 已存在"
fi

# 确保 db 文件存在（Docker 挂载需要）
touch "$APP_DIR/backend/ai_coach.db"

# ── 3. 下载 Whisper 模型（使用 Docker 容器下载，不依赖宿主机 Python）──
echo ""
echo "[3/7] 检查 Whisper 模型..."
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
        echo "  ⚠️  模型下载可能失败，请检查网络后重试"
        echo "     语音识别功能将不可用，但不影响其他功能"
    fi
else
    echo "  ✓ 模型已存在"
fi

# ── 4. 构建前端（在宿主机，不在 Docker 里）────────────
echo ""
echo "[4/7] 构建前端..."
cd "$APP_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "  安装前端依赖（使用国内镜像）..."
    npm install --registry=https://registry.npmmirror.com
fi
npm run build
echo "  ✓ 前端构建完成"

# ── 5. 写入 Docker 配置文件 ───────────────────────────
echo ""
echo "[5/7] 生成 Docker 配置..."
cd "$APP_DIR"

# Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.10-slim
WORKDIR /app/backend

# 换国内镜像源 + 安装系统依赖
RUN sed -i 's|deb.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources 2>/dev/null; \
    sed -i 's|deb.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list 2>/dev/null; \
    apt-get update && \
    apt-get install -y --no-install-recommends espeak libespeak-dev curl && \
    rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖（利用 Docker 层缓存）
COPY backend/requirements.txt .
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ .

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

EXPOSE 8001
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
EOF

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  backend:
    build: .
    container_name: ai-coach-backend
    volumes:
      - ./backend/.env:/app/backend/.env
      - ./backend/ai_coach.db:/app/backend/ai_coach.db
      - ./backend/models:/app/backend/models
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - net

  nginx:
    image: nginx:alpine
    container_name: ai-coach-nginx
    ports:
      - "5173:5173"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      backend:
        condition: service_healthy
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - net

networks:
  net:
EOF

# Nginx 配置
mkdir -p docker
cat > docker/nginx.conf << 'EOF'
server {
    listen 5173;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    location /api/ {
        proxy_pass http://backend:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
        client_max_body_size 20M;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# .dockerignore
cat > .dockerignore << 'EOF'
node_modules
frontend/node_modules
frontend/dist
.venv
backend/.venv
backend/venv
**/__pycache__
*.pyc
backend/models/whisper-small/model.bin
backend/ai_coach.db
ai_coach.db
.git
*.tar.gz
EOF

echo "  ✓ Docker 配置已生成"

# ── 6. 构建并启动 Docker ─────────────────────────────
echo ""
echo "[6/7] 构建并启动 Docker 容器..."

# 判断是否首次构建（有缓存则利用缓存，加速后续部署）
if docker images | grep -q "ai-coach"; then
    echo "  检测到已有镜像，使用缓存构建..."
    docker compose build
else
    echo "  首次构建，完整构建镜像..."
    docker compose build --no-cache
fi

docker compose up -d

# ── 7. 验证部署 ──────────────────────────────────────
echo ""
echo "[7/7] 验证部署状态..."
sleep 5

# 检查容器状态
echo ""
echo "容器状态："
docker compose ps

# 等待后端健康检查通过
echo ""
echo "等待后端启动..."
for i in $(seq 1 30); do
    if docker exec ai-coach-backend curl -sf http://localhost:8001/health > /dev/null 2>&1; then
        echo "  ✓ 后端服务正常"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ⚠️  后端启动超时，请检查日志: docker compose logs backend"
    fi
    sleep 2
done

# 检查 nginx 是否正常
if curl -sf http://localhost:5173 > /dev/null 2>&1; then
    echo "  ✓ Nginx 服务正常"
else
    echo "  ⚠️  Nginx 可能未就绪，请稍后检查: docker compose logs nginx"
fi

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  访问地址: http://$DOMAIN:$PORT"
echo ""
echo "  ⚠️  部署后请确认："
echo "    1. 阿里云安全组已开放 $PORT 端口"
echo "    2. backend/.env 中 OPENAI_API_KEY 已填写正确"
echo ""
echo "  常用命令："
echo "    查看日志:     docker compose logs -f"
echo "    后端日志:     docker compose logs -f backend"
echo "    重启:        docker compose restart"
echo "    停止:        docker compose down"
echo "    更新重建:    git pull && sudo bash deploy.sh"
echo ""
