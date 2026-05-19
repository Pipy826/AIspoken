// ===== 个人中心页面 =====

function renderProfile() {
    const u = AppData.user;

    document.getElementById('page-profile').innerHTML = `
        <!-- 顶部背景装饰 -->
        <div style="position:absolute;top:0;left:0;right:0;height:180px;background:linear-gradient(160deg,var(--primary-light),var(--primary-dark));border-radius:0 0 40px 40px;z-index:0;"></div>

        <!-- 用户信息 -->
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;padding-top:24px;margin-bottom:20px;">
            <div style="width:80px;height:80px;border-radius:50%;background:white;padding:3px;box-shadow:0 8px 24px rgba(0,0,0,0.12);margin-bottom:10px;">
                <div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:32px;">
                    ${u.avatar}
                </div>
            </div>
            <h2 style="font-size:18px;font-weight:800;color:white;margin-bottom:4px;">${u.name}</h2>
            <p style="font-size:12px;color:rgba(255,255,255,0.85);margin-bottom:12px;">${u.level} · 到期 ${u.vipExpiry}</p>
            <button class="btn btn-gold btn-sm" onclick="openVipModal()">👑 续费会员</button>
        </div>

        <!-- 数据统计 -->
        <div class="card card-p" style="margin-bottom:14px;position:relative;z-index:1;">
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-num">${u.totalDays}</div>
                    <div class="stat-label">学习天数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-num">${u.totalSessions}</div>
                    <div class="stat-label">练习次数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-num">${u.totalMinutes}</div>
                    <div class="stat-label">累计分钟</div>
                </div>
            </div>
        </div>

        <!-- 会员卡 -->
        <div class="vip-card" style="margin-bottom:14px;">
            <div style="position:relative;z-index:1;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                    <div>
                        <p style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:4px;">当前套餐</p>
                        <h3 style="font-size:18px;font-weight:800;color:white;">👑 VIP 高级会员</h3>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:11px;color:rgba(255,255,255,0.7);">到期时间</p>
                        <p style="font-size:13px;font-weight:700;color:#ffe082;">${u.vipExpiry}</p>
                    </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <span style="padding:4px 10px;background:rgba(255,255,255,0.15);border-radius:12px;font-size:11px;color:white;">无限口语对话</span>
                    <span style="padding:4px 10px;background:rgba(255,255,255,0.15);border-radius:12px;font-size:11px;color:white;">深度作文批改</span>
                    <span style="padding:4px 10px;background:rgba(255,255,255,0.15);border-radius:12px;font-size:11px;color:white;">全真模考</span>
                    <span style="padding:4px 10px;background:rgba(255,255,255,0.15);border-radius:12px;font-size:11px;color:white;">专属课程</span>
                </div>
            </div>
        </div>

        <!-- 功能菜单 -->
        <div class="menu-list" style="margin-bottom:14px;">
            <div class="menu-item" onclick="showToast('我的订单功能即将开放')">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#e8f5e9;color:var(--primary);">📦</div>
                    <span style="font-size:14px;color:var(--text-main);">我的订单</span>
                </div>
                <span class="menu-arrow">›</span>
            </div>
            <div class="menu-item" onclick="showToast('我的收藏功能即将开放')">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#fff3e0;color:var(--accent-orange);">⭐</div>
                    <span style="font-size:14px;color:var(--text-main);">我的收藏</span>
                </div>
                <span class="menu-arrow">›</span>
            </div>
            <div class="menu-item" onclick="openGoalSetting()">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#e3f2fd;color:#1976d2;">🎯</div>
                    <span style="font-size:14px;color:var(--text-main);">学习目标</span>
                </div>
                <span class="menu-arrow">›</span>
            </div>
            <div class="menu-item" onclick="openInvite()">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#f3e5f5;color:#7b1fa2;">🎁</div>
                    <span style="font-size:14px;color:var(--text-main);">邀请好友</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span class="tag tag-red" style="font-size:10px;">赚积分</span>
                    <span class="menu-arrow">›</span>
                </div>
            </div>
        </div>

        <!-- 设置菜单 -->
        <div class="menu-list" style="margin-bottom:14px;">
            <div class="menu-item" onclick="openSettings()">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#eceff1;color:#607d8b;">⚙️</div>
                    <span style="font-size:14px;color:var(--text-main);">常规设置</span>
                </div>
                <span class="menu-arrow">›</span>
            </div>
            <div class="menu-item" onclick="openNotificationSettings()">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#eceff1;color:#607d8b;">🔔</div>
                    <span style="font-size:14px;color:var(--text-main);">提醒设置</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:36px;height:20px;border-radius:10px;background:var(--primary);position:relative;cursor:pointer;" id="notify-toggle">
                        <div style="width:16px;height:16px;border-radius:50%;background:white;position:absolute;top:2px;right:2px;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>
                    </div>
                    <span class="menu-arrow">›</span>
                </div>
            </div>
            <div class="menu-item" onclick="showToast('隐私政策')">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#eceff1;color:#607d8b;">🔒</div>
                    <span style="font-size:14px;color:var(--text-main);">隐私政策</span>
                </div>
                <span class="menu-arrow">›</span>
            </div>
            <div class="menu-item" onclick="showToast('关于我们')">
                <div class="menu-item-left">
                    <div class="menu-icon" style="background:#eceff1;color:#607d8b;">ℹ️</div>
                    <span style="font-size:14px;color:var(--text-main);">关于我们</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:11px;color:var(--text-muted);">v1.0.0</span>
                    <span class="menu-arrow">›</span>
                </div>
            </div>
        </div>

        <!-- 退出登录 -->
        <button class="btn btn-full" style="background:rgba(255,255,255,0.85);color:var(--accent-coral);border:1.5px solid rgba(255,138,128,0.3);margin-bottom:14px;font-weight:700;" onclick="confirmLogout()">
            退出登录
        </button>

        <div class="page-bottom-space"></div>
    `;
}

