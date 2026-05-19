// ===== 作文批改页面 =====

let writeState = {
    mode: 'quick',   // quick | deep | polish | improve
    topicIndex: 0,
    essayText: AppData.sampleEssay,
    corrected: false,
    wordCount: 0,
};

function renderWrite() {
    const topic = AppData.writeTopics[writeState.topicIndex];
    writeState.wordCount = countWords(writeState.essayText);

    document.getElementById('page-write').innerHTML = `
        <!-- 顶部 -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h2 style="font-size:20px;font-weight:800;">作文教练</h2>
            <div style="display:flex;gap:6px;">
                <button class="btn btn-sm ${writeState.mode === 'quick' ? 'btn-primary' : 'btn-secondary'}" onclick="setWriteMode('quick', this)">快速批改</button>
                <button class="btn btn-sm ${writeState.mode === 'deep' ? 'btn-primary' : 'btn-secondary'}" onclick="setWriteMode('deep', this)">深度批改</button>
            </div>
        </div>

        <!-- 题目选择 -->
        <div class="card card-p-sm" style="margin-bottom:14px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="color:var(--primary);font-size:16px;">📝</span>
                    <span style="font-size:13px;font-weight:700;">${topic.year} 年${topic.type}写作真题</span>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="openTopicPicker()">换题 ›</button>
            </div>
            <div class="question-card">
                <p style="font-size:13px;color:var(--text-main);line-height:1.7;">${topic.text}</p>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                <span class="tag tag-green">${topic.genre}</span>
                <span class="tag tag-green">${topic.wordCount} 词</span>
                <span class="tag tag-orange">${topic.type}</span>
            </div>
        </div>

        <!-- 写作区域 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <textarea class="textarea-field" id="essay-textarea" rows="10"
                placeholder="在此输入或粘贴你的作文..."
                oninput="updateWordCount(this.value)">${writeState.essayText}</textarea>
            <div class="divider"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:12px;color:var(--text-muted);" id="word-count-display">字数：${writeState.wordCount} / ${topic.wordCount}</span>
                    <div id="word-count-bar" style="width:60px;">
                        <div class="progress-bar">
                            <div class="progress-fill progress-green" id="word-count-fill" style="width:${Math.min(100, writeState.wordCount / topic.wordCount * 100).toFixed(0)}%;"></div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="startCorrection()" id="correct-btn">
                    ✨ 开始批改
                </button>
            </div>
        </div>

        <!-- 批改结果区域 -->
        <div id="correction-area" style="${writeState.corrected ? '' : 'display:none;'}">
            ${writeState.corrected ? renderCorrectionResult() : ''}
        </div>

        <div class="page-bottom-space"></div>
    `;
}

function setWriteMode(mode, el) {
    writeState.mode = mode;
    document.querySelectorAll('#page-write .btn-sm').forEach(b => {
        b.className = b.className.replace('btn-primary', 'btn-secondary');
    });
    el.className = el.className.replace('btn-secondary', 'btn-primary');
    showToast(mode === 'quick' ? '快速批改：约 3 秒' : '深度批改：约 10 秒，更全面');
}

function updateWordCount(text) {
    writeState.essayText = text;
    const count = countWords(text);
    writeState.wordCount = count;
    const topic = AppData.writeTopics[writeState.topicIndex];
    const display = document.getElementById('word-count-display');
    const fill = document.getElementById('word-count-fill');
    if (display) display.textContent = `字数：${count} / ${topic.wordCount}`;
    if (fill) fill.style.width = `${Math.min(100, count / topic.wordCount * 100).toFixed(0)}%`;
}

