# 设计文档

## 概述

AI 口语/作文教练是一款移动端优先的 Web 应用，采用纯原生 HTML/CSS/JavaScript 实现，无任何框架依赖。应用最大宽度 430px，以薄荷绿（#7db9a8）为主色调，手绘风格卡片为视觉语言，提供沉浸式英语学习体验。

---

## 架构设计

### 文件结构

```
ai-coach/
├── index.html                  # 应用入口，包含所有页面容器和导航栏
└── src/
    ├── styles/
    │   └── main.css            # 全局样式，CSS 变量，所有组件样式
    ├── data/
    │   └── mockData.js         # 全局模拟数据对象 AppData
    ├── utils/
    │   └── helpers.js          # 工具函数（Toast、Modal、路由、计算）
    ├── pages/
    │   ├── home.js             # 首页渲染与交互
    │   ├── speak.js            # 口语教练渲染与交互
    │   ├── write.js            # 作文批改渲染与交互
    │   ├── report.js           # 学习报告渲染与交互
    │   ├── profile.js          # 个人中心渲染与交互
    │   ├── exam.js             # 全真模考渲染与交互
    │   └── improve.js          # 专项提升渲染与交互
    └── app.js                  # 应用初始化，页面路由分发
```

### 脚本加载顺序

```html
mockData.js → helpers.js → home.js → speak.js → write.js →
report.js → profile.js → exam.js → improve.js → app.js
```

---

## 页面路由设计

### 路由模型

采用单页面应用（SPA）模式，所有页面容器在 HTML 中预先声明，通过 CSS `display` 切换可见性。

```
页面 ID 映射：
  home    → #page-home     （底部导航：首页）
  speak   → #page-speak    （底部导航：口语）
  write   → #page-write    （底部导航：作文）
  report  → #page-report   （底部导航：报告）
  profile → #page-profile  （底部导航：我的）
  exam    → #page-exam     （非导航页，从首页进入）
  improve → #page-improve  （非导航页，从首页进入）
```

### 懒渲染策略

- 每个页面容器有 `data-rendered` 属性标记
- 首次激活时调用对应 `renderXxx()` 函数并设置 `data-rendered="true"`
- 后续切换不重复渲染，保留页面状态

### 路由函数

| 函数 | 用途 |
|------|------|
| `switchTab(tabName, el)` | 切换底部导航栏页面，更新 tab 高亮 |
| `goToPage(tabName)` | 跳转到非导航栏页面（exam/improve） |
| `goBack(target)` | 返回指定页面，默认返回首页 |

---

## 状态管理设计

### 全局数据

```javascript
AppData = {
  user: { ... },          // 用户信息、VIP、打卡数据
  dailyQuote: { ... },    // 今日金句
  speakScores: { ... },   // 口语评分
  writeScores: { ... },   // 作文评分
  radarData: { ... },     // 六维能力数据
  studyHistory: [...],    // 学习时长历史（7天）
  achievements: [...],    // 成就徽章列表
  errorBook: { ... },     // 错题本数据
  speakScenes: [...],     // 口语场景列表
  chatHistory: [...],     // 对话历史
  writeTopics: [...],     // 作文题目列表
  correctionResult: {...},// 批改结果数据
  examTypes: [...],       // 考试类型列表
  improveModules: [...],  // 专项模块列表
}
```

### 页面级状态

每个有交互状态的页面维护独立的状态对象：

```javascript
// 口语教练
speakState = {
  scene: 'free',          // 当前场景 ID
  isRecording: false,     // 录音状态
  messages: [],           // 对话消息列表
  sessionScore: {...},    // 本次会话评分
}

// 作文批改
writeState = {
  mode: 'quick',          // 批改模式：quick | deep
  topicIndex: 0,          // 当前题目索引
  essayText: '',          // 作文内容
  corrected: false,       // 是否已批改
  wordCount: 0,           // 字数统计
}

// 全真模考
examState = {
  selected: null,         // 选中的考试类型 ID
  phase: 'select',        // 阶段：select | running | result
  timer: null,            // 计时器引用
  timeLeft: 0,            // 剩余秒数
  totalTime: 0,           // 总时长秒数
}

// 学习报告
reportState = {
  period: 'month',        // 时间周期：week | month | year
}
```

---

## UI 组件设计

### 1. Toast 提示组件

```
位置：页面顶部居中，fixed 定位
样式：深色半透明背景，白色文字，圆角 20px
动画：toastIn（从 translateY(-10px) 到 translateY(0)）
时长：默认 2000ms 后自动消失
```

**API：** `showToast(msg, duration = 2000)`

### 2. 底部模态框组件

```
位置：页面底部，fixed 定位，translateX(-50%) 居中
样式：白色背景，圆角 28px 28px 0 0，最大高度 85vh，可滚动
遮罩：rgba(0,0,0,0.4) + backdrop-filter: blur(4px)
动画：slideUp（从 translateY(100%) 到 translateY(0)）
关闭：点击遮罩层或调用 closeModal()
```

**API：** `openModal(html)` / `closeModal()`

### 3. 卡片组件

