# 需求文档

## 简介

AI 口语/作文教练是一款移动端优先的 Web 应用，帮助英语学习者通过 AI 驱动的沉浸式对话练习口语、获得深度作文批改反馈，并通过学习报告追踪进步。应用采用纯原生 HTML/CSS/JavaScript 实现，最大宽度 430px，具有薄荷绿主色调和手绘风格卡片的视觉设计。

## 词汇表

- **应用（App）**：AI 口语/作文教练 Web 应用整体
- **首页（Home）**：应用的主入口页面，展示学习概览和功能入口
- **口语教练（SpeakCoach）**：AI 驱动的口语对话练习模块
- **作文批改（WriteCoach）**：AI 驱动的作文批改与反馈模块
- **学习报告（Report）**：展示学习数据、能力分析和成就的报告页面
- **个人中心（Profile）**：用户信息、会员状态和设置管理页面
- **全真模考（Exam）**：模拟真实考试环境的练习模块
- **专项提升（Improve）**：针对发音、语法、词汇、逻辑的专项训练模块
- **底部导航栏（TabBar）**：固定在页面底部的五标签导航组件
- **模态框（Modal）**：从底部滑出的弹窗组件
- **Toast**：短暂显示的顶部提示消息组件
- **错题本（ErrorBook）**：收录用户错误表达的复习记录
- **打卡记录（Streak）**：用户连续学习天数的记录
- **环形进度条（ProgressRing）**：以 SVG 圆环形式展示百分比进度的组件
- **雷达图（RadarChart）**：以六边形多边形展示多维能力评分的图表
- **柱状图（BarChart）**：展示学习时长趋势的条形图表
- **场景标签（SceneTab）**：口语练习中可横向滚动的场景选择标签
- **批注（Annotation）**：作文批改中对原文的高亮标注和建议
- **VIP 会员（VIP）**：付费订阅用户，享有无限次练习等专属权益
- **mockData**：应用使用的模拟数据对象 AppData

## 需求

### 需求 1：应用初始化与页面路由

**用户故事：** 作为用户，我希望打开应用时能立即看到首页内容，并通过底部导航栏在各主页面之间流畅切换，以便快速开始学习。

#### 验收标准

1. WHEN 用户打开应用，THE App SHALL 渲染首页（Home）并将其设为激活状态
2. THE App SHALL 在页面底部固定展示底部导航栏，包含首页、口语、作文、报告、我的五个标签项
3. WHEN 用户点击底部导航栏中的标签项，THE TabBar SHALL 将对应页面切换为激活状态，并更新标签项的高亮样式
4. WHEN 页面切换时，THE App SHALL 以 fadeIn 动画（从 translateY(12px) 到 translateY(0)，持续 0.35s）展示新页面
5. THE App SHALL 对每个页面采用懒渲染策略：仅在首次激活时调用对应的渲染函数，后续切换不重复渲染
6. WHEN 移动端键盘弹出导致视口高度变化超过 100px，THE App SHALL 隐藏底部导航栏；WHEN 键盘收起，THE App SHALL 重新显示底部导航栏
7. THE App SHALL 将所有页面容器的最大宽度限制为 430px 并水平居中
8. THE App SHALL 在页面背景展示气泡上浮动画和水草 SVG 装饰元素

---

### 需求 2：首页（Home）

**用户故事：** 作为用户，我希望在首页看到个性化问候、今日学习进度、打卡记录和功能入口，以便快速了解学习状态并进入练习。

#### 验收标准

