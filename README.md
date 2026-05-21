# AI 口语·作文教练

基于人工智能的英语学习应用，提供口语陪练、作文批改、全真模考、专项训练等核心功能。采用 Vue 3 + FastAPI 前后端分离架构，集成 DeepSeek 大模型对话、Whisper 本地语音识别和 Edge TTS 语音合成。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vant 4 + Pinia + Vue Router |
| 后端 | FastAPI + SQLAlchemy + SQLite |
| AI 对话 | DeepSeek API（OpenAI 兼容接口） |
| 语音识别 (STT) | faster-whisper 本地模型（离线运行） |
| 语音合成 (TTS) | Edge TTS / pyttsx3 |
| 部署 | Docker Compose + Nginx 反向代理 |

## 项目结构

```
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── api/             # Axios API 封装
│   │   ├── layouts/         # 布局组件
│   │   ├── router/          # 路由配置
│   │   └── styles/          # 全局样式
│   ├── vite.config.js       # Vite 构建配置
│   └── package.json
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── routers/         # API 路由模块
│   │   │   ├── auth.py      # 认证（注册/登录）
│   │   │   ├── speak.py     # 口语陪练
│   │   │   ├── write.py     # 作文批改
│   │   │   ├── exam.py      # 全真模考
│   │   │   ├── improve.py   # 专项训练
│   │   │   ├── report.py    # 学习报告
│   │   │   ├── home.py      # 首页数据
│   │   │   └── vip.py       # 会员功能
│   │   ├── ai_service.py    # AI 对话服务
│   │   ├── tts_service.py   # 语音合成服务
│   │   ├── stt_service.py   # 语音识别服务
│   │   ├── stats_service.py # 数据统计服务
│   │   ├── models.py        # 数据库模型
│   │   ├── schemas.py       # Pydantic 数据模型
│   │   ├── auth.py          # JWT 认证逻辑
│   │   ├── config.py        # 配置管理
│   │   └── database.py      # 数据库连接
│   ├── models/
│   │   └── whisper-small/   # Whisper 语音识别模型文件
│   ├── requirements.txt
│   └── run.py               # 开发启动入口
├── docker/
│   └── nginx.conf           # Nginx 配置
├── Dockerfile               # 后端 Docker 镜像
├── docker-compose.yml       # 容器编排
└── deploy.sh                # 一键部署脚本
```

## 功能模块

### 口语陪练
- 语音对话：录音 → Whisper 识别 → DeepSeek 回复 → TTS 语音播放
- 6 种场景：自由对话、职场面试、雅思模考、旅行出行、商务谈判、校园生活
- 实时评分：发音、语法、词汇、流利度四维评分
- 对话历史：每个场景独立保存，支持查看历史记录和新建对话
- 录音确认：录音后可试听、取消或发送

### 作文批改
- 自由输入题目或拍照识别（需支持 vision 的模型）
- 快速/深度两种批改模式
- 多维度评分 + 批注预览 + 优化方案
- 题目可选，留空则进行综合批改

### 全真模考
- 支持雅思、托福、四六级、高考、考研
- 多 Part 流程，每个 Part 独立题目
- 录音 + Whisper 自动转写
- AI 综合评分和点评
- 历史记录查看

### 专项训练
- 发音专项：标准发音播放 + 录音跟读 + 发音评估
- 语法专项：填空、改错、时态等练习
- 词汇专项：同义替换、搭配、高级表达
- 逻辑专项：论据补充、反驳、段落组织
- 本地题库随机抽取，提交答案时 AI 评判

