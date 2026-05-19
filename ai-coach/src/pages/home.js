// ===== 首页 =====

function renderHome() {
    const u = AppData.user;
    const q = AppData.dailyQuote;
    const progress = Math.round((u.todayGoal.done / u.todayGoal.total) * 100);
    const r = 52;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - progress / 100);

    // 打卡点
    const streakDots = Array.from({ length: 14 }, (_, i) => {
        const cls = i < u.streak - 1 ? 'done' : i === u.streak - 1 ? 'today' : '';
        return `<div class="streak-dot ${cls}"></div>`;
    }).join('');

    document.getElementById('page-home').innerHTML = `
        <!-- 顶部问候 -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
            <div>
                <p style="font-size:13px;color:var(--text-secondary);margin-bottom:4px;">早安，学习者 ☀️</p>
                <h1 style="font-size:22px;font-weight:800;color:var(--text-main);line-height:1.3;">今天也要开口说英语</h1>
                <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                    <span class="tag tag-green">🔥 连续打卡 ${u.streak} 天</span>
                    <span class="tag tag-gold">⚡ 学习 streak</span>
                </div>
            </div>
            <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 16px rgba(125,185,168,0.35);flex-shrink:0;" class="animate-float">
                ${u.avatar}
            </div>
        </div>

        <!-- 今日目标卡片 -->
        <div class="card card-p" style="margin-bottom:16px;">
            <div class="wave-decoration"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="flex:1;">
                    <h3 style="font-weight:800;font-size:16px;margin-bottom:4px;">今日学习目标</h3>
                    <p style="font-size:12px;color:var(--text-secondary);margin-bottom:14px;">已完成 ${u.todayGoal.done}/${u.todayGoal.total} 项任务</p>
                    <div style="display:flex;gap:10px;">
                        <div style="text-align:center;">
                            <div style="width:40px;height:40px;border-radius:14px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:4px;">🗣️</div>
                            <span style="font-size:10px;color:var(--text-secondary);">口语</span>
                        </div>
                        <div style="text-align:center;">
                            <div style="width:40px;height:40px;border-radius:14px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:4px;">✍️</div>
                            <span style="font-size:10px;color:var(--text-secondary);">作文</span>
                        </div>
                        <div style="text-align:center;opacity:0.4;">
                            <div style="width:40px;height:40px;border-radius:14px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:4px;">📖</div>
                            <span style="font-size:10px;color:#aaa;">单词</span>
                        </div>
                        <div style="text-align:center;opacity:0.4;">
                            <div style="width:40px;height:40px;border-radius:14px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:4px;">🎯</div>
                            <span style="font-size:10px;color:#aaa;">模考</span>
                        </div>
                    </div>
                </div>
                <!-- 环形进度 -->
                <div class="score-ring" style="width:100px;height:100px;flex-shrink:0;">
                    <svg width="100" height="100" viewBox="0 0 120 120">
                        <circle class="score-ring-track" cx="60" cy="60" r="${r}" stroke-width="10"/>
                        <circle class="score-ring-fill" cx="60" cy="60" r="${r}" stroke-width="10"
                            stroke-dasharray="${circumference.toFixed(2)}"
                            stroke-dashoffset="${offset.toFixed(2)}"
                            id="home-progress-ring"/>
                    </svg>
                    <div class="score-ring-label">
                        <span style="font-size:26px;font-weight:800;color:var(--primary-dark);">${progress}%</span>
                    </div>
                </div>
            </div>
            <!-- 打卡记录 -->
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(125,185,168,0.15);">
                <p style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">近 14 天打卡</p>
                <div class="streak-dots">${streakDots}</div>
            </div>
        </div>

        <!-- 核心功能入口 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <!-- 口语教练 -->
            <div class="card card-p" style="cursor:pointer;" onclick="switchTab('speak')">
                <div style="width:48px;height:48px;border-radius:18px;background:linear-gradient(135deg,var(--primary-light),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;box-shadow:0 4px 12px rgba(125,185,168,0.3);">🎙️</div>
                <h3 style="font-weight:800;font-size:14px;margin-bottom:4px;">AI 口语教练</h3>
                <p style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">沉浸式对话练习</p>
                <span class="tag tag-green" style="font-size:10px;">今日剩余 ${u.speakRemaining} 次</span>
            </div>

            <!-- 作文批改 -->
            <div class="card card-p" style="cursor:pointer;" onclick="switchTab('write')">
                <div style="width:48px;height:48px;border-radius:18px;background:linear-gradient(135deg,#ffe0b2,#ffcc80);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;box-shadow:0 4px 12px rgba(255,152,0,0.2);">📝</div>
                <h3 style="font-weight:800;font-size:14px;margin-bottom:4px;">AI 作文批改</h3>
                <p style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">四层深度批改</p>
                <span class="tag tag-orange" style="font-size:10px;">今日剩余 ${u.writeRemaining} 次</span>
            </div>

            <!-- 全真模考 -->
            <div class="card card-p" style="cursor:pointer;" onclick="goToPage('exam')">
                <div style="width:48px;height:48px;border-radius:18px;background:linear-gradient(135deg,#c5cae9,#9fa8da);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;box-shadow:0 4px 12px rgba(121,134,203,0.25);">🎯</div>
                <h3 style="font-weight:800;font-size:14px;margin-bottom:4px;">全真模考</h3>
                <p style="font-size:11px;color:var(--text-secondary);">雅思/托福/四六级</p>
            </div>

            <!-- 专项提升 -->
            <div class="card card-p" style="cursor:pointer;" onclick="goToPage('improve')">
                <div style="width:48px;height:48px;border-radius:18px;background:linear-gradient(135deg,#f8bbd0,#f48fb1);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;box-shadow:0 4px 12px rgba(244,143,177,0.25);">🌱</div>
                <h3 style="font-weight:800;font-size:14px;margin-bottom:4px;">专项提升</h3>
                <p style="font-size:11px;color:var(--text-secondary);">发音·语法·逻辑</p>
            </div>
        </div>

        <!-- 今日推荐 -->
        <div class="card card-p" style="margin-bottom:16px;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
                <div style="width:52px;height:52px;border-radius:18px;background:#fff8e1;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">💡</div>
                <div style="flex:1;">
                    <h4 style="font-weight:800;font-size:14px;margin-bottom:6px;">今日金句</h4>
                    <p style="font-size:13px;color:var(--text-secondary);font-style:italic;line-height:1.6;margin-bottom:4px;">${q.text}</p>
                    <p style="font-size:11px;color:var(--primary-light);">${q.author}</p>
                </div>
            </div>
        </div>

        <!-- 快速入口 -->
        <div class="card card-p-sm" style="margin-bottom:16px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:12px;">📌 快速练习</h4>
            <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;">
                <button class="btn btn-secondary btn-sm" onclick="switchTab('speak');showToast('进入雅思口语练习')">雅思口语 Part 2</button>
                <button class="btn btn-secondary btn-sm" onclick="switchTab('write');showToast('进入作文批改')">议论文批改</button>
                <button class="btn btn-secondary btn-sm" onclick="goToPage('improve');showToast('进入发音练习')">发音纠正</button>
                <button class="btn btn-secondary btn-sm" onclick="showToast('错题复习功能即将开放')">错题复习</button>
            </div>
        </div>

        <!-- 学习数据概览 -->
        <div class="card card-p" style="margin-bottom:16px;">
            <h4 style="font-weight:800;font-size:14px;margin-bottom:14px;">📊 本周数据</h4>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-num">${u.streak}</div>
                    <div class="stat-label">连续天数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-num">${u.totalSessions}</div>
                    <div class="stat-label">练习次数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-num">${u.totalMinutes}</div>
                    <div class="stat-label">学习分钟</div>
                </div>
            </div>
        </div>

        <div class="page-bottom-space"></div>
    `;
}