1. THE Home SHALL 展示用户头像（emoji）、问候语和连续打卡天数标签
2. THE Home SHALL 展示今日学习目标卡片，包含已完成任务数/总任务数文字和环形进度条
3. WHEN 首页渲染完成后 300ms，THE ProgressRing SHALL 以动画过渡方式展示当前进度百分比
4. THE Home SHALL 在今日目标卡片内展示近 14 天打卡记录点，已打卡日期显示为绿色，今日显示为金色，未打卡显示为灰色
5. THE Home SHALL 展示四个功能入口卡片：AI 口语教练、AI 作文批改、全真模考、专项提升
6. WHEN 用户点击"AI 口语教练"入口卡片，THE Home SHALL 切换到口语教练页面
7. WHEN 用户点击"AI 作文批改"入口卡片，THE Home SHALL 切换到作文批改页面
8. WHEN 用户点击"全真模考"入口卡片，THE Home SHALL 跳转到全真模考页面
9. WHEN 用户点击"专项提升"入口卡片，THE Home SHALL 跳转到专项提升页面
10. THE Home SHALL 展示今日金句卡片，包含金句文本和作者信息
11. THE Home SHALL 展示快速练习入口区域，包含雅思口语、议论文批改、发音纠正、错题复习四个快捷按钮
12. THE Home SHALL 展示本周数据统计，包含连续天数、练习次数、学习分钟三项数据
13. THE Home SHALL 在口语教练和作文批改入口卡片上分别展示今日剩余练习次数标签

---

### 需求 3：AI 口语教练（SpeakCoach）

**用户故事：** 作为用户，我希望与 AI 进行沉浸式英语对话练习，获得实时语法纠错和地道表达建议，以便提升口语能力。

#### 验收标准

1. THE SpeakCoach SHALL 展示可横向滚动的场景选择标签，包含自由对话、职场面试、雅思模考、旅行出行、商务谈判、校园生活六个场景
2. WHEN 用户点击场景标签，THE SpeakCoach SHALL 将该标签设为激活状态，并在对话区域添加一条 AI 场景切换欢迎消息
3. THE SpeakCoach SHALL 展示 AI 角色卡（小鱼），包含头像、名称和当前场景信息
4. THE SpeakCoach SHALL 展示对话历史消息列表，AI 消息使用左对齐白色气泡，用户消息使用右对齐渐变绿色气泡
5. WHEN AI 消息包含语法纠错内容，THE SpeakCoach SHALL 在消息气泡内以红色波浪下划线高亮错误表达，以绿色实线下划线高亮正确表达
6. WHEN AI 消息包含地道表达提示，THE SpeakCoach SHALL 在消息气泡下方展示绿色背景的提示卡片
7. THE SpeakCoach SHALL 在页面底部固定展示输入区域，包含文字输入框、发送按钮和语音按钮
8. WHEN 用户在输入框输入文字并按下 Enter 键或点击发送按钮，THE SpeakCoach SHALL 将用户消息添加到对话列表，并在 800ms 后生成 AI 回复消息
9. WHEN 用户点击语音按钮，THE SpeakCoach SHALL 将按钮切换为录音状态（红色背景、停止图标），展示脉冲动画，并显示"正在聆听..."提示
10. WHEN 语音录音模拟 3 秒后，THE SpeakCoach SHALL 自动停止录音，将模拟识别文本填入输入框并自动发送
11. WHEN 新消息添加后，THE SpeakCoach SHALL 平滑滚动到对话列表底部
12. WHEN 用户点击"查看评分"按钮，THE SpeakCoach SHALL 打开模态框展示发音、语法、词汇、流利度四个维度的评分和进度条
13. THE SpeakCoach SHALL 在评分模态框中展示 AI 提升建议文本

---

### 需求 4：AI 作文批改（WriteCoach）

**用户故事：** 作为用户，我希望提交英语作文并获得 AI 的多维度批改反馈，包括评分、逐句批注和优化版本，以便提升写作能力。

#### 验收标准