```
样式：
  background: rgba(255,255,255,0.92)
  border-radius: 28px
  box-shadow: 0 8px 32px rgba(125,185,168,0.12), inset 0 0 0 2px rgba(125,185,168,0.15)
  backdrop-filter: blur(10px)
交互：:active { transform: scale(0.985) }
变体：.card-p（padding 20px）/ .card-p-sm（padding 14px 16px）
```

### 4. 环形进度条（ProgressRing）

```
实现：SVG circle + stroke-dasharray/stroke-dashoffset
计算：circumference = 2πr，offset = circumference × (1 - percent/100)
动画：transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)
触发：页面渲染后 300ms 延迟启动动画
```

**工具函数：** `ringOffset(r, percent)`

### 5. 雷达图（RadarChart）

```
实现：SVG polygon，六边形布局
维度：发音、语法、词汇、流利度、写作、逻辑（6维）
背景网格：3层同心六边形（100%/67%/33%）
轴线：6条从中心到顶点的线
数据区域：fill rgba(125,185,168,0.2) + stroke #7db9a8
数据点：r=4 的圆点
```

**工具函数：** `radarPoints(values, cx, cy, r)`

### 6. 柱状图（BarChart）

```
实现：CSS flex + 绝对定位的填充条
最高值：橙色渐变高亮（#ffcc80 → #ff8a65）
其他：绿色渐变（var(--primary-light) → var(--primary)）
动画：height transition 1s cubic-bezier
```

### 7. 底部导航栏（TabBar）

```
位置：fixed bottom，高度 80px（--tab-height）
样式：白色半透明背景，backdrop-filter blur(20px)，圆角 28px 28px 0 0
激活态：translateY(-3px) + 底部绿色指示条
键盘适配：visualViewport resize 事件，键盘高度 > 100px 时隐藏
```

### 8. 语音按钮（VoiceButton）

```
正常态：绿色渐变背景，麦克风图标
录音态：红色渐变背景（#ff8a80 → #ff5252），停止图标
脉冲动画：pulse-ring（scale 1→1.6，opacity 0.4→0）
```

### 9. 聊天气泡

```
AI 消息：白色背景，圆角 20px 20px 20px 4px，左对齐
用户消息：绿色渐变背景，圆角 20px 20px 4px 20px，右对齐
高亮批注：
  错误：红色波浪下划线（border-bottom: 2px wavy #ff8a80）
  正确：绿色实线下划线（border-bottom: 2px solid #7db9a8）
  警告：金色波浪下划线（border-bottom: 2px wavy #f4d03f）
```

---

## 页面设计规格

### 首页（Home）

**布局结构（从上到下）：**
1. 顶部问候区：用户头像（浮动动画）+ 问候语 + 打卡标签
2. 今日目标卡片：任务进度文字 + 环形进度条 + 14天打卡点
3. 功能入口网格（2×2）：口语教练 / 作文批改 / 全真模考 / 专项提升
4. 今日金句卡片：金句文本 + 作者
5. 快速练习横向滚动：4个快捷按钮
6. 本周数据统计：连续天数 / 练习次数 / 学习分钟

**关键交互：**
- 功能入口卡片点击 → 页面跳转
- 环形进度条 → 300ms 后动画展示

### 口语教练（SpeakCoach）

**布局结构：**
1. 顶部：标题 + AI 在线状态指示
2. 场景标签横向滚动（6个场景）
3. AI 角色卡：头像 + 名称 + 场景 + 查看评分按钮
4. 对话消息列表（可滚动）
5. 底部固定输入区：文字输入框 + 发送按钮 + 语音按钮

**关键交互：**
- 场景切换 → 更新激活标签 + 添加 AI 欢迎消息
- 发送消息 → 800ms 后 AI 回复 + 自动滚动到底部
- 语音录音 → 3秒后自动停止 + 模拟识别文本发送
- 查看评分 → 打开评分模态框

### 作文批改（WriteCoach）

**布局结构：**
1. 顶部：标题 + 快速/深度批改切换
2. 题目卡片：年份/类型/题目文本/标签 + 换题按钮
3. 写作区域：文本域 + 字数统计 + 进度条 + 开始批改按钮
4. 批改结果区域（批改后显示）：
   - 综合评分圆环
   - 四维评分卡片
   - 总体评价（亮点/待提升）
   - 逐句批注
   - 优化版本
   - 操作按钮（复制/加入错题本/收藏范文）

**关键交互：**
- 模式切换 → Toast 提示预计耗时
- 换题 → 打开题目选择模态框
- 开始批改 → 加载动画 → 延迟展示结果 → 滚动到结果顶部

### 学习报告（Report）

**布局结构：**
1. 标题
2. 周/月/年切换按钮
3. 能力雷达图卡片（SVG + 维度数值网格）
4. 学习时长柱状图
5. 口语/作文评分对比卡片
6. 错题本入口卡片
7. 成就徽章横向滚动列表
8. AI 个性化建议（3条）

**关键交互：**
- 周期切换 → 重新渲染 + Toast 提示
- 错题本入口 → 打开错题本模态框
- 徽章点击 → Toast 提示解锁状态

