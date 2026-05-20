FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    espeak libespeak-dev curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 Node.js 18（用于构建前端）
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 后端依赖
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt \
    && pip install --no-cache-dir edge-tts email-validator

# 前端构建
COPY frontend/package*.json /app/frontend/
RUN cd /app/frontend && npm install --quiet

COPY frontend/ /app/frontend/
RUN cd /app/frontend && npm run build

# 复制后端代码
COPY backend/ /app/backend/

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 5173

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
