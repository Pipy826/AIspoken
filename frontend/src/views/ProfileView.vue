<template>
  <div class="page-scroll" style="padding-top:0;background:var(--bg-page);">
    <!-- 顶部渐变头部 -->
    <div style="background:linear-gradient(135deg,var(--primary),var(--primary-light));padding:20px 18px 16px;color:#fff;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:52px;height:52px;background:rgba(255,255,255,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;border:2px solid rgba(255,255,255,.4);">{{ avatarChar }}</div>
        <div style="flex:1;">
          <div style="font-size:18px;font-weight:700;">{{ user.username || '学习者' }}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
            <span style="background:rgba(255,255,255,.15);padding:2px 10px;border-radius:8px;font-size:10px;">{{ user.email || '未设置邮箱' }}</span>
          </div>
        </div>
        <div style="width:28px;height:28px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;" @click="showUserInfo = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15 1.65 1.65 0 0 0 3.17 14H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
      </div>
      <!-- 数据统计 -->
      <div style="display:flex;justify-content:space-around;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.2);">
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;">{{ user.total_days ?? 0 }}</div><div style="font-size:10px;opacity:.8;">学习天数</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;">{{ user.total_sessions ?? 0 }}</div><div style="font-size:10px;opacity:.8;">练习次数</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;">{{ user.total_minutes ?? 0 }}</div><div style="font-size:10px;opacity:.8;">累计分钟</div></div>
      </div>
    </div>

    <!-- 能力综合评估 -->
    <div class="card card-p card-mb" style="margin-top:12px;">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          能力综合评估
        </span>
        <span style="font-size:11px;color:var(--primary);font-weight:400;cursor:pointer;" @click="showAbilityDetail = true">详情 →</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div v-for="dim in radarItems" :key="dim.label" style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:10px;width:36px;color:var(--text-secondary);">{{ dim.label }}</span>
          <div class="progress-bar" style="flex:1;height:6px;"><div class="progress-fill" :style="{ width: dim.pct + '%' }"></div></div>
          <span style="font-size:11px;font-weight:600;color:var(--primary);width:28px;text-align:right;">{{ dim.score }}</span>
        </div>
      </div>
      <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-light);">
        当前等级：<strong style="color:var(--primary);">Lv.{{ level }} {{ levelName }}</strong> · 超越 {{ percentile }}% 同龄学习者
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="card card-p card-mb">
      <div v-for="item in menuItems" :key="item.text" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-light);cursor:pointer;" @click="item.action">
        <div :style="{ width:'36px', height:'36px', borderRadius:'10px', background: item.bg, display:'flex', alignItems:'center', justifyContent:'center' }" v-html="item.icon"></div>
        <span style="flex:1;font-size:13px;font-weight:500;color:var(--text-main);">{{ item.text }}</span>
        <span style="color:var(--text-muted);font-size:12px;">›</span>
      </div>
    </div>

    <!-- 设置菜单 -->
    <div class="card card-p card-mb">
      <div v-for="item in settingsItems" :key="item.text" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-light);cursor:pointer;" @click="item.action">
        <div style="width:36px;height:36px;border-radius:10px;background:#f7f8fc;display:flex;align-items:center;justify-content:center;" v-html="item.icon"></div>
        <span style="flex:1;font-size:13px;font-weight:500;color:var(--text-main);">{{ item.text }}</span>
        <span style="color:var(--text-muted);font-size:12px;">›</span>
      </div>
    </div>

    <!-- 退出登录 -->
    <div style="margin:0 14px 12px;">
      <button style="background:transparent;color:#ff3b30;border:1px solid #ffcdd2;border-radius:12px;font-size:13px;padding:10px;width:100%;cursor:pointer;" @click="logout">退出登录</button>
    </div>
    <div style="height:14px;"></div>

    <!-- 学习目标弹窗 -->
    <van-popup v-model:show="showGoal" position="center" round style="width:85%;padding:20px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">学习目标设置</h3>
      <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">目标考试</label>
        <select v-model="goalExam" style="width:100%;padding:10px 12px;border:1px solid var(--bg-muted);border-radius:10px;font-size:13px;background:#fff;outline:none;"><option v-for="e in examOptions" :key="e" :value="e">{{ e }}</option></select>
      </div>
      <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">目标分数</label>
        <input type="range" min="5" max="9" step="0.5" v-model="goalScore" style="width:100%;"/>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);"><span>5.0</span><span style="color:var(--primary);font-weight:600;">{{ goalScore }}</span><span>9.0</span></div>
      </div>
      <div style="margin-bottom:14px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">每日学习时长</label>
        <div style="display:flex;gap:8px;">
          <span v-for="t in timeOptions" :key="t" :style="{ padding:'5px 12px', borderRadius:'16px', fontSize:'11px', fontWeight:600, cursor:'pointer', border: goalTime === t ? '1px solid var(--primary)' : '1px solid var(--bg-muted)', background: goalTime === t ? 'var(--primary)' : '#fff', color: goalTime === t ? '#fff' : 'var(--text-secondary)' }" @click="goalTime = t">{{ t }}分钟</span>
        </div>
      </div>
      <van-button block round type="primary" @click="showGoal = false">保存目标</van-button>
    </van-popup>

    <!-- 邀请好友弹窗 -->
    <van-popup v-model:show="showInvite" position="center" round style="width:85%;padding:20px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:6px;">邀请好友</h3>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px;">邀请好友注册，双方各得 3 天 VIP</p>
      <div style="background:var(--bg-page);border-radius:12px;padding:14px;text-align:center;margin-bottom:12px;">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">我的邀请码</div>
        <div style="font-size:24px;font-weight:800;color:var(--primary);letter-spacing:4px;">{{ inviteCode }}</div>
      </div>
      <van-button block round type="primary" style="margin-bottom:8px;" @click="copyInviteLink">复制邀请链接</van-button>
      <van-button block round plain type="primary" @click="showInvite = false">分享给好友</van-button>
    </van-popup>

    <!-- 常规设置弹窗 -->
    <van-popup v-model:show="showSettings" position="bottom" round style="max-height:60vh;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">常规设置</h3>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);"><span style="font-size:13px;">深色模式</span><div style="width:44px;height:24px;background:var(--bg-muted);border-radius:12px;position:relative;cursor:pointer;"><div style="width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;box-shadow:0 1px 3px rgba(0,0,0,.1);"></div></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);"><span style="font-size:13px;">AI 语音</span><div style="width:44px;height:24px;background:var(--primary);border-radius:12px;position:relative;cursor:pointer;"><div style="width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;right:2px;box-shadow:0 1px 3px rgba(0,0,0,.1);"></div></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);"><span style="font-size:13px;">界面语言</span><span style="font-size:12px;color:var(--primary);">简体中文 ›</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);"><span style="font-size:13px;">字体大小</span><span style="font-size:12px;color:var(--primary);">标准 ›</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;"><span style="font-size:13px;">清除缓存</span><span style="font-size:12px;color:var(--text-muted);">23.5 MB</span></div>
      </div>
    </van-popup>

    <!-- 用户信息弹窗 -->
    <van-popup v-model:show="showUserInfo" position="bottom" round style="max-height:70vh;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">个人信息</h3>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:13px;color:var(--text-secondary);">头像</span>
          <div style="width:40px;height:40px;background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:600;">{{ avatarChar }}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:13px;color:var(--text-secondary);">用户名</span>
          <span style="font-size:13px;color:var(--text-main);">{{ user.username || '未设置' }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:13px;color:var(--text-secondary);">邮箱</span>
          <span style="font-size:13px;color:var(--text-main);">{{ user.email || '未绑定' }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:13px;color:var(--text-secondary);">注册时间</span>
          <span style="font-size:13px;color:var(--text-main);">{{ formatDate(user.created_at) }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light);">
          <span style="font-size:13px;color:var(--text-secondary);">学习天数</span>
          <span style="font-size:13px;color:var(--primary);font-weight:600;">{{ user.total_days ?? 0 }} 天</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
          <span style="font-size:13px;color:var(--text-secondary);">目标考试</span>
          <span style="font-size:13px;color:var(--text-main);">{{ goalExam }}</span>
        </div>
      </div>
      <van-button block round type="primary" style="margin-top:16px;" @click="showUserInfo = false">关闭</van-button>
    </van-popup>

    <!-- 能力详情弹窗 -->
    <van-popup v-model:show="showAbilityDetail" position="bottom" round style="max-height:75vh;overflow-y:auto;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">能力综合评估详情</h3>
      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-size:36px;font-weight:800;color:var(--primary);">Lv.{{ level }}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">{{ levelName }} · 超越 {{ percentile }}% 同龄学习者</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div v-for="dim in radarItems" :key="'d'+dim.label" style="background:var(--bg-page);border-radius:12px;padding:12px 14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:13px;font-weight:600;color:var(--text-main);">{{ dim.label }}</span>
            <span style="font-size:14px;font-weight:700;color:var(--primary);">{{ dim.score }}</span>
          </div>
          <div class="progress-bar" style="height:8px;"><div class="progress-fill" :style="{ width: dim.pct + '%' }"></div></div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">{{ abilityTips[dim.label] || '继续练习提升此项能力' }}</div>
        </div>
      </div>
      <van-button block round plain type="primary" style="margin-top:14px;" @click="showAbilityDetail = false">关闭</van-button>
    </van-popup>

    <!-- 我的收藏弹窗 -->
    <van-popup v-model:show="showFavorites" position="bottom" round style="max-height:75vh;overflow-y:auto;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">我的收藏</h3>
      <div v-if="favorites.length" style="display:flex;flex-direction:column;gap:8px;">
        <div v-for="(fav, i) in favorites" :key="i" style="background:var(--bg-page);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:10px;">
          <div :style="{ width:'36px', height:'36px', borderRadius:'10px', background: fav.type === 'speak' ? '#f0f4ff' : '#fff3e0', display:'flex', alignItems:'center', justifyContent:'center' }">
            <svg v-if="fav.type === 'speak'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;color:var(--text-main);">{{ fav.title }}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">{{ fav.date }}</div>
          </div>
          <span style="font-size:11px;color:var(--primary);cursor:pointer;">查看</span>
        </div>
      </div>
      <div v-else style="text-align:center;padding:30px 0;color:var(--text-muted);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bg-muted)" stroke-width="1.5" style="margin-bottom:8px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div style="font-size:13px;">暂无收藏内容</div>
        <div style="font-size:11px;margin-top:4px;">练习中点击收藏按钮即可保存</div>
      </div>
      <van-button block round plain type="primary" style="margin-top:14px;" @click="showFavorites = false">关闭</van-button>
    </van-popup>

    <!-- 提醒设置弹窗 -->
    <van-popup v-model:show="showReminder" position="bottom" round style="max-height:60vh;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">提醒设置</h3>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
          <div><div style="font-size:13px;color:var(--text-main);">每日学习提醒</div><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">每天定时提醒你学习</div></div>
          <div :style="{ width:'44px', height:'24px', background: reminderDaily ? 'var(--primary)' : 'var(--bg-muted)', borderRadius:'12px', position:'relative', cursor:'pointer', transition:'background .2s' }" @click="reminderDaily = !reminderDaily">
            <div :style="{ width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', transition:'left .2s', left: reminderDaily ? '22px' : '2px', boxShadow:'0 1px 3px rgba(0,0,0,.1)' }"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
          <div><div style="font-size:13px;color:var(--text-main);">提醒时间</div><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">选择每日提醒时间</div></div>
          <span style="font-size:13px;color:var(--primary);font-weight:500;">{{ reminderTime }}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
          <div><div style="font-size:13px;color:var(--text-main);">打卡提醒</div><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">连续打卡中断时提醒</div></div>
          <div :style="{ width:'44px', height:'24px', background: reminderStreak ? 'var(--primary)' : 'var(--bg-muted)', borderRadius:'12px', position:'relative', cursor:'pointer', transition:'background .2s' }" @click="reminderStreak = !reminderStreak">
            <div :style="{ width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', transition:'left .2s', left: reminderStreak ? '22px' : '2px', boxShadow:'0 1px 3px rgba(0,0,0,.1)' }"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
          <div><div style="font-size:13px;color:var(--text-main);">学习报告推送</div><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">每周发送学习报告</div></div>
          <div :style="{ width:'44px', height:'24px', background: reminderReport ? 'var(--primary)' : 'var(--bg-muted)', borderRadius:'12px', position:'relative', cursor:'pointer', transition:'background .2s' }" @click="reminderReport = !reminderReport">
            <div :style="{ width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', transition:'left .2s', left: reminderReport ? '22px' : '2px', boxShadow:'0 1px 3px rgba(0,0,0,.1)' }"></div>
          </div>
        </div>
      </div>
      <van-button block round type="primary" style="margin-top:16px;" @click="showReminder = false">保存设置</van-button>
    </van-popup>

    <!-- 隐私政策弹窗 -->
    <van-popup v-model:show="showPrivacy" position="bottom" round style="max-height:75vh;overflow-y:auto;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">隐私政策</h3>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
        <p style="margin-bottom:10px;"><strong style="color:var(--text-main);">1. 信息收集</strong></p>
        <p style="margin-bottom:8px;">我们收集您在使用服务时提供的信息，包括注册信息（用户名、邮箱）、学习数据（练习记录、评分）以及设备信息。</p>
        <p style="margin-bottom:10px;"><strong style="color:var(--text-main);">2. 信息使用</strong></p>
        <p style="margin-bottom:8px;">收集的信息用于：提供个性化学习建议、生成学习报告、改善产品体验、保障账户安全。</p>
        <p style="margin-bottom:10px;"><strong style="color:var(--text-main);">3. 信息保护</strong></p>
        <p style="margin-bottom:8px;">我们采用行业标准的加密技术保护您的个人信息，未经您的同意不会向第三方披露。</p>
        <p style="margin-bottom:10px;"><strong style="color:var(--text-main);">4. 数据存储</strong></p>
        <p style="margin-bottom:8px;">您的数据存储在安全的服务器上，我们会定期备份以防止数据丢失。</p>
        <p style="margin-bottom:10px;"><strong style="color:var(--text-main);">5. 用户权利</strong></p>
        <p>您有权访问、更正或删除您的个人信息。如需行使相关权利，请联系我们的客服团队。</p>
      </div>
      <van-button block round plain type="primary" style="margin-top:14px;" @click="showPrivacy = false">关闭</van-button>
    </van-popup>

    <!-- 关于我们弹窗 -->
    <van-popup v-model:show="showAbout" position="bottom" round style="max-height:60vh;padding:20px 18px;">
      <div style="text-align:center;padding:10px 0;">
        <div style="width:60px;height:60px;background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
        </div>
        <h3 style="font-size:18px;font-weight:700;color:var(--text-main);">AI 口语·作文教练</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">版本 1.0.0</p>
      </div>
      <div style="background:var(--bg-page);border-radius:12px;padding:14px;margin-top:14px;font-size:12px;color:var(--text-secondary);line-height:1.7;">
        <p>AI 口语·作文教练是一款基于人工智能技术的英语学习应用，致力于为用户提供个性化的口语练习和作文批改服务。</p>
        <p style="margin-top:8px;">核心功能：</p>
        <p>• AI 智能口语陪练，实时语音对话</p>
        <p>• 作文智能批改，多维度评分反馈</p>
        <p>• 全真模考，还原真实考试场景</p>
        <p>• 专项训练，针对薄弱环节提升</p>
        <p>• 学习报告，可视化追踪进步</p>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:11px;color:var(--text-muted);">
        <p>联系邮箱：support@ai-coach.com</p>
        <p style="margin-top:4px;">© 2024 AI Coach Team. All rights reserved.</p>
      </div>
      <van-button block round plain type="primary" style="margin-top:14px;" @click="showAbout = false">关闭</van-button>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportApi } from '@/api'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const authStore = useAuthStore()
const router = useRouter()
const report = ref(null)
const showGoal = ref(false)
const showInvite = ref(false)
const showSettings = ref(false)
const showUserInfo = ref(false)
const showAbilityDetail = ref(false)
const showFavorites = ref(false)
const showReminder = ref(false)
const showPrivacy = ref(false)
const showAbout = ref(false)

// 提醒设置状态
const reminderDaily = ref(true)
const reminderTime = ref('20:00')
const reminderStreak = ref(true)
const reminderReport = ref(true)

// 目标设置
const goalExam = ref('雅思 IELTS')
const goalScore = ref(7)
const goalTime = ref(30)
const examOptions = ['雅思 IELTS', '托福 TOEFL', '四六级 CET', '高考', '考研']
const timeOptions = [15, 30, 45, 60]

// 模拟收藏数据 - 新用户为空
const favorites = ref([])

const user = computed(() => authStore.user || {})
const avatarChar = computed(() => (user.value.username || '学').slice(0, 1).toUpperCase())

// 邀请码
const inviteCode = computed(() => {
  const id = user.value.id || 0
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  let seed = id * 2654435761
  for (let i = 0; i < 6; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    code += chars[seed % chars.length]
  }
  return code
})

// 能力评估 - 使用真实数据，新用户全部为0
const radarItems = computed(() => {
  const r = report.value?.radar
  if (!r) return [
    { label: '发音', pct: 0, score: '0.0' }, { label: '语法', pct: 0, score: '0.0' },
    { label: '词汇', pct: 0, score: '0.0' }, { label: '流利度', pct: 0, score: '0.0' },
    { label: '写作', pct: 0, score: '0.0' }, { label: '逻辑', pct: 0, score: '0.0' },
  ]
  return [
    { label: '发音', pct: r.pronunciation, score: (r.pronunciation / 100 * 9).toFixed(1) },
    { label: '语法', pct: r.grammar, score: (r.grammar / 100 * 9).toFixed(1) },
    { label: '词汇', pct: r.vocabulary, score: (r.vocabulary / 100 * 9).toFixed(1) },
    { label: '流利度', pct: r.fluency, score: (r.fluency / 100 * 9).toFixed(1) },
    { label: '写作', pct: r.writing, score: (r.writing / 100 * 9).toFixed(1) },
    { label: '逻辑', pct: r.logic, score: (r.logic / 100 * 9).toFixed(1) },
  ]
})

// 能力提升建议
const abilityTips = {
  '发音': '建议多做跟读练习，注意重音和连读',
  '语法': '重点复习从句和时态，多做语法专项训练',
  '词汇': '每日积累高频词汇，注意词汇搭配',
  '流利度': '增加口语对话频率，减少停顿',
  '写作': '多练习论证结构，注意段落衔接',
  '逻辑': '加强论点组织能力，练习因果关系表达',
}

const percentile = computed(() => report.value?.percentile || 0)
const level = computed(() => {
  const avg = radarItems.value.reduce((s, d) => s + d.pct, 0) / 6
  if (avg >= 80) return 5
  if (avg >= 65) return 4
  if (avg >= 50) return 3
  if (avg >= 35) return 2
  return 1
})
const levelName = computed(() => ['入门', '初级', '中级', '中高级', '高级'][level.value - 1])

// 菜单 - 删除"我的订单"，"我的收藏"可点击
const menuItems = [
  { text: '我的收藏', bg: '#fff3e0', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', action: () => { showFavorites.value = true } },
  { text: '学习目标', bg: '#e8f5e9', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', action: () => { showGoal.value = true } },
  { text: '邀请好友', bg: '#f3e5f5', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#af52de" stroke-width="2"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><rect x="6" y="4" width="12" height="8" rx="1"/><path d="M12 12V4"/><path d="M12 4l3 3M12 4L9 7"/></svg>', action: () => { showInvite.value = true } },
]

const settingsItems = [
  { text: '常规设置', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c6c70" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15 1.65 1.65 0 0 0 3.17 14H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>', action: () => { showSettings.value = true } },
  { text: '提醒设置', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c6c70" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>', action: () => { showReminder.value = true } },
  { text: '隐私政策', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c6c70" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>', action: () => { showPrivacy.value = true } },
  { text: '关于我们', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c6c70" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>', action: () => { showAbout.value = true } },
]

function logout() {
  authStore.logout()
  router.push('/login')
}

function formatDate(dateStr) {
  if (!dateStr) return '刚刚注册'
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

async function copyInviteLink() {
  const link = `${window.location.origin}/login?invite=${inviteCode.value}`
  try {
    await navigator.clipboard.writeText(link)
    showToast('邀请链接已复制')
  } catch {
    showToast('复制失败，请手动复制')
  }
}

onMounted(async () => {
  await authStore.fetchMe()
  try { report.value = await reportApi.getReport('week') } catch { report.value = null }
})
</script>