1. THE WriteCoach SHALL 展示快速批改和深度批改两个模式切换按钮，当前激活模式按钮显示为主色调样式
2. WHEN 用户点击模式切换按钮，THE WriteCoach SHALL 更新按钮激活状态并通过 Toast 提示预计耗时
3. THE WriteCoach SHALL 展示当前题目卡片，包含年份、考试类型、题目文本、文体标签和字数要求标签
4. WHEN 用户点击"换题"按钮，THE WriteCoach SHALL 打开题目选择模态框，展示所有可用题目列表
5. WHEN 用户在题目选择模态框中点击某题目，THE WriteCoach SHALL 关闭模态框、更新当前题目并重置批改状态
6. THE WriteCoach SHALL 展示作文输入文本域，支持用户输入或粘贴作文内容
7. WHEN 用户在文本域输入内容，THE WriteCoach SHALL 实时更新字数统计显示和字数进度条
8. WHEN 用户点击"开始批改"按钮且作文内容少于 50 个字符，THE WriteCoach SHALL 通过 Toast 提示用户输入更多内容
9. WHEN 用户点击"开始批改"按钮且内容有效，THE WriteCoach SHALL 将按钮切换为加载动画状态，快速批改模式延迟 2 秒、深度批改模式延迟 4 秒后展示批改结果
10. WHEN 批改完成，THE WriteCoach SHALL 展示综合评分圆环（满分 9 分制）
11. WHEN 批改完成，THE WriteCoach SHALL 展示四维评分卡片：任务回应、连贯衔接、词汇资源、语法多样，每项包含分数和进度条
12. WHEN 批改完成，THE WriteCoach SHALL 展示总体评价区域，分别列出亮点和待提升两个部分
13. WHEN 批改完成，THE WriteCoach SHALL 展示逐句批注区域，对原文中的错误表达使用红色波浪下划线高亮，警告表达使用金色波浪下划线高亮，优秀表达使用绿色实线下划线高亮，并在高亮词下方展示对应建议
14. WHEN 批改完成，THE WriteCoach SHALL 展示优化版本区域，以绿色背景展示经过改写的作文文本
15. WHEN 用户点击"复制"按钮，THE WriteCoach SHALL 将优化版本文本复制到剪贴板并通过 Toast 提示成功
16. WHEN 用户点击"加入错题本"按钮，THE WriteCoach SHALL 通过 Toast 提示已加入错题本
17. WHEN 用户点击"收藏范文"按钮，THE WriteCoach SHALL 通过 Toast 提示已收藏范文
18. WHEN 批改完成，THE WriteCoach SHALL 平滑滚动到批改结果区域顶部

---

### 需求 5：学习报告（Report）

**用户故事：** 作为用户，我希望查看我的学习数据分析、能力雷达图和成就徽章，以便了解自己的进步情况和薄弱环节。

#### 验收标准

1. THE Report SHALL 展示周/月/年三个时间周期切换按钮
2. WHEN 用户点击时间周期按钮，THE Report SHALL 重新渲染报告内容并通过 Toast 提示已切换
3. THE Report SHALL 展示六维能力雷达图，维度包含发音、语法、词汇、流利度、写作、逻辑
4. THE Report SHALL 在雷达图下方展示六个维度的数值卡片，每个维度显示对应颜色的分数
5. THE Report SHALL 展示学习时长柱状图，最高值的柱子使用橙色高亮显示
6. THE Report SHALL 展示口语综合评分和作文综合评分的对比卡片，包含较上月变化趋势
7. THE Report SHALL 展示错题本入口卡片，显示已收录错误总数和今日待复习数量
8. WHEN 用户点击错题本入口，THE Report SHALL 打开错题本模态框，展示错误列表（包含类型标签、错误内容、纠正建议和日期）
9. WHEN 用户在错题本模态框点击"开始复习"，THE Report SHALL 关闭模态框并通过 Toast 提示开始复习
10. THE Report SHALL 展示成就徽章横向滚动列表，已解锁徽章显示彩色图标，未解锁徽章显示灰色锁定图标
11. WHEN 用户点击已解锁徽章，THE Report SHALL 通过 Toast 提示徽章名称和已解锁状态
12. WHEN 用户点击未解锁徽章，THE Report SHALL 通过 Toast 提示继续努力解锁
13. THE Report SHALL 展示 AI 个性化建议区域，包含至少三条针对薄弱维度的具体建议

---

### 需求 6：个人中心（Profile）

**用户故事：** 作为用户，我希望在个人中心查看我的账户信息、会员状态和学习统计，并能管理学习目标和应用设置。

#### 验收标准

