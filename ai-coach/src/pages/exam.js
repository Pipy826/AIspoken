// ===== 全真模考页面 =====

let examState = {
    selected: null,
    phase: 'select',  // select | ready | running | result
    timer: null,
    timeLeft: 0,
    totalTime: 0,
};

function renderExam() {
    const types = AppData.examTypes;

    document.getElementById('page-exam').innerHTML = `
        <!-- 顶部 -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <button onclick="goBack('home')" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.85);border:1.5px solid var(--border-light);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;">←</button>
            <h2 style="font-size:20px;font-weight:800;">全真模考</h2>
        </div>

        <!-- 考试类型选择 -->
        <div style="margin-bottom:20px;">
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">选择考试类型</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                ${types.map(t => `
                    <div class="card card-p" style="cursor:pointer;border:2px solid ${examState.selected === t.id ? 'var(--primary)' : 'transparent'};background:${examState.selected === t.id ? '#f0f7f4' : 'var(--card-bg)'};"
                        onclick="selectExamType('${t.id}', this)">
                        <div style="width:44px;height:44px;border-radius:16px;background:${t.color}22;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px;">${t.icon}</div>
                        <h3 style="font-weight:800;font-size:14px;margin-bottom:4px;">${t.name}</h3>
                        <p style="font-size:11px;color:var(--text-secondary);">${t.parts.join(' · ')}</p>
                    </div>
                `).join('')}
                <!-- 自定义 -->
                <div class="card card-p" style="cursor:pointer;" onclick="showToast('自定义模考功能即将开放')">
                    <div style="width:44px;height:44px;border-radius:16px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px;">✏️</div>
                    <h3 style="font-weight:800;font-size:14px;margin-bottom:4px;">自定义</h3>
                    <p style="font-size:11px;color:var(--text-secondary);">自定义题型和时间</p>
                </div>
            </div>
        </div>

        <!-- 模考说明 -->
        <div class="card card-p" style="margin-bottom:20px;" id="exam-detail">
            ${examState.selected ? renderExamDetail() : `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <p>请先选择考试类型<br>开始全真模拟练习</p>
                </div>
            `}
        </div>

        <!-- 历史记录 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:12px;">📋 历史模考记录</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${[
                    { type: '雅思', date: '2026-05-05', score: 7.0, parts: 'Speaking Part 1-3' },
                    { type: '四六级', date: '2026-05-03', score: 82, parts: '口语考试' },
                    { type: '雅思', date: '2026-04-28', score: 6.5, parts: 'Writing Task 2' },
                ].map(r => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#f9f9f9;border-radius:14px;">
                        <div>
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                                <span class="tag tag-green" style="font-size:10px;">${r.type}</span>
                                <span style="font-size:11px;color:var(--text-secondary);">${r.parts}</span>
                            </div>
                            <span style="font-size:11px;color:var(--text-muted);">${r.date}</span>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:20px;font-weight:800;color:var(--primary-dark);">${r.score}</div>
                            <div style="font-size:10px;color:var(--text-secondary);">分</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="page-bottom-space"></div>
    `;
}

function renderExamDetail() {
    const type = AppData.examTypes.find(t => t.id === examState.selected);
    if (!type) return '';

    const configs = {
        ielts: { time: 14, desc: '模拟雅思口语考试全流程，包含 Part 1（介绍）、Part 2（独白）、Part 3（讨论）三个部分，AI 扮演考官角色。', tips: ['Part 1: 4-5 分钟，回答个人问题', 'Part 2: 3-4 分钟，独白描述', 'Part 3: 4-5 分钟，深度讨论'] },
        toefl: { time: 20, desc: '模拟托福口语考试，包含独立口语和综合口语任务，AI 提供即时评分和反馈。', tips: ['Task 1: 独立口语，45秒准备，60秒作答', 'Task 2-4: 综合口语，听读说结合'] },
        cet6: { time: 15, desc: '模拟四六级口语考试，包含朗读、复述、问答三个环节。', tips: ['第一节: 朗读短文（2分钟）', '第二节: 复述短文（2分钟）', '第三节: 回答问题（4分钟）'] },
        gaokao: { time: 20, desc: '模拟高考英语写作，包含应用文和读后续写两种题型。', tips: ['应用文: 邮件/通知/倡议书等', '读后续写: 根据文章续写结尾', '满分 25 分'] },
        postgrad: { time: 30, desc: '模拟考研英语写作，包含大作文和小作文。', tips: ['小作文: 应用文写作（10分）', '大作文: 图表/漫画作文（20分）', '建议时间分配：10+20分钟'] },
    };

    const config = configs[examState.selected] || configs.ielts;

    return `
        <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                <div style="width:44px;height:44px;border-radius:16px;background:${type.color}22;display:flex;align-items:center;justify-content:center;font-size:22px;">${type.icon}</div>
                <div>
                    <h3 style="font-weight:800;font-size:15px;">${type.name}全真模考</h3>
                    <p style="font-size:11px;color:var(--text-secondary);">预计时长 ${config.time} 分钟</p>
                </div>
            </div>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.7;margin-bottom:12px;">${config.desc}</p>
            <div style="padding:12px;background:#f0f7f4;border-radius:14px;margin-bottom:14px;">
                <p style="font-size:12px;font-weight:700;color:var(--primary-dark);margin-bottom:6px;">📋 考试说明</p>
                ${config.tips.map(t => `<p style="font-size:11px;color:var(--text-main);margin-bottom:3px;">• ${t}</p>`).join('')}
            </div>
            <button class="btn btn-primary btn-full" onclick="startExam('${examState.selected}')">
                🚀 开始模考
            </button>
        </div>
    `;
}

