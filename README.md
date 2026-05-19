# AI 口语·作文教练

基于人工智能的英语学习应用，提供口语陪练、作文批改、全真模考、专项训练等功能。

## 技术栈

- **前端**：Vue 3 + Vant 4 + Pinia + Vue Router
- **后端**：FastAPI + SQLAlchemy + SQLite
- **AI 对话**：DeepSeek API（OpenAI 兼容接口）
- **语音识别（STT）**：faster-whisper 本地模型（离线运行）
- **语音合成（TTS）**：pyttsx3 本地引擎（离线运行）

## 项目结构

```
├── frontend/          # Vue 3 前端
│   ├── src/
│   │   ├── views/     # 页面组件
│   │   ├── stores/    # Pinia 状态管理
│   │   ├── api/       # API 接口
│   │   └── styles/    # 全局样式
│   └── vite.config.js
├── backend/           # FastAPI 后端
│   ├── app/
│   │   ├── routers/   # API 路由
│   │   ├── ai_service.py    # AI 对话服务
│   │   ├── tts_service.py   # 语音合成服务
│   │   ├── stt_service.py   # 语音识别服务
│   │   ├── stats_service.py # 数据统计服务
│   │   ├── models.py        # 数据库模型
│   │   └── config.py        # 配置
│   ├── models/
│   │   └── whisper-small/   # Whisper 语音识别模型
│   └── requirements.txt
└── README.md
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
- 题目可选，留空则进行综合批改
- 快速/深度两种批改模式
- 多维度评分 + 批注预览 + 优化方案

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
- 评分趋势
- 学习成就
- AI 数据洞察

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- DeepSeek API Key

### 1. 后端设置

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
```

### 2. 下载 Whisper 模型

从 https://huggingface.co/Systran/faster-whisper-small/tree/main 下载以下文件到 `backend/models/whisper-small/` 目录：

- `config.json`
- `model.bin`（484 MB）
- `tokenizer.json`
- `vocabulary.txt`

### 3. 启动后端

```bash
cd backend
python run.py
```

后端运行在 http://localhost:8000

### 4. 前端设置

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 环境变量说明

```env
# DeepSeek API（必填）
OPENAI_API_KEY=sk-你的密钥
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 数据库
DATABASE_URL=sqlite:///./ai_coach.db

# JWT 密钥
SECRET_KEY=你的密钥

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 部署说明

### 服务器要求
- 2 核 4GB+ 内存（Whisper 模型需要约 1.5GB）
- HTTPS（手机浏览器录音必须）

### Linux 部署注意
- TTS 需要切换为 Edge TTS（`pyttsx3` 依赖 Windows/macOS 系统语音）
- 修改 `tts_service.py` 使用 `edge-tts` 库
- 服务器通常能正常访问微软 TTS 服务

### 推荐架构
```
Nginx (HTTPS + 静态文件)
  ├── / → frontend/dist 静态文件
  └── /api → 反向代理到 FastAPI (uvicorn)
```

## 浏览器兼容性

| 功能 | Chrome | Edge | Firefox | Safari | 手机浏览器 |
|------|--------|------|---------|--------|-----------|
| 录音 | ✅ | ✅ | ✅ | ✅ iOS 14.5+ | ✅ |
| 音频播放 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 基本功能 | ✅ | ✅ | ✅ | ✅ | ✅ |

## 开发命令

```bash
# 前端开发
cd frontend && npm run dev

# 前端构建
cd frontend && npm run build

# 后端开发（热重载）
cd backend && python run.py
```