1. THE Profile SHALL 展示顶部渐变背景装饰区域，包含用户头像、昵称、VIP 等级和到期时间
2. THE Profile SHALL 展示数据统计卡片，包含学习天数、练习次数、累计分钟三项数据
3. THE Profile SHALL 展示 VIP 会员卡，包含当前套餐名称、到期时间和会员权益标签
4. WHEN 用户点击"续费会员"按钮，THE Profile SHALL 打开会员升级模态框，展示月卡、季卡、年卡三种套餐
5. WHEN 用户在会员升级模态框点击套餐，THE Profile SHALL 更新该套餐的选中高亮样式
6. WHEN 用户点击"立即开通"按钮，THE Profile SHALL 关闭模态框并通过 Toast 提示支付功能即将开放
7. THE Profile SHALL 展示功能菜单列表，包含我的订单、我的收藏、学习目标、邀请好友四个菜单项
8. WHEN 用户点击"学习目标"菜单项，THE Profile SHALL 打开学习目标设置模态框，包含目标考试、目标分数、每日学习时长三组选项
9. WHEN 用户在学习目标模态框中点击选项按钮，THE Profile SHALL 将同组其他按钮切换为次要样式，将点击的按钮切换为主要样式
10. WHEN 用户点击"保存设置"，THE Profile SHALL 关闭模态框并通过 Toast 提示已保存
11. WHEN 用户点击"邀请好友"菜单项，THE Profile SHALL 打开邀请模态框，展示邀请码和复制邀请链接按钮
12. THE Profile SHALL 展示设置菜单列表，包含常规设置、提醒设置、隐私政策、关于我们四个菜单项
13. WHEN 用户点击"常规设置"，THE Profile SHALL 打开常规设置模态框，包含深色模式、AI 语音、界面语言、字体大小、清除缓存五个设置项
14. THE Profile SHALL 展示退出登录按钮
15. WHEN 用户点击退出登录按钮，THE Profile SHALL 打开确认退出模态框，包含取消和确认退出两个操作按钮

---

### 需求 7：全真模考（Exam）

**用户故事：** 作为用户，我希望在模拟真实考试环境中进行限时练习，并在结束后获得 AI 评分和点评，以便检验自己的实际水平。

#### 验收标准

1. THE Exam SHALL 展示返回按钮，点击后返回首页
2. THE Exam SHALL 展示考试类型选择网格，包含雅思、托福、四六级、高考、考研和自定义六个选项
3. WHEN 用户点击考试类型卡片，THE Exam SHALL 更新该卡片的选中高亮样式，并在考试详情区域展示对应的考试说明
4. THE Exam SHALL 在考试详情区域展示考试名称、预计时长、考试描述和考试说明要点
5. WHEN 用户点击"开始模考"按钮，THE Exam SHALL 打开模考进行模态框，展示考试类型图标、名称、倒计时计时器和当前题目
6. WHEN 模考模态框打开后，THE Exam SHALL 启动倒计时计时器，按照对应考试类型的预设时长（雅思 14 分钟、托福 20 分钟、四六级 15 分钟、高考 20 分钟、考研 30 分钟）开始倒计时
7. WHEN 倒计时归零，THE Exam SHALL 自动停止计时器并触发模考结束流程
8. THE Exam SHALL 在模考模态框中展示语音录音按钮
9. WHEN 用户点击语音录音按钮，THE Exam SHALL 切换录音状态并通过 Toast 提示当前状态
10. WHEN 用户点击"下一题"按钮，THE Exam SHALL 停止计时器并触发模考结束流程
11. WHEN 模考结束，THE Exam SHALL 关闭进行中模态框，延迟 300ms 后打开结果模态框
12. THE Exam SHALL 在结果模态框中展示综合评分、发音、语法、流利度四个维度的分数
13. THE Exam SHALL 在结果模态框中展示 AI 点评文本
14. THE Exam SHALL 展示历史模考记录列表，包含考试类型、日期、分数和考试部分信息

---

### 需求 8：专项提升（Improve）

**用户故事：** 作为用户，我希望通过专项训练模块针对性地提升发音、语法、词汇和逻辑能力，并完成每日一练任务。

#### 验收标准