### 个人中心（Profile）

**布局结构：**
1. 顶部渐变背景（绝对定位）
2. 用户信息区：头像 + 昵称 + VIP 信息 + 续费按钮
3. 数据统计卡片
4. VIP 会员卡（深色渐变）
5. 功能菜单列表（4项）
6. 设置菜单列表（4项）
7. 退出登录按钮

**关键交互：**
- 续费会员 → 打开套餐选择模态框
- 学习目标 → 打开目标设置模态框
- 邀请好友 → 打开邀请码模态框
- 常规设置 → 打开设置模态框
- 退出登录 → 打开确认模态框

### 全真模考（Exam）

**布局结构：**
1. 顶部：返回按钮 + 标题
2. 考试类型选择网格（2列，5种+自定义）
3. 考试详情区域（选中后显示）
4. 历史模考记录列表

**关键交互：**
- 选择考试类型 → 更新选中样式 + 展示考试详情
- 开始模考 → 打开进行中模态框 + 启动倒计时
- 倒计时归零/点击下一题 → 关闭模态框 → 300ms 后打开结果模态框

### 专项提升（Improve）

**布局结构：**
1. 顶部：返回按钮 + 标题
2. AI 推荐今日训练卡片
3. 四个专项模块列表（带进度条）
4. 发音练习专区（4个子项）
5. 每日一练卡片
6. 精品课程横向滚动列表

**关键交互：**
- 点击专项模块 → 打开练习模态框
- 提交答案 → 关闭模态框 + Toast 提示
- 每日一练 → 打开练习模态框 → 提交后打开结果模态框

---

## 动画规格

| 动画名称 | 触发时机 | 效果 |
|---------|---------|------|
| `pageIn` | 页面切换 | translateY(12px→0) + opacity(0→1)，0.35s |
| `toastIn` | Toast 出现 | translateY(-10px→0) + opacity(0→1)，0.3s |
| `slideUp` | 模态框打开 | translateY(100%→0)，0.3s cubic-bezier |
| `fadeIn` | 遮罩出现 | opacity(0→1)，0.2s |
| `float` | 头像/装饰 | translateY(0→-8px→0)，3.5s 循环 |
| `bubble` | 背景气泡 | translateY(100vh→-20vh) + scale(0→1)，8s 循环 |
| `pulse-ring` | 录音状态 | scale(1→1.6) + opacity(0.4→0)，1.5s 循环 |
| `loadingDot` | 批改加载 | scale(0.6→1→0.6)，1.2s 循环，3个点错开 |
| `soundWave` | 声波动画 | height(6px→22px→6px)，0.8s 循环 |
| `stroke-dashoffset` | 进度圆环 | 1.2s cubic-bezier，300ms 延迟触发 |

---

## CSS 设计令牌

```css
:root {
  /* 颜色 */
  --primary: #7db9a8;
  --primary-light: #a8d5c8;
  --primary-dark: #5a9a8a;
  --bg-start: #f0f7f4;
  --bg-mid: #e0f2f1;
  --bg-end: #d4ede6;
  --card-bg: rgba(255, 255, 255, 0.92);
  --text-main: #2c3e33;
  --text-secondary: #6b8f7e;
  --text-muted: #a8c5b8;
  --accent-gold: #f4d03f;
  --accent-coral: #ff8a80;
  --accent-orange: #ff8a65;
  --border-light: rgba(125, 185, 168, 0.2);

  /* 阴影 */
  --shadow-card: 0 8px 32px rgba(125,185,168,0.12), inset 0 0 0 2px rgba(125,185,168,0.15);

  /* 圆角 */
  --radius-card: 28px;
  --radius-btn: 20px;

  /* 布局 */
  --tab-height: 80px;
}
```

---

## 工具函数规格

| 函数 | 签名 | 说明 |
|------|------|------|
| `showToast` | `(msg, duration=2000) → void` | 显示顶部提示 |
| `openModal` | `(html) → void` | 打开底部模态框 |
| `closeModal` | `() → void` | 关闭模态框 |
| `switchTab` | `(tabName, el) → void` | 切换导航页面 |
| `goToPage` | `(tabName) → void` | 跳转非导航页面 |
| `goBack` | `(target='home') → void` | 返回页面 |
| `countWords` | `(text) → number` | 统计英文单词数 |
| `formatTime` | `(date) → string` | 格式化为 HH:MM |
| `ringOffset` | `(r, percent) → number` | 计算圆环 dashoffset |
| `radarPoints` | `(values, cx, cy, r) → string` | 计算雷达图顶点 |
| `scoreColor` | `(score) → string` | 根据分数返回颜色 |
| `debounce` | `(fn, delay) → function` | 防抖包装 |
| `uid` | `() → string` | 生成随机 ID |

---

## 响应式设计

- 基础宽度：100%（移动端）
- 最大宽度：430px，水平居中
- 超过 430px：添加外阴影模拟手机边框
- 键盘弹出：监听 `visualViewport.resize`，键盘高度 > 100px 时隐藏 TabBar
- 滚动：页面内容区域独立滚动，隐藏滚动条（scrollbar-width: none）