function openVipModal() {
    openModal(`
        <div style="padding-bottom:20px;">
            <h3 style="font-size:20px;font-weight:800;text-align:center;margin-bottom:6px;">👑 升级会员</h3>
            <p style="font-size:13px;color:var(--text-secondary);text-align:center;margin-bottom:20px;">解锁全部功能，加速英语提升</p>

            <!-- 套餐选择 -->
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                ${[
                    { name: '月卡', price: '¥39', original: '¥59', tag: '', color: 'var(--border-light)' },
                    { name: '季卡', price: '¥99', original: '¥177', tag: '最受欢迎', color: 'var(--primary)' },
                    { name: '年卡', price: '¥299', original: '¥708', tag: '最划算', color: '#f4d03f' },
                ].map((plan, i) => `
                    <div style="padding:16px;border-radius:20px;border:2px solid ${i === 1 ? 'var(--primary)' : 'var(--border-light)'};background:${i === 1 ? '#f0f7f4' : 'white'};cursor:pointer;display:flex;justify-content:space-between;align-items:center;"
                        onclick="selectPlan(this)">
                        <div>
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                                <span style="font-size:15px;font-weight:800;">${plan.name}</span>
                                ${plan.tag ? `<span class="tag ${i === 1 ? 'tag-green' : 'tag-gold'}" style="font-size:10px;">${plan.tag}</span>` : ''}
                            </div>
                            <span style="font-size:11px;color:var(--text-muted);text-decoration:line-through;">${plan.original}</span>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:24px;font-weight:800;color:${i === 1 ? 'var(--primary-dark)' : 'var(--text-main)'};">${plan.price}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- 权益列表 -->
            <div style="padding:14px;background:#f0f7f4;border-radius:16px;margin-bottom:16px;">
                <p style="font-size:12px;font-weight:700;color:var(--primary-dark);margin-bottom:8px;">会员专属权益</p>
                ${['无限次口语对话练习', '深度作文批改（含逻辑分析）', '全真模考（雅思/托福/四六级）', '专属 AI 学习方案', '专项能力提升课程', '优先客服支持'].map(b => `
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span style="color:var(--primary);font-size:12px;">✓</span>
                        <span style="font-size:12px;color:var(--text-main);">${b}</span>
                    </div>
                `).join('')}
            </div>

            <button class="btn btn-primary btn-full btn-lg" onclick="closeModal();showToast('🎉 支付功能即将开放，敬请期待！')">
                立即开通
            </button>
            <p style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:8px;">支持随时取消 · 7天无理由退款</p>
        </div>
    `);
}

function openGoalSetting() {
    openModal(`
        <div style="padding-bottom:20px;">
            <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;">🎯 学习目标设置</h3>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div>
                    <p style="font-size:13px;font-weight:700;margin-bottom:8px;">目标考试</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        ${['雅思', '托福', '四六级', '高考', '考研', '商务英语'].map((t, i) => `
                            <button class="btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}" onclick="toggleGoalTag(this)">${t}</button>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <p style="font-size:13px;font-weight:700;margin-bottom:8px;">目标分数</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        ${['6.0', '6.5', '7.0', '7.5', '8.0+'].map((s, i) => `
                            <button class="btn btn-sm ${i === 2 ? 'btn-primary' : 'btn-secondary'}" onclick="toggleGoalTag(this)">${s}</button>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <p style="font-size:13px;font-weight:700;margin-bottom:8px;">每日学习时长</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        ${['15分钟', '30分钟', '45分钟', '60分钟', '90分钟+'].map((t, i) => `
                            <button class="btn btn-sm ${i === 1 ? 'btn-primary' : 'btn-secondary'}" onclick="toggleGoalTag(this)">${t}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:20px;" onclick="closeModal();showToast('✅ 学习目标已保存')">保存设置</button>
        </div>
    `);
}

function toggleGoalTag(el) {
    const parent = el.parentElement;
    parent.querySelectorAll('.btn').forEach(b => {
        b.className = b.className.replace('btn-primary', 'btn-secondary');
    });
    el.className = el.className.replace('btn-secondary', 'btn-primary');
}

function openInvite() {
    openModal(`
        <div style="text-align:center;padding-bottom:20px;">
            <div style="font-size:48px;margin-bottom:12px;">🎁</div>
            <h3 style="font-size:18px;font-weight:800;margin-bottom:8px;">邀请好友，共同进步</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">每成功邀请 1 位好友，双方各获得 7 天免费会员</p>
            <div style="padding:16px;background:#f0f7f4;border-radius:16px;margin-bottom:16px;">
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:6px;">我的邀请码</p>
                <p style="font-size:24px;font-weight:800;color:var(--primary-dark);letter-spacing:4px;">WHALE88</p>
            </div>
            <button class="btn btn-primary btn-full" onclick="closeModal();showToast('✅ 邀请链接已复制')">复制邀请链接</button>
        </div>
    `);
}

function openSettings() {
    openModal(`
        <div style="padding-bottom:20px;">
            <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;">⚙️ 常规设置</h3>
            <div class="menu-list">
                ${[
                    { icon: '🌙', label: '深色模式', type: 'toggle' },
                    { icon: '🔊', label: 'AI 语音', type: 'toggle', on: true },
                    { icon: '🌐', label: '界面语言', type: 'arrow', value: '中文' },
                    { icon: '📱', label: '字体大小', type: 'arrow', value: '标准' },
                    { icon: '🗑️', label: '清除缓存', type: 'arrow', value: '12.3 MB' },
                ].map(item => `
                    <div class="menu-item" onclick="${item.type === 'toggle' ? 'showToast(\"设置已更新\")' : 'showToast(\"功能即将开放\")'}">
                        <div class="menu-item-left">
                            <div class="menu-icon" style="background:#f5f5f5;">${item.icon}</div>
                            <span style="font-size:14px;">${item.label}</span>
                        </div>
                        ${item.type === 'toggle' ? `
                            <div style="width:36px;height:20px;border-radius:10px;background:${item.on ? 'var(--primary)' : '#e0e0e0'};position:relative;">
                                <div style="width:16px;height:16px;border-radius:50%;background:white;position:absolute;top:2px;${item.on ? 'right:2px' : 'left:2px'};box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>
                            </div>
                        ` : `
                            <div style="display:flex;align-items:center;gap:4px;">
                                <span style="font-size:12px;color:var(--text-muted);">${item.value || ''}</span>
                                <span class="menu-arrow">›</span>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        </div>
    `);
}

function openNotificationSettings() {
    showToast('提醒设置功能即将开放');
}

function selectPlan(el) {
    el.parentElement.querySelectorAll('div[style*="border-radius:20px"]').forEach(d => {
        d.style.borderColor = 'var(--border-light)';
        d.style.background = 'white';
    });
    el.style.borderColor = 'var(--primary)';
    el.style.background = '#f0f7f4';
}

function confirmLogout() {
    openModal(`
        <div style="text-align:center;padding:20px 0;">
            <div style="font-size:48px;margin-bottom:12px;">👋</div>
            <h3 style="font-size:18px;font-weight:800;margin-bottom:8px;">确认退出？</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:24px;">退出后需要重新登录才能继续学习</p>
            <div style="display:flex;gap:10px;">
                <button class="btn btn-secondary" style="flex:1;" onclick="closeModal()">取消</button>
                <button class="btn btn-danger" style="flex:1;" onclick="closeModal();showToast('已退出登录')">确认退出</button>
            </div>
        </div>
    `);
}
