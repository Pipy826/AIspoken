// ===== 模拟数据 =====

const AppData = {
    user: {
        name: '爱学习的鲸鱼',
        avatar: '🐳',
        level: 'VIP 高级会员',
        vipExpiry: '2026-12-31',
        streak: 12,
        totalDays: 12,
        totalSessions: 48,
        totalMinutes: 156,
        todayGoal: { total: 5, done: 3 },
        speakRemaining: 5,
        writeRemaining: 2,
    },

    dailyQuote: {
        text: '"The only way to do great work is to love what you do."',
        author: '— Steve Jobs'
    },

    speakScores: {
        overall: 7.5,
        pronunciation: 8.0,
        grammar: 7.0,
        vocabulary: 7.5,
        fluency: 7.5,
    },

    writeScores: {
        overall: 6.5,
        taskResponse: 7.0,
        coherence: 6.0,
        vocabulary: 6.5,
        grammar: 6.0,
    },

    radarData: {
        pronunciation: 82,
        grammar: 70,
        vocabulary: 75,
        fluency: 78,
        writing: 65,
        logic: 72,
    },

    studyHistory: [40, 65, 30, 80, 95, 55, 45],

    achievements: [
        { id: 1, icon: '🌟', name: '开口达人', unlocked: true, color: 'linear-gradient(135deg, #ffe082, #ffca28)' },
        { id: 2, icon: '📝', name: '写作新手', unlocked: true, color: 'linear-gradient(135deg, #a8d5c8, #7db9a8)' },
        { id: 3, icon: '🔥', name: '连续7天', unlocked: true, color: 'linear-gradient(135deg, #ff8a80, #ff5252)' },
        { id: 4, icon: '🎯', name: '模考王者', unlocked: false, color: '' },
        { id: 5, icon: '👑', name: '连续30天', unlocked: false, color: '' },
        { id: 6, icon: '💎', name: '满分作文', unlocked: false, color: '' },
    ],

    errorBook: {
        total: 23,
        todayReview: 5,
        items: [
            { type: 'grammar', content: 'I am inclined to partially agree', correction: '比 "partially agree" 更地道', date: '2026-05-06' },
            { type: 'vocab', content: 'root causes', correction: '可替换为 underlying causes / fundamental issues', date: '2026-05-05' },
            { type: 'pronunciation', content: 'deterrent /dɪˈterənt/', correction: '注意重音在第二音节', date: '2026-05-04' },
        ]
    },

    speakScenes: [
        { id: 'free', label: '自由对话', icon: '💬' },
        { id: 'interview', label: '职场面试', icon: '💼' },
        { id: 'ielts', label: '雅思模考', icon: '📋' },
        { id: 'travel', label: '旅行出行', icon: '✈️' },
        { id: 'business', label: '商务谈判', icon: '🤝' },
        { id: 'campus', label: '校园生活', icon: '🎓' },
    ],

    chatHistory: [
        {
            role: 'ai',
            text: "Hi there! 👋 How's your day going? I'd love to hear about what you've been up to lately.",
            time: '10:23',
            corrections: []
        },
        {
            role: 'user',
            text: "I'm preparing for my IELTS exam next month, so I've been practicing speaking every day.",
            time: '10:24',
            corrections: []
        },
        {
            role: 'ai',
            text: "That's great dedication! 💪 By the way, you said <span class='highlight-error'>\"practicing speaking\"</span> — it's correct, but a more natural way is <span class='highlight-good'>\"practicing my speaking skills\"</span>.",
            time: '10:25',
            tip: { label: '💡 地道表达', content: '"I\'ve been working on my oral English"' },
            corrections: ['practicing speaking → practicing my speaking skills']
        },
        {
            role: 'user',
            text: "Thank you! I also want to improve my pronunciation. Do you have any suggestions?",
            time: '10:26',
            corrections: []
        },
        {
            role: 'ai',
            text: "Absolutely! 🎯 For pronunciation, I recommend focusing on <span class='highlight-good'>word stress</span> and <span class='highlight-good'>connected speech</span>. Try shadowing native speakers — it's one of the most effective techniques.",
            time: '10:27',
            tip: { label: '📚 练习方法', content: 'Shadowing: 跟读模仿，注意语调和节奏' },
            corrections: []
        }
    ],

    writeTopics: [
        {
            id: 1,
            year: '2026',
            type: '雅思',
            genre: '议论文',
            wordCount: 250,
            text: 'Some people think that the best way to reduce crime is to give longer prison sentences. To what extent do you agree or disagree?'
        },
        {
            id: 2,
            year: '2025',
            type: '雅思',
            genre: '议论文',
            wordCount: 250,
            text: 'Some people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try to improve such situations. Discuss both views and give your own opinion.'
        },
        {
            id: 3,
            year: '2026',
            type: '托福',
            genre: '综合写作',
            wordCount: 300,
            text: 'Do you agree or disagree with the following statement? Technology has made it easier for people to connect with others. Use specific reasons and examples to support your answer.'
        },
        {
            id: 4,
            year: '2025',
            type: '高考',
            genre: '应用文',
            wordCount: 150,
            text: '假设你是李华，你的英国朋友 Tom 来信询问中国传统节日。请你写一封回信，介绍一个你最喜欢的中国传统节日。'
        },
    ],

    sampleEssay: `In recent years, the issue of crime has become a major concern for many countries. While some people believe that longer prison sentences are the most effective method to decrease crime rates, I partially agree with this view.

On the one hand, longer prison terms can serve as a deterrent to potential criminals. When individuals know that they will face severe consequences for their actions, they may think twice before committing a crime. Furthermore, keeping dangerous criminals in prison for extended periods ensures that they cannot harm society.

On the other hand, there are more effective ways to reduce crime. Education and rehabilitation programs can help offenders acquire skills and find employment after their release. Many crimes are committed due to poverty and lack of opportunities, so addressing these root causes is crucial.

In conclusion, although longer prison sentences can help reduce crime to some extent, I believe that a combination of punishment and rehabilitation is the best approach.`,

    correctionResult: {
        overall: 6.5,
        dimensions: [
            { key: 'taskResponse', label: '任务回应', score: 7.0, color: '#7db9a8' },
            { key: 'coherence', label: '连贯衔接', score: 6.0, color: '#f4d03f' },
            { key: 'vocabulary', label: '词汇资源', score: 6.5, color: '#7db9a8' },
            { key: 'grammar', label: '语法多样', score: 6.0, color: '#ff8a80' },
        ],
        annotations: [
            { original: 'partially agree', type: 'warning', suggestion: '建议改为 "I am inclined to partially agree" 或 "I agree to some extent"' },
            { original: 'major concern', type: 'good', suggestion: '用词准确，表达地道 ✓' },
            { original: 'serve as a deterrent', type: 'good', suggestion: '很好的搭配，学术性强 ✓' },
            { original: 'root causes', type: 'error', suggestion: '可替换为 "underlying causes" 或 "fundamental issues" 增加词汇多样性' },
            { original: 'addressing these root causes is crucial', type: 'warning', suggestion: '句式较简单，可改为 "tackling these underlying issues proves paramount"' },
        ],
        optimized: `In recent years, <strong>criminal activity</strong> has emerged as a pressing issue in numerous nations. While it is argued that extended prison sentences are the most effective deterrent, <strong>I am inclined to partially agree</strong> with this perspective.

On the one hand, prolonged incarceration can undoubtedly function as a powerful deterrent. The prospect of severe consequences may discourage potential offenders from engaging in criminal behavior. Moreover, <strong>keeping dangerous individuals incarcerated</strong> for extended periods safeguards society from further harm.

On the other hand, more sustainable solutions exist. <strong>Rehabilitative programs</strong> equip offenders with vocational skills, facilitating their reintegration into society. Since many crimes stem from socioeconomic deprivation, <strong>tackling these underlying issues</strong> proves paramount.

In conclusion, while extended sentences serve a purpose, a <strong>holistic approach combining punitive measures with rehabilitative strategies</strong> represents the most viable solution.`,
        summary: {
            strengths: ['论点清晰，结构完整', '使用了 "deterrent" 等学术词汇', '段落逻辑连贯'],
            improvements: ['词汇多样性不足，存在重复', '句式较单一，缺少复杂句', '结论段可进一步展开'],
        }
    },

    examTypes: [
        { id: 'ielts', name: '雅思', icon: '🎓', color: '#7db9a8', parts: ['口语 Part 1', '口语 Part 2', '口语 Part 3'] },
        { id: 'toefl', name: '托福', icon: '🌍', color: '#64b5f6', parts: ['Independent Speaking', 'Integrated Speaking'] },
        { id: 'cet6', name: '四六级', icon: '📚', color: '#ba68c8', parts: ['口语考试', '写作'] },
        { id: 'gaokao', name: '高考', icon: '🏫', color: '#ff8a65', parts: ['英语写作', '口语'] },
        { id: 'postgrad', name: '考研', icon: '🔬', color: '#4db6ac', parts: ['英语写作', '翻译'] },
    ],

    improveModules: [
        { id: 'pronunciation', icon: '🔊', title: '发音专项', desc: '音标·连读·语调·口型', color: '#e8f5e9', iconColor: '#7db9a8', progress: 65 },
        { id: 'grammar', icon: '📐', title: '语法专项', desc: '时态·从句·虚拟语气', color: '#e3f2fd', iconColor: '#64b5f6', progress: 48 },
        { id: 'vocabulary', icon: '📖', title: '词汇专项', desc: '学术词汇·搭配·替换', color: '#f3e5f5', iconColor: '#ba68c8', progress: 72 },
        { id: 'logic', icon: '🧠', title: '逻辑专项', desc: '论点·论据·段落结构', color: '#fff3e0', iconColor: '#ff8a65', progress: 35 },
    ],
};
