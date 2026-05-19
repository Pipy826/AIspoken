# AI 口语·作文教练

基于 Vue 3 + FastAPI 的 AI 英语学习应用，提供口语对话练习、作文批改、全真模考和专项提升功能。

## 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI 组件**: Vant 4（移动端）
- **HTTP 客户端**: Axios

### 后端
- **框架**: FastAPI
- **数据库**: SQLite（开发）/ PostgreSQL（生产）
- **认证**: JWT Token
- **AI 服务**: OpenAI API（可替换为任意兼容接口）
- **ORM**: SQLAlchemy

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd AIspoken
```

### 2. 后端设置

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写 OPENAI_API_KEY 等配置

# 启动后端（自动创建数据库）
python run.py
```

后端将运行在 `http://localhost:8000`
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

**演示账号**（如果未配置 AI，将返回模拟数据）：
- 用户名: `demo`
- 密码: `demo123`

或直接注册新账号。

## 项目结构

```
AIspoken/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── routers/        # API 路由
│   │   ├── models.py       # 数据库模型
│   │   ├── schemas.py      # Pydantic 模型
│   │   ├── auth.py         # JWT 认证
│   │   ├── ai_service.py   # AI 服务封装
│   │   ├── database.py     # 数据库连接
│   │   ├── config.py       # 配置管理
│   │   └── main.py         # 应用入口
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── layouts/        # 布局组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── api/            # API 封装
│   │   ├── router/         # 路由配置
│   │   ├── styles/         # 全局样式
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── ai-coach/                # 原型（纯前端版本）
└── README.md
```

## 功能模块

### 1. 用户认证
- 注册 / 登录（JWT Token）
- 用户信息管理
- VIP 会员状态

### 2. 口语教练
- 6 种场景对话（自由对话、职场面试、雅思模考等）
- AI 实时纠错与建议
- 语音录音模拟（前端）
- 实时评分（发音、语法、词汇、流利度）

### 3. 作文批改
- 快速 / 深度批改模式
- 四维评分（任务回应、连贯衔接、词汇资源、语法多样）
- 逐句批注（错误、警告、优秀表达）
- AI 优化版本生成

### 4. 学习报告
- 六维能力雷达图
- 学习时长柱状图
- 口语 / 作文评分趋势
- 错题本管理
- 成就徽章系统
- AI 个性化建议

### 5. 全真模考
- 5 种考试类型（雅思、托福、四六级、高考、考研）
- 倒计时计时器
- AI 评分与点评
- 历史记录查询

### 6. 专项提升
- 4 大专项（发音、语法、词汇、逻辑）
- 发音练习子模块
- 每日一练
- 精品课程推荐

### 7. 个人中心
- 用户数据统计
- VIP 会员管理
- 学习目标设置
- 邀请好友
- 常规设置

## 环境变量说明

### 后端 `.env`

```env
# JWT 密钥（生产环境务必修改）
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# 数据库
DATABASE_URL=sqlite:///./ai_coach.db

# OpenAI API（可替换为任意兼容接口）
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# CORS 允许的前端地址
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**未配置 AI 时的行为**：
- 如果 `OPENAI_API_KEY` 为 `sk-placeholder` 或空，AI 服务将返回模拟数据
- 适合本地开发和演示

## API 文档

启动后端后访问 `http://localhost:8000/docs` 查看完整 API 文档（Swagger UI）。

### 主要端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/speak/chat` | POST | 口语对话 |
| `/api/speak/scenes` | GET | 获取场景列表 |
| `/api/write/topics` | GET | 获取作文题目 |
| `/api/write/correct` | POST | 作文批改 |
| `/api/exam/types` | GET | 获取考试类型 |
| `/api/exam/result` | POST | 提交模考结果 |
| `/api/report` | GET | 获取学习报告 |
| `/api/report/error-book` | GET | 获取错题本 |

## 部署

### 后端部署

```bash
# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export SECRET_KEY="your-production-secret-key"
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
export OPENAI_API_KEY="sk-your-real-api-key"

# 启动（生产环境）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 前端部署

```bash
# 构建生产版本
npm run build

# dist/ 目录可部署到任意静态托管服务
# 如 Vercel、Netlify、Nginx 等
```

## 开发指南

### 添加新的 AI 功能

1. 在 `backend/app/ai_service.py` 中添加新函数
2. 在 `backend/app/routers/` 中创建对应路由
3. 在 `frontend/src/api/index.js` 中添加 API 调用
4. 在 `frontend/src/stores/` 中添加状态管理
5. 在 `frontend/src/views/` 中创建页面组件

### 切换 AI 服务提供商

修改 `backend/.env` 中的 `OPENAI_BASE_URL` 和 `OPENAI_MODEL`：

```env
# 使用 Azure OpenAI
OPENAI_BASE_URL=https://your-resource.openai.azure.com/
OPENAI_MODEL=gpt-4

# 使用国内服务（如通义千问、文心一言等兼容 OpenAI 格式的服务）
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