### 学习报告
- 六维能力雷达图
- 学习时长统计（本周/本月/本年）
- 评分趋势折线图
- 学习成就徽章
- AI 数据洞察建议

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- DeepSeek API Key（[申请地址](https://platform.deepseek.com/)）

### 1. 克隆项目

```bash
git clone <仓库地址>
cd AIspoken
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
```

### 3. 下载 Whisper 模型

从 [Hugging Face](https://huggingface.co/Systran/faster-whisper-small/tree/main) 下载以下文件到 `backend/models/whisper-small/` 目录：

- `config.json`
- `model.bin`（约 484 MB）
- `tokenizer.json`
- `vocabulary.txt`

> 国内可使用镜像：`https://hf-mirror.com/Systran/faster-whisper-small/tree/main`

### 4. 启动后端

```bash
cd backend
python run.py
```

后端运行在 http://localhost:8001，API 文档：http://localhost:8001/docs

### 5. 前端设置

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 环境变量

在 `backend/.env` 中配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | DeepSeek API 密钥（必填） | - |
| `OPENAI_BASE_URL` | API 地址 | `https://api.deepseek.com/v1` |
| `OPENAI_MODEL` | 模型名称 | `deepseek-chat` |
| `SECRET_KEY` | JWT 签名密钥 | 随机生成 |
| `ALGORITHM` | JWT 算法 | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 有效期（分钟） | `10080`（7天） |
| `DATABASE_URL` | 数据库连接 | `sqlite:///./ai_coach.db` |
| `CORS_ORIGINS` | 允许的跨域来源 | `http://localhost:5173` |
| `MONTHLY_SESSION_GOAL` | 本月练习目标次数 | `10` |

## Docker 部署

### 一键部署（推荐）

```bash
sudo bash deploy.sh
```

脚本会自动完成：检查依赖 → 配置环境 → 下载模型 → 构建前端 → 启动 Docker 容器。

### 手动部署

```bash
# 1. 构建前端
cd frontend && npm install && npm run build && cd ..

# 2. 配置环境变量
cp backend/.env.example backend/.env
vim backend/.env  # 填写 OPENAI_API_KEY

# 3. 启动容器
docker compose up -d --build

# 4. 查看状态
docker compose ps
docker compose logs -f
```

### 部署架构

```
客户端 → Nginx (:5173 HTTPS)
            ├── /         → 前端静态文件 (frontend/dist)
            └── /api/     → 反向代理 → FastAPI (:8001)
```

### 服务器要求

- 2 核 4GB+ 内存（Whisper 模型需约 1.5GB）
- 开放端口 5173（HTTPS）
- 自签名证书自动生成（首次访问需点击"继续访问"）

> 录音功能必须在 HTTPS 环境下使用，部署脚本会自动生成自签名证书。

## 常用命令

```bash
# 开发
cd frontend && npm run dev          # 前端开发服务器
cd backend && python run.py         # 后端开发服务器（热重载）

# 构建
cd frontend && npm run build        # 前端生产构建

# Docker
docker compose up -d                # 启动
docker compose down                 # 停止
docker compose restart              # 重启
docker compose logs -f backend      # 查看后端日志
docker compose build --no-cache     # 重新构建镜像
```

## API 接口

后端启动后访问 http://localhost:8001/docs 查看完整 Swagger 文档。

主要接口模块：

| 模块 | 前缀 | 说明 |
|------|------|------|
| 认证 | `/api/auth` | 注册、登录、用户信息 |
| 口语 | `/api/speak` | 对话、录音识别、TTS |
| 作文 | `/api/write` | 提交作文、获取批改结果 |
| 模考 | `/api/exam` | 考试流程、评分 |
| 训练 | `/api/improve` | 专项练习题目和评判 |
| 报告 | `/api/report` | 学习数据统计 |
| 首页 | `/api/home` | 首页聚合数据 |
| 会员 | `/api/vip` | 会员状态 |

## 浏览器兼容性

| 功能 | Chrome | Edge | Firefox | Safari | 手机浏览器 |
|------|--------|------|---------|--------|-----------|
| 录音 | ✅ | ✅ | ✅ | ✅ iOS 14.5+ | ✅ (HTTPS) |
| 音频播放 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 基本功能 | ✅ | ✅ | ✅ | ✅ | ✅ |

> 注意：手机浏览器录音功能需要 HTTPS 环境或 localhost。

## 注意事项

- **AI 功能依赖**：未配置有效的 `OPENAI_API_KEY` 时，口语/作文/模考等 AI 功能会返回 503 错误
- **语音识别**：未下载 Whisper 模型时语音识别不可用，但不影响其他功能
- **TTS 选择**：Linux 服务器建议使用 Edge TTS（已包含在依赖中），Windows/macOS 可使用 pyttsx3 本地引擎
- **数据库**：默认使用 SQLite，数据文件为 `backend/ai_coach.db`，生产环境建议定期备份

## License

MIT
