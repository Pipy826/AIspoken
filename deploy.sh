#!/bin/bash
# ============================================================
# AI 口语·作文教练 一键部署脚本
# 目标服务器：121.43.250.191:5173
# 
# 使用方法（两种方式）：
#
# 方式一：本地执行，自动打包上传并远程部署
#   chmod +x deploy.sh
#   ./deploy.sh
#
# 方式二：已在服务器上，直接部署
#   chmod +x deploy.sh
#   sudo ./deploy.sh --local
#
# ============================================================

set -e

# ── 配置 ─────────────────────────────────────────────
SERVER_IP="121.43.250.191"
SERVER_USER="root"
SERVER_PORT=22
APP_PORT=5173
BACKEND_PORT=8001
APP_DIR="/opt/ai-coach"
DEPLOY_PACKAGE="ai-coach-deploy.tar.gz"

# ── 颜色输出 ─────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ============================================================
# 服务器端部署函数
# ============================================================
deploy_on_server() {
    echo ""
    echo "=========================================="
    echo "  AI 口语·作文教练 服务器部署"
    echo "  地址: http://$SERVER_IP:$APP_PORT"
    echo "=========================================="
    echo ""

    # ── 1. 系统依赖 ──────────────────────────────────
    info "[1/7] 安装系统依赖..."
    apt-get update -qq
    apt-get install -y -qq \
        python3 python3-pip python3-venv \
        nodejs npm nginx curl git \
        espeak libespeak-dev ffmpeg

    # 确保 Node.js >= 18
    NODE_VER=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
    if [ "$NODE_VER" -lt 18 ] 2>/dev/null; then
        info "  升级 Node.js 到 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y -qq nodejs
    fi

    info "  Python: $(python3 --version)"
    info "  Node: $(node --version)"
    info "  npm: $(npm --version)"

    # ── 2. 后端 Python 环境 ──────────────────────────
    info "[2/7] 配置后端 Python 环境..."
    cd $APP_DIR/backend

    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate

    pip install --quiet --upgrade pip
    pip install --quiet -r requirements.txt

    deactivate

    # ── 3. 后端 .env 配置 ────────────────────────────
    info "[3/7] 配置后端环境变量..."
    if [ ! -f .env ]; then
        cp .env.example .env
        # 更新 CORS 为生产地址
        sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=http://$SERVER_IP:$APP_PORT|" .env
        # 生成随机 SECRET_KEY
        SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
        sed -i "s|SECRET_KEY=.*|SECRET_KEY=$SECRET|" .env
        warn "请编辑 $APP_DIR/backend/.env 填入你的 API Key！"
    else
        # 确保 CORS 包含当前部署地址
        if ! grep -q "$SERVER_IP:$APP_PORT" .env; then
            sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=http://$SERVER_IP:$APP_PORT|" .env
        fi
        info "  .env 已存在，保留现有配置"
    fi

    # ── 4. 前端构建 ──────────────────────────────────
    info "[4/7] 构建前端..."
    cd $APP_DIR/frontend

    # 如果 node_modules 不存在或 package.json 更新了，重新安装
    if [ ! -d "node_modules" ]; then
        npm install --quiet --legacy-peer-deps
    fi

    npm run build

    if [ ! -d "dist" ]; then
        error "前端构建失败，dist 目录不存在"
    fi
    info "  前端构建完成，文件数: $(find dist -type f | wc -l)"

    # ── 5. Systemd 后端服务 ──────────────────────────
    info "[5/7] 配置后端服务..."

    cat > /etc/systemd/system/ai-coach.service << EOF
[Unit]
Description=AI Coach Backend (FastAPI + Uvicorn)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend
Environment=PATH=$APP_DIR/backend/venv/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=$APP_DIR/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port $BACKEND_PORT --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable ai-coach
    systemctl restart ai-coach
    info "  后端服务已启动 (port $BACKEND_PORT)"

    # ── 6. Nginx 配置 ────────────────────────────────
    info "[6/7] 配置 Nginx..."

    cat > /etc/nginx/sites-available/ai-coach << EOF
server {
    listen $APP_PORT;
    server_name $SERVER_IP;

    # 前端静态文件
    root $APP_DIR/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 20M;
    }

    # Vue Router history 模式
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源长缓存
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/health;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/ai-coach /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

    # 测试并重启
    nginx -t || error "Nginx 配置有误"
    systemctl restart nginx
    info "  Nginx 已配置 (port $APP_PORT)"

    # ── 7. 健康检查 ──────────────────────────────────
    info "[7/7] 验证部署..."
    sleep 3

    # 检查后端
    if curl -sf http://127.0.0.1:$BACKEND_PORT/health > /dev/null 2>&1; then
        info "  ✅ 后端服务正常"
    else
        warn "  ⚠️  后端服务可能还在启动中，请稍后检查"
        warn "  查看日志: journalctl -u ai-coach -f"
    fi

    # 检查 Nginx
    if curl -sf http://127.0.0.1:$APP_PORT/ > /dev/null 2>&1; then
        info "  ✅ Nginx 服务正常"
    else
        warn "  ⚠️  Nginx 可能还在启动中"
    fi

    # ── 完成 ─────────────────────────────────────────
    echo ""
    echo "=========================================="
    echo -e "  ${GREEN}✅ 部署完成！${NC}"
    echo "=========================================="
    echo ""
    echo "  🌐 访问地址: http://$SERVER_IP:$APP_PORT"
    echo "  📖 API 文档: http://$SERVER_IP:$APP_PORT/api/docs"
    echo ""
    echo "  ⚠️  部署后请确认："
    echo "  1. 编辑 $APP_DIR/backend/.env 填入 API Key"
    echo "     vim $APP_DIR/backend/.env"
    echo "  2. 重启后端使配置生效"
    echo "     systemctl restart ai-coach"
    echo "  3. 确保防火墙开放 $APP_PORT 端口"
    echo "     ufw allow $APP_PORT/tcp  (如果用 ufw)"
    echo ""
    echo "  📋 常用命令："
    echo "  查看后端日志:  journalctl -u ai-coach -f"
    echo "  重启后端:     systemctl restart ai-coach"
    echo "  重启 Nginx:   systemctl restart nginx"
    echo "  查看状态:     systemctl status ai-coach"
    echo ""
}