1. THE Improve SHALL 展示返回按钮，点击后返回首页
2. THE Improve SHALL 展示 AI 推荐今日训练卡片，包含推荐理由和立即开始按钮
3. WHEN 用户点击 AI 推荐卡片的"立即开始"按钮，THE Improve SHALL 打开对应专项模块的练习模态框
4. THE Improve SHALL 展示四个专项模块列表：发音专项、语法专项、词汇专项、逻辑专项，每项包含图标、标题、描述、进度百分比和进度条
5. WHEN 用户点击专项模块卡片，THE Improve SHALL 打开该模块的练习模态框，展示练习题目和文本输入区域
6. WHEN 用户在练习模态框点击"提交答案"，THE Improve SHALL 关闭模态框并通过 Toast 提示 AI 正在批改
7. THE Improve SHALL 展示发音练习专区，包含音标入门、连读技巧、语调训练、口型纠正四个子项，每项显示进度条
8. THE Improve SHALL 展示每日一练卡片，包含今日练习题目和开始练习按钮
9. WHEN 用户点击"开始练习"按钮，THE Improve SHALL 打开每日一练模态框，展示题目、答案输入框和参考词汇提示
10. WHEN 用户在每日一练模态框提交空答案，THE Improve SHALL 通过 Toast 提示请先输入答案
11. WHEN 用户在每日一练模态框提交有效答案，THE Improve SHALL 关闭当前模态框，延迟 300ms 后打开结果模态框，展示参考答案和积分奖励按钮
12. THE Improve SHALL 展示精品课程横向滚动列表，包含雅思口语、高考作文、美式发音、语法入门四个课程卡片，每个卡片标注 VIP 或免费标签

---

### 需求 9：通用 UI 组件

**用户故事：** 作为用户，我希望应用的交互反馈及时、视觉风格统一，以便获得流畅的使用体验。

#### 验收标准

1. THE App SHALL 提供 Toast 组件，在页面顶部居中展示短暂提示消息，默认 2000ms 后自动消失
2. WHEN Toast 出现时，THE App SHALL 以 toastIn 动画（从 translateY(-10px) 到 translateY(0)）展示
3. THE App SHALL 提供底部模态框组件，从页面底部滑出，最大高度为视口高度的 85%，支持滚动
4. WHEN 模态框打开时，THE App SHALL 展示半透明遮罩层（背景模糊效果）
5. WHEN 用户点击遮罩层，THE App SHALL 关闭模态框
6. THE App SHALL 对所有卡片组件应用手绘风格样式：圆角 28px、白色半透明背景、薄荷绿阴影
7. WHEN 用户点击卡片组件，THE App SHALL 以 scale(0.985) 缩放动画提供触觉反馈
8. THE App SHALL 对所有按钮的点击事件应用 scale(0.95) 缩放动画
9. THE App SHALL 使用 CSS 变量统一管理主色调（#7db9a8）、文字颜色、间距和圆角等设计令牌
10. THE App SHALL 在所有页面底部添加底部间距，防止内容被底部导航栏遮挡
11. IF 用户设备屏幕宽度大于 430px，THEN THE App SHALL 为应用容器添加外阴影以模拟手机边框效果

---

### 需求 10：数据层与状态管理

**用户故事：** 作为开发者，我希望应用使用统一的模拟数据源和状态管理方式，以便各页面能够正确读取和展示数据。

#### 验收标准

1. THE App SHALL 从全局 AppData 对象读取所有用户数据、学习数据和内容数据
2. THE SpeakCoach SHALL 维护独立的 speakState 对象，包含当前场景、录音状态、消息列表和评分数据
3. THE WriteCoach SHALL 维护独立的 writeState 对象，包含批改模式、当前题目索引、作文文本、批改状态和字数
4. THE Exam SHALL 维护独立的 examState 对象，包含选中考试类型、考试阶段、计时器引用和剩余时间
5. THE Report SHALL 维护独立的 reportState 对象，包含当前时间周期
6. WHEN 用户切换题目，THE WriteCoach SHALL 重置批改状态（corrected 为 false）并清空作文文本
7. THE App SHALL 提供 countWords 工具函数，通过空白字符分割计算英文单词数
8. THE App SHALL 提供 formatTime 工具函数，将 Date 对象格式化为 HH:MM 字符串
9. THE App SHALL 提供 ringOffset 工具函数，根据半径和百分比计算 SVG 环形进度条的 stroke-dashoffset 值
10. THE App SHALL 提供 radarPoints 工具函数，根据数值数组计算雷达图 SVG 多边形的顶点坐标