function selectExamType(id, el) {
    examState.selected = id;
    // 更新选中样式
    document.querySelectorAll('#page-exam .card').forEach(c => {
        c.style.borderColor = 'transparent';
        c.style.background = 'var(--card-bg)';
    });
    el.style.borderColor = 'var(--primary)';
    el.style.background = '#f0f7f4';

    // 更新详情
    const detail = document.getElementById('exam-detail');
    if (detail) detail.innerHTML = renderExamDetail();
}

function startExam(typeId) {
    const type = AppData.examTypes.find(t => t.id === typeId);
    const timeMap = { ielts: 14 * 60, toefl: 20 * 60, cet6: 15 * 60, gaokao: 20 * 60, postgrad: 30 * 60 };
    examState.totalTime = timeMap[typeId] || 15 * 60;
    examState.timeLeft = examState.totalTime;
    examState.phase = 'running';

    openModal(`
        <div style="padding-bottom:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:40px;margin-bottom:8px;">${type.icon}</div>
                <h3 style="font-size:18px;font-weight:800;">${type.name}模考进行中</h3>
                <p style="font-size:12px;color:var(--text-secondary);margin-top:4px;">请在安静环境中完成考试</p>
            </div>

            <!-- 计时器 -->
            <div style="text-align:center;margin-bottom:20px;">
                <div class="exam-timer" id="exam-timer">${formatExamTime(examState.timeLeft)}</div>
                <p style="font-size:11px;color:var(--text-secondary);margin-top:4px;">剩余时间</p>
            </div>

            <!-- 当前题目 -->
            <div class="question-card" style="margin-bottom:16px;">
                <p style="font-size:12px;color:var(--primary-dark);font-weight:700;margin-bottom:6px;">Part 1 · 问题 1/5</p>
                <p style="font-size:14px;color:var(--text-main);line-height:1.7;">Can you tell me about your hometown? What do you like most about it?</p>
            </div>

            <!-- 录音区域 -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:20px;">
                <div style="position:relative;">
                    <div class="pulse-ring" style="display:block;"></div>
                    <button class="voice-btn" id="exam-voice-btn" onclick="toggleExamVoice()" style="width:64px;height:64px;font-size:26px;">🎙️</button>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);">点击开始回答</p>
            </div>

            <div style="display:flex;gap:10px;">
                <button class="btn btn-secondary" style="flex:1;" onclick="showToast('已跳过此题')">跳过</button>
                <button class="btn btn-primary" style="flex:1;" onclick="nextExamQuestion()">下一题 →</button>
            </div>
        </div>
    `);

    // 启动计时器
    examState.timer = setInterval(() => {
        examState.timeLeft--;
        const timerEl = document.getElementById('exam-timer');
        if (timerEl) timerEl.textContent = formatExamTime(examState.timeLeft);
        if (examState.timeLeft <= 0) {
            clearInterval(examState.timer);
            finishExam();
        }
    }, 1000);
}

function formatExamTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function toggleExamVoice() {
    const btn = document.getElementById('exam-voice-btn');
    if (btn) {
        const isRec = btn.textContent === '⏹️';
        btn.textContent = isRec ? '🎙️' : '⏹️';
        btn.className = isRec ? 'voice-btn' : 'voice-btn recording';
        showToast(isRec ? '录音已停止' : '🎙️ 录音中...');
    }
}

function nextExamQuestion() {
    showToast('进入下一题');
    closeModal();
    clearInterval(examState.timer);
    setTimeout(() => finishExam(), 500);
}

function finishExam() {
    clearInterval(examState.timer);
    closeModal();
    setTimeout(() => {
        openModal(`
            <div style="padding-bottom:20px;">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:48px;margin-bottom:8px;">🎉</div>
                    <h3 style="font-size:20px;font-weight:800;">模考完成！</h3>
                    <p style="font-size:13px;color:var(--text-secondary);margin-top:4px;">AI 正在分析你的表现...</p>
                </div>

                <!-- 评分 -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    ${[
                        { label: '综合评分', score: '7.0', color: 'var(--primary-dark)' },
                        { label: '发音', score: '7.5', color: '#7db9a8' },
                        { label: '语法', score: '6.5', color: '#64b5f6' },
                        { label: '流利度', score: '7.0', color: '#ba68c8' },
                    ].map(d => `
                        <div style="padding:12px;background:#f0f7f4;border-radius:16px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:${d.color};">${d.score}</div>
                            <div style="font-size:11px;color:var(--text-secondary);">${d.label}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="padding:12px;background:#fff8e1;border-radius:14px;margin-bottom:16px;">
                    <p style="font-size:12px;color:#f57f17;font-weight:700;margin-bottom:4px;">💡 AI 点评</p>
                    <p style="font-size:12px;color:var(--text-main);line-height:1.7;">整体表现良好！发音清晰，语调自然。建议在 Part 3 抽象话题讨论中多使用连接词，增强逻辑性。</p>
                </div>

                <div style="display:flex;gap:10px;">
                    <button class="btn btn-secondary" style="flex:1;" onclick="closeModal();showToast('已保存到学习报告')">查看详情</button>
                    <button class="btn btn-primary" style="flex:1;" onclick="closeModal()">再练一次</button>
                </div>
            </div>
        `);
    }, 300);
}
