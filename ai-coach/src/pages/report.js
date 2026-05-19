// ===== 学习报告页面 =====

let reportState = {
    period: 'month',  // week | month | year
};

function renderReport() {
    const radar = AppData.radarData;
    const history = AppData.studyHistory;
    const achievements = AppData.achievements;
    const errorBook = AppData.errorBook;

    // 雷达图点
    const radarValues = [radar.pronunciation, radar.grammar, radar.vocabulary, radar.fluency, radar.writing, radar.logic];
    const cx = 90, cy = 90, r = 65;
    const n = radarValues.length;
    const dataPoints = radarValues.map((v, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const dist = (v / 100) * r;
        return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
    }).join(' ');

    const gridPoints = (scale) => {
        return Array.from({ length: n }, (_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const dist = scale * r;
            return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
        }).join(' ');
    };

    const axisLines = Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="#e0f2f1" stroke-width="1"/>`;
    }).join('');

    const radarLabels = [
        { label: '发音', dx: 0, dy: -r - 12 },
        { label: '语法', dx: r + 10, dy: -r * 0.5 },
        { label: '词汇', dx: r + 10, dy: r * 0.5 },
        { label: '流利度', dx: 0, dy: r + 16 },
        { label: '写作', dx: -r - 10, dy: r * 0.5 },
        { label: '逻辑', dx: -r - 10, dy: -r * 0.5 },
    ].map(l => `<text x="${cx + l.dx}" y="${cy + l.dy}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#6b8f7e">${l.label}</text>`).join('');

    // 柱状图
    const maxH = Math.max(...history);
    const bars = history.map((v, i) => {
        const pct = (v / maxH * 100).toFixed(0);
        const isMax = v === maxH;
        return `
            <div class="bar-col">
                <div class="bar-track">
                    <div class="bar-fill ${isMax ? 'highlight' : ''}" style="height:${pct}%;"></div>
                </div>
                <span class="bar-label" style="${isMax ? 'color:var(--accent-orange);' : ''}">${i + 1}</span>
            </div>
        `;
    }).join('');

    document.getElementById('page-report').innerHTML = `
        <h2 style="font-size:20px;font-weight:800;margin-bottom:16px;">学习报告</h2>

        <!-- 周期选择 -->
        <div style="display:flex;background:rgba(255,255,255,0.85);padding:4px;border-radius:20px;margin-bottom:18px;border:1.5px solid var(--border-light);">
            ${['week', 'month', 'year'].map((p, i) => `
                <button style="flex:1;padding:8px;font-size:12px;font-weight:700;border-radius:16px;border:none;cursor:pointer;transition:all 0.2s;
                    background:${reportState.period === p ? 'var(--primary)' : 'transparent'};
                    color:${reportState.period === p ? 'white' : 'var(--text-secondary)'};"
                    onclick="setPeriod('${p}')">
                    ${{ week: '周', month: '月', year: '年' }[p]}
                </button>
            `).join('')}
        </div>

        <!-- 能力雷达图 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h3 style="font-weight:800;font-size:15px;text-align:center;margin-bottom:16px;">能力雷达图</h3>
            <div style="display:flex;justify-content:center;margin-bottom:12px;">
                <svg width="180" height="180" viewBox="0 0 180 180">
                    <!-- 背景网格 -->
                    <polygon points="${gridPoints(1)}" fill="none" stroke="#e0f2f1" stroke-width="1.5"/>
                    <polygon points="${gridPoints(0.67)}" fill="none" stroke="#e0f2f1" stroke-width="1"/>
                    <polygon points="${gridPoints(0.33)}" fill="none" stroke="#e0f2f1" stroke-width="1"/>
                    <!-- 轴线 -->
                    ${axisLines}
                    <!-- 数据区域 -->
                    <polygon points="${dataPoints}" fill="rgba(125,185,168,0.2)" stroke="#7db9a8" stroke-width="2"/>
                    <!-- 数据点 -->
                    ${radarValues.map((v, i) => {
                        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                        const dist = (v / 100) * r;
                        return `<circle cx="${cx + dist * Math.cos(angle)}" cy="${cy + dist * Math.sin(angle)}" r="4" fill="#7db9a8" stroke="white" stroke-width="1.5"/>`;
                    }).join('')}
                    <!-- 标签 -->
                    ${radarLabels}
                </svg>
            </div>
            <!-- 维度数值 -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                ${[
                    { label: '发音', value: radar.pronunciation, color: '#7db9a8' },
                    { label: '语法', value: radar.grammar, color: '#64b5f6' },
                    { label: '词汇', value: radar.vocabulary, color: '#ba68c8' },
                    { label: '流利度', value: radar.fluency, color: '#7db9a8' },
                    { label: '写作', value: radar.writing, color: '#ff8a65' },
                    { label: '逻辑', value: radar.logic, color: '#f4d03f' },
                ].map(d => `
                    <div style="text-align:center;padding:8px;background:rgba(255,255,255,0.7);border-radius:12px;">
                        <div style="font-size:18px;font-weight:800;color:${d.color};">${d.value}</div>
                        <div style="font-size:10px;color:var(--text-secondary);">${d.label}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 学习时长趋势 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <h3 style="font-weight:800;font-size:15px;">学习时长趋势</h3>
                <span style="font-size:11px;color:var(--text-secondary);">本月累计 12.5 小时</span>
            </div>
            <div class="bar-chart">${bars}</div>
            <p style="font-size:11px;color:var(--text-secondary);text-align:center;margin-top:8px;">（单位：天）</p>
        </div>

        <!-- 口语 & 作文评分对比 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h3 style="font-weight:800;font-size:15px;margin-bottom:14px;">📈 评分趋势</h3>
            <div style="display:flex;gap:12px;">
                <div style="flex:1;padding:12px;background:#f0f7f4;border-radius:16px;text-align:center;">
                    <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">口语综合</div>
                    <div style="font-size:28px;font-weight:800;color:var(--primary-dark);">${AppData.speakScores.overall}</div>
                    <div style="font-size:11px;color:#4caf50;">↑ 0.5 较上月</div>
                </div>
                <div style="flex:1;padding:12px;background:#fff8e1;border-radius:16px;text-align:center;">
                    <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">作文综合</div>
                    <div style="font-size:28px;font-weight:800;color:#f57f17;">${AppData.writeScores.overall}</div>
                    <div style="font-size:11px;color:#4caf50;">↑ 0.5 较上月</div>
                </div>
            </div>
        </div>

        <!-- 错题本入口 -->
        <div class="card card-p-sm" style="margin-bottom:14px;cursor:pointer;" onclick="openErrorBook()">
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:40px;height:40px;border-radius:14px;background:#ffebee;display:flex;align-items:center;justify-content:center;font-size:18px;">📚</div>
                    <div>
                        <h4 style="font-weight:800;font-size:13px;">我的错题本</h4>
                        <p style="font-size:11px;color:var(--text-secondary);">已收录 ${errorBook.total} 个错误，今日待复习 ${errorBook.todayReview} 个</p>
                    </div>
                </div>
                <span style="color:var(--text-muted);font-size:18px;">›</span>
            </div>
        </div>

        <!-- 成就徽章 -->
        <div class="card card-p" style="margin-bottom:14px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:14px;">🏅 最近成就</h4>
            <div class="badge-scroll">
                ${achievements.map(a => `
                    <div class="badge-item" onclick="${a.unlocked ? `showToast('🏅 ${a.name}：已解锁！')` : `showToast('🔒 继续努力解锁此成就')`}">
                        <div class="badge-icon ${a.unlocked ? '' : 'badge-locked'}" style="${a.unlocked ? `background:${a.color};` : ''}">
                            ${a.unlocked ? a.icon : '🔒'}
                        </div>
                        <div class="badge-name">${a.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 个性化建议 -->
        <div class="card card-p" style="margin-bottom:14px;background:linear-gradient(135deg,rgba(168,213,200,0.2),rgba(255,255,255,0.9));">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:10px;">🤖 AI 个性化建议</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="padding:10px 12px;background:white;border-radius:14px;font-size:12px;color:var(--text-main);line-height:1.6;border-left:3px solid var(--primary);">
                    📌 你的<strong>写作逻辑</strong>得分偏低（65分），建议每天练习 1 篇议论文段落，重点训练论点-论据-总结结构。
                </div>
                <div style="padding:10px 12px;background:white;border-radius:14px;font-size:12px;color:var(--text-main);line-height:1.6;border-left:3px solid #f4d03f;">
                    ⭐ 你的<strong>发音</strong>表现优秀（82分），可以尝试挑战雅思口语 Part 3 的抽象话题讨论。
                </div>
                <div style="padding:10px 12px;background:white;border-radius:14px;font-size:12px;color:var(--text-main);line-height:1.6;border-left:3px solid #64b5f6;">
                    💡 建议本周重点复习<strong>错题本</strong>中的 5 个语法错误，巩固时态和从句用法。
                </div>
            </div>
        </div>

        <div class="page-bottom-space"></div>
    `;
}

function setPeriod(period) {
    reportState.period = period;
    renderReport();
    showToast(`已切换到${{ week: '周', month: '月', year: '年' }[period]}报告`);
}

function openErrorBook() {
    const items = AppData.errorBook.items;
    openModal(`
        <div style="padding-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:18px;font-weight:800;">📚 错题本</h3>
                <span class="tag tag-red">待复习 ${AppData.errorBook.todayReview}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${items.map(item => `
                    <div style="padding:14px;background:#f9f9f9;border-radius:16px;border-left:3px solid ${item.type === 'grammar' ? 'var(--primary)' : item.type === 'vocab' ? '#f4d03f' : '#ff8a80'};">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span class="tag ${item.type === 'grammar' ? 'tag-green' : item.type === 'vocab' ? 'tag-gold' : 'tag-red'}" style="font-size:10px;">${{ grammar: '语法', vocab: '词汇', pronunciation: '发音' }[item.type]}</span>
                            <span style="font-size:10px;color:var(--text-muted);">${item.date}</span>
                        </div>
                        <p style="font-size:13px;font-weight:700;color:var(--text-main);margin-bottom:4px;">"${item.content}"</p>
                        <p style="font-size:12px;color:var(--text-secondary);">💡 ${item.correction}</p>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="closeModal();showToast('开始复习练习')">开始复习</button>
        </div>
    `);
}