function startCorrection() {
    const textarea = document.getElementById('essay-textarea');
    if (textarea) writeState.essayText = textarea.value;

    if (writeState.essayText.trim().length < 50) {
        showToast('请先输入至少 50 个字符的作文');
        return;
    }

    const btn = document.getElementById('correct-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>`;
    }

    const delay = writeState.mode === 'quick' ? 2000 : 4000;
    setTimeout(() => {
        writeState.corrected = true;
        const area = document.getElementById('correction-area');
        if (area) {
            area.style.display = 'block';
            area.innerHTML = renderCorrectionResult();
            // 在页面容器内滚动到批改结果顶部
            const page = document.getElementById('page-write');
            if (page) {
                setTimeout(() => {
                    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '✨ 重新批改';
        }
        showToast('✅ 批改完成！');
    }, delay);
}

function renderCorrectionResult() {
    const r = AppData.correctionResult;
    const circumference = 2 * Math.PI * 40;
    const offset = circumference * (1 - r.overall / 9);

    return `
        <!-- 总评分 -->
        <div class="card card-p card-gradient-green" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <h3 style="font-weight:800;font-size:16px;margin-bottom:4px;">批改完成 ✅</h3>
                    <p style="font-size:11px;color:var(--text-secondary);">四层梯度批改 · 耗时 ${writeState.mode === 'quick' ? '2.3' : '8.7'} 秒</p>
                </div>
                <div style="text-align:center;">
                    <div class="score-ring" style="width:72px;height:72px;">
                        <svg width="72" height="72" viewBox="0 0 100 100">
                            <circle class="score-ring-track" cx="50" cy="50" r="40" stroke-width="8"/>
                            <circle class="score-ring-fill" cx="50" cy="50" r="40" stroke-width="8"
                                stroke-dasharray="${circumference.toFixed(2)}"
                                stroke-dashoffset="${offset.toFixed(2)}"/>
                        </svg>
                        <div class="score-ring-label">
                            <span style="font-size:20px;font-weight:800;color:var(--primary-dark);">${r.overall}</span>
                        </div>
                    </div>
                    <p style="font-size:10px;color:var(--text-secondary);margin-top:2px;">综合评分</p>
                </div>
            </div>

            <!-- 四维评分 -->
            <div class="score-dim-grid">
                ${r.dimensions.map(d => `
                    <div class="score-dim-item">
                        <div class="dim-label">${d.label}</div>
                        <div class="dim-score" style="color:${d.color};">${d.score}</div>
                        <div class="progress-bar" style="margin-top:6px;">
                            <div class="progress-fill" style="width:${d.score / 9 * 100}%;background:${d.color};"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 亮点与问题 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:12px;">📊 总体评价</h4>
            <div style="margin-bottom:12px;">
                <p style="font-size:12px;font-weight:700;color:var(--primary-dark);margin-bottom:6px;">✅ 亮点</p>
                ${r.summary.strengths.map(s => `
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span style="color:var(--primary);font-size:12px;">•</span>
                        <span style="font-size:12px;color:var(--text-main);">${s}</span>
                    </div>
                `).join('')}
            </div>
            <div>
                <p style="font-size:12px;font-weight:700;color:var(--accent-coral);margin-bottom:6px;">⚠️ 待提升</p>
                ${r.summary.improvements.map(s => `
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span style="color:var(--accent-coral);font-size:12px;">•</span>
                        <span style="font-size:12px;color:var(--text-main);">${s}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 逐句批注 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:12px;">📝 逐句批注</h4>
            <div style="font-size:13px;line-height:1.9;color:var(--text-main);">
                <p style="margin-bottom:8px;">...the issue of crime has become a <span class="highlight-good" title="用词准确">major concern</span> for many countries.</p>
                <p style="margin-bottom:4px;">...I <span class="highlight-error" title="表达可以更地道">partially agree</span> with this view.</p>
                <div class="correction-tip">💡 建议改为 "I am inclined to partially agree" 或 "I agree to some extent"</div>
                <p style="margin-top:8px;margin-bottom:8px;">...longer prison terms can <span class="highlight-good" title="很好的搭配">serve as a deterrent</span> to potential criminals.</p>
                <p style="margin-bottom:4px;">...addressing these <span class="highlight-warning" title="词汇重复">root causes</span> is crucial.</p>
                <div class="correction-tip">💡 可替换为 "underlying causes" 或 "fundamental issues" 增加词汇多样性</div>
                <p style="margin-top:8px;margin-bottom:4px;">...a combination of punishment and <span class="highlight-warning">rehabilitation</span> is the best approach.</p>
                <div class="correction-tip">💡 结论段可进一步展开，增加 "holistic approach" 等学术表达</div>
            </div>
        </div>

        <!-- 优化版本 -->
        <div class="card card-p" style="margin-bottom:14px;border:2px solid var(--primary-light);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h4 style="font-weight:800;font-size:14px;color:var(--primary-dark);">✨ 优化版本</h4>
                <button class="btn btn-ghost btn-sm" onclick="copyOptimized()">复制</button>
            </div>
            <div style="font-size:13px;color:var(--text-main);line-height:1.8;background:#f0f7f4;padding:14px;border-radius:16px;" id="optimized-text">
                ${r.optimized}
            </div>
        </div>

        <!-- 操作按钮 -->
        <div style="display:flex;gap:10px;margin-bottom:14px;">
            <button class="btn btn-primary" style="flex:1;" onclick="showToast('已加入错题本 📚')">加入错题本</button>
            <button class="btn btn-secondary" style="flex:1;" onclick="showToast('已收藏范文 ⭐')">收藏范文</button>
        </div>

        <!-- 仿写练习 -->
        <div class="card card-p-sm" style="margin-bottom:14px;cursor:pointer;" onclick="showToast('仿写练习功能即将开放')">
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:14px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:18px;">✏️</div>
                <div style="flex:1;">
                    <p style="font-size:13px;font-weight:700;">仿写练习</p>
                    <p style="font-size:11px;color:var(--text-secondary);">参考优化版本，重新写一篇</p>
                </div>
                <span style="color:var(--text-muted);font-size:18px;">›</span>
            </div>
        </div>
    `;
}

function openTopicPicker() {
    const topics = AppData.writeTopics;
    openModal(`
        <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;">选择题目</h3>
        <div style="display:flex;flex-direction:column;gap:10px;padding-bottom:20px;">
            ${topics.map((t, i) => `
                <div style="padding:14px;border-radius:18px;border:2px solid ${i === writeState.topicIndex ? 'var(--primary)' : 'var(--border-light)'};background:${i === writeState.topicIndex ? '#f0f7f4' : 'white'};cursor:pointer;"
                    onclick="selectTopic(${i})">
                    <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
                        <span class="tag tag-orange">${t.type}</span>
                        <span class="tag tag-green">${t.genre}</span>
                        <span class="tag tag-green">${t.year}</span>
                    </div>
                    <p style="font-size:12px;color:var(--text-main);line-height:1.6;">${t.text.slice(0, 80)}...</p>
                </div>
            `).join('')}
        </div>
    `);
}

function selectTopic(index) {
    writeState.topicIndex = index;
    writeState.corrected = false;
    writeState.essayText = '';
    closeModal();
    renderWrite();
    showToast('题目已切换');
}

function copyOptimized() {
    const text = document.getElementById('optimized-text');
    if (text) {
        const content = text.innerText;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => showToast('✅ 已复制到剪贴板'));
        } else {
            showToast('✅ 已复制');
        }
    }
}
