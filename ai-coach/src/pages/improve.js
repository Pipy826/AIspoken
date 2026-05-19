// ===== 专项提升页面 =====

function renderImprove() {
    const modules = AppData.improveModules;

    document.getElementById('page-improve').innerHTML = `
        <!-- 顶部 -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <button onclick="goBack('home')" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.85);border:1.5px solid var(--border-light);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;">←</button>
            <h2 style="font-size:20px;font-weight:800;">专项提升</h2>
        </div>

        <!-- AI 推荐 -->
        <div class="card card-p card-gradient-green" style="margin-bottom:16px;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="width:44px;height:44px;border-radius:16px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🤖</div>
                <div>
                    <h4 style="font-weight:800;font-size:14px;margin-bottom:4px;">AI 推荐今日训练</h4>
                    <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">根据你的学习数据，今天重点练习<strong style="color:var(--primary-dark);">逻辑专项</strong>，提升写作论证能力。</p>
                    <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="startImproveModule('logic')">立即开始</button>
                </div>
            </div>
        </div>

        <!-- 专项模块 -->
        <div style="margin-bottom:16px;">
            <p style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:12px;">全部专项</p>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${modules.map(m => `
                    <div class="improve-card" onclick="startImproveModule('${m.id}')">
                        <div style="width:52px;height:52px;border-radius:18px;background:${m.color};display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">${m.icon}</div>
                        <div style="flex:1;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                                <h3 style="font-weight:800;font-size:14px;">${m.title}</h3>
                                <span style="font-size:13px;font-weight:800;color:${m.iconColor};">${m.progress}%</span>
                            </div>
                            <p style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">${m.desc}</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width:${m.progress}%;background:${m.iconColor};"></div>
                            </div>
                        </div>
                        <span style="color:var(--text-muted);font-size:18px;flex-shrink:0;">›</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 发音练习专区 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:12px;">🔊 发音练习</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${[
                    { icon: '🔤', title: '音标入门', desc: '48个国际音标系统学习', tag: '基础', progress: 80 },
                    { icon: '🔗', title: '连读技巧', desc: '自然语流中的连读规则', tag: '进阶', progress: 45 },
                    { icon: '🎵', title: '语调训练', desc: '升调降调与情感表达', tag: '进阶', progress: 30 },
                    { icon: '👄', title: '口型纠正', desc: '难发音位置精准训练', tag: '专项', progress: 20 },
                ].map(item => `
                    <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f9f9f9;border-radius:14px;cursor:pointer;" onclick="showToast('${item.title}练习即将开放')">
                        <div style="width:36px;height:36px;border-radius:12px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${item.icon}</div>
                        <div style="flex:1;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                <span style="font-size:13px;font-weight:700;">${item.title}</span>
                                <span class="tag tag-green" style="font-size:10px;">${item.tag}</span>
                            </div>
                            <p style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">${item.desc}</p>
                            <div class="progress-bar" style="height:4px;">
                                <div class="progress-fill progress-green" style="width:${item.progress}%;"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 每日一练 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h4 style="font-weight:800;font-size:14px;">⚡ 每日一练</h4>
                <span class="tag tag-orange">今日未完成</span>
            </div>
            <div style="padding:14px;background:#fff8e1;border-radius:16px;margin-bottom:12px;">
                <p style="font-size:12px;color:#f57f17;font-weight:700;margin-bottom:6px;">今日练习：词汇替换</p>
                <p style="font-size:13px;color:var(--text-main);line-height:1.7;">将下面句子中的普通词汇替换为更高级的表达：</p>
                <p style="font-size:13px;color:var(--text-main);font-style:italic;margin-top:6px;">"The problem is very big and needs to be solved quickly."</p>
            </div>
            <button class="btn btn-primary btn-full" onclick="openDailyPractice()">开始练习</button>
        </div>

        <!-- 精品课程 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h4 style="font-weight:800;font-size:14px;">🎓 精品课程</h4>
                <button class="btn btn-ghost btn-sm" onclick="showToast('查看全部课程')">全部 ›</button>
            </div>
            <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;">
                ${[
                    { icon: '🎯', title: '雅思口语\n7分冲刺', color: '#e8f5e9', tag: 'VIP' },
                    { icon: '✍️', title: '高考作文\n满分技巧', color: '#fff3e0', tag: 'VIP' },
                    { icon: '🔊', title: '美式发音\n精讲课', color: '#e3f2fd', tag: '免费' },
                    { icon: '📐', title: '语法零基础\n入门', color: '#f3e5f5', tag: '免费' },
                ].map(c => `
                    <div style="flex-shrink:0;width:120px;cursor:pointer;" onclick="showToast('课程即将开放')">
                        <div style="height:80px;background:${c.color};border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:6px;position:relative;">
                            ${c.icon}
                            <span class="tag ${c.tag === 'VIP' ? 'tag-gold' : 'tag-green'}" style="position:absolute;top:6px;right:6px;font-size:9px;">${c.tag}</span>
                        </div>
                        <p style="font-size:11px;font-weight:700;color:var(--text-main);white-space:pre-line;line-height:1.4;">${c.title}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="page-bottom-space"></div>
    `;
}

function startImproveModule(moduleId) {
    const module = AppData.improveModules.find(m => m.id === moduleId);
    if (!module) {
        showToast('模块即将开放');
        return;
    }

    const exercises = {
        pronunciation: [
            { q: '请朗读以下单词，注意重音位置：', words: ['comfortable /ˈkʌmftəbl/', 'photography /fəˈtɒɡrəfi/', 'necessary /ˈnesəseri/'] },
        ],
        grammar: [
            { q: '选择正确的时态填空：', sentence: 'By the time she arrived, he _____ (leave) already.', answer: 'had left' },
        ],
        vocabulary: [
            { q: '用更高级的词汇替换划线部分：', sentence: 'The situation is very <u>bad</u> and needs immediate attention.', hint: 'dire / critical / alarming' },
        ],
        logic: [
            { q: '为以下论点补充论据：', point: '延长监禁时间可以减少犯罪率。', hint: '从威慑效果、社会隔离、成本效益等角度思考' },
        ],
    };

    const ex = exercises[moduleId]?.[0];

    openModal(`
        <div style="padding-bottom:20px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:44px;height:44px;border-radius:16px;background:${module.color};display:flex;align-items:center;justify-content:center;font-size:22px;">${module.icon}</div>
                <div>
                    <h3 style="font-size:16px;font-weight:800;">${module.title}</h3>
                    <p style="font-size:11px;color:var(--text-secondary);">${module.desc}</p>
                </div>
            </div>

            ${ex ? `
                <div style="padding:14px;background:#f0f7f4;border-radius:16px;margin-bottom:14px;">
                    <p style="font-size:13px;font-weight:700;margin-bottom:8px;">${ex.q}</p>
                    ${ex.words ? ex.words.map(w => `<p style="font-size:13px;color:var(--text-main);margin-bottom:4px;">• ${w}</p>`).join('') : ''}
                    ${ex.sentence ? `<p style="font-size:13px;color:var(--text-main);font-style:italic;">${ex.sentence}</p>` : ''}
                    ${ex.point ? `<p style="font-size:13px;color:var(--text-main);">${ex.point}</p>` : ''}
                    ${ex.hint ? `<p style="font-size:11px;color:var(--primary-dark);margin-top:6px;">💡 提示：${ex.hint}</p>` : ''}
                    ${ex.answer ? `<p style="font-size:11px;color:var(--primary-dark);margin-top:6px;">✓ 参考答案：${ex.answer}</p>` : ''}
                </div>
            ` : ''}

            <textarea class="textarea-field" rows="4" placeholder="在此输入你的练习答案..."
                style="width:100%;padding:12px;background:#f9f9f9;border-radius:14px;border:1.5px solid var(--border-light);margin-bottom:14px;"></textarea>

            <div style="display:flex;gap:10px;">
                <button class="btn btn-secondary" style="flex:1;" onclick="closeModal()">稍后练习</button>
                <button class="btn btn-primary" style="flex:1;" onclick="closeModal();showToast('✅ 已提交，AI 正在批改...')">提交答案</button>
            </div>
        </div>
    `);
}

function openDailyPractice() {
    openModal(`
        <div style="padding-bottom:20px;">
            <h3 style="font-size:18px;font-weight:800;margin-bottom:6px;">⚡ 每日一练</h3>
            <p style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;">词汇升级练习</p>

            <div style="padding:14px;background:#fff8e1;border-radius:16px;margin-bottom:14px;">
                <p style="font-size:13px;color:var(--text-main);line-height:1.7;font-style:italic;">"The problem is very big and needs to be solved quickly."</p>
            </div>

            <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">请将句子改写，使用更高级的词汇：</p>
            <textarea class="textarea-field" id="daily-answer" rows="3" placeholder="输入你的改写版本..."
                style="width:100%;padding:12px;background:#f9f9f9;border-radius:14px;border:1.5px solid var(--border-light);margin-bottom:14px;"></textarea>

            <div style="padding:12px;background:#f0f7f4;border-radius:14px;margin-bottom:14px;">
                <p style="font-size:11px;color:var(--primary-dark);font-weight:700;margin-bottom:4px;">💡 参考词汇</p>
                <p style="font-size:12px;color:var(--text-main);">problem → <strong>issue / challenge / dilemma</strong></p>
                <p style="font-size:12px;color:var(--text-main);">very big → <strong>significant / substantial / critical</strong></p>
                <p style="font-size:12px;color:var(--text-main);">solved quickly → <strong>addressed promptly / resolved urgently</strong></p>
            </div>

            <button class="btn btn-primary btn-full" onclick="submitDailyPractice()">提交答案</button>
        </div>
    `);
}

function submitDailyPractice() {
    const answer = document.getElementById('daily-answer')?.value?.trim();
    if (!answer) {
        showToast('请先输入你的答案');
        return;
    }
    closeModal();
    setTimeout(() => {
        openModal(`
            <div style="padding-bottom:20px;text-align:center;">
                <div style="font-size:48px;margin-bottom:12px;">🎉</div>
                <h3 style="font-size:18px;font-weight:800;margin-bottom:8px;">练习完成！</h3>
                <div style="padding:14px;background:#f0f7f4;border-radius:16px;margin:16px 0;text-align:left;">
                    <p style="font-size:12px;font-weight:700;color:var(--primary-dark);margin-bottom:6px;">✨ 参考答案</p>
                    <p style="font-size:13px;color:var(--text-main);font-style:italic;line-height:1.7;">"The <strong>critical issue</strong> demands to be <strong>addressed promptly</strong>."</p>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">你的答案已记录，继续保持每日练习的好习惯！</p>
                <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="closeModal();showToast('✅ +10 积分')">领取积分</button>
            </div>
        `);
    }, 300);
}