# ============================================================
# 本地打包上传（从开发机执行）
# ============================================================
deploy_from_local() {
    info "开始本地打包上传部署..."
    echo ""

    # 检查 ssh 连通性
    info "检查服务器连接..."
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "echo ok" > /dev/null 2>&1; then
        error "无法连接服务器 ${SERVER_USER}@${SERVER_IP}:${SERVER_PORT}\n  请确认：\n  1. SSH 密钥已配置\n  2. 服务器 IP 和端口正确\n  3. 网络可达"
    fi
    info "  服务器连接正常"

    # 打包项目（排除不需要的文件）
    info "打包项目文件..."
    tar -czf $DEPLOY_PACKAGE \
        --exclude='node_modules' \
        --exclude='.venv' \
        --exclude='__pycache__' \
        --exclude='.git' \
        --exclude='*.pyc' \
        --exclude='frontend/dist' \
        --exclude='ai_coach.db' \
        --exclude='backend/ai_coach.db' \
        --exclude='backend/models/whisper-small/model.bin' \
        --exclude="$DEPLOY_PACKAGE" \
        backend/ frontend/ deploy.sh

    PACKAGE_SIZE=$(du -h $DEPLOY_PACKAGE | cut -f1)
    info "  打包完成: $DEPLOY_PACKAGE ($PACKAGE_SIZE)"

    # 上传到服务器
    info "上传到服务器..."
    ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "mkdir -p $APP_DIR"
    scp -P ${SERVER_PORT} $DEPLOY_PACKAGE ${SERVER_USER}@${SERVER_IP}:$APP_DIR/

    # 远程解压并部署
    info "远程部署中..."
    ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} << REMOTE_EOF
        set -e
        cd $APP_DIR
        tar -xzf $DEPLOY_PACKAGE
        rm -f $DEPLOY_PACKAGE
        chmod +x deploy.sh
        ./deploy.sh --local
REMOTE_EOF

    # 清理本地打包文件
    rm -f $DEPLOY_PACKAGE
    info "本地临时文件已清理"

    echo ""
    echo "=========================================="
    echo -e "  ${GREEN}✅ 远程部署完成！${NC}"
    echo "=========================================="
    echo "  🌐 访问: http://$SERVER_IP:$APP_PORT"
    echo ""
}

# ============================================================
# 主入口
# ============================================================
if [ "$1" == "--local" ]; then
    # 在服务器上直接执行部署
    if [ "$EUID" -ne 0 ]; then
        error "服务器端部署需要 root 权限，请使用 sudo ./deploy.sh --local"
    fi
    deploy_on_server
else
    # 从本地打包上传到服务器
    deploy_from_local
fi
