<template>
  <div class="page-scroll" style="padding-top:0;background:var(--bg-page);">
    <!-- 用户头部 -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px 12px;background:#fff;border-bottom:1px solid var(--border-light);">
      <div style="display:flex;flex-direction:column;">
        <span style="font-size:22px;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:6px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          {{ greetingLine }}
        </span>
        <span style="font-size:14px;color:var(--text-secondary);margin-top:2px;">
          {{ dash?.greeting_sub || fallbackSub }}
        </span>
      </div>
      <div style="width:48px;height:48px;background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:600;cursor:pointer;" @click="$router.push('/profile')">
        {{ avatarChar }}
      </div>
    </div>

    <!-- 进度 + 打卡记录卡片 -->
    <div class="card card-p card-mb" style="margin-top:14px;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
        <div class="progress-ring" :style="ringStyle">
          <span style="position:absolute;width:44px;height:44px;background:#fff;border-radius:50%;" />
          <span style="position:relative;z-index:1;">{{ ringPct }}%</span>
        </div>
        <div style="flex:1;">
          <div style="font-size:14px;color:var(--text-secondary);display:flex;align-items:center;gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {{ dash?.monthly_goal?.label || '本月目标：完成练习' }}
          </div>
          <div class="progress-bar" style="margin-top:6px;">
            <div class="progress-fill" :style="{ width: barPct + '%' }" />
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
            {{ dash?.monthly_goal?.sub_text || '加载中…' }}
          </div>
        </div>
      </div>
      <!-- 近 14 天打卡记录 -->
      <div style="border-top:1px solid var(--border-light);padding-top:10px;">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">
          近 14 天打卡 · 连续 {{ user.streak ?? 0 }} 天
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          <div
            v-for="d in streakDots"
            :key="d.date"
            :title="d.date"
            :style="{
              width: '18px', height: '18px', borderRadius: '50%',
              background: d.isToday ? '#ff9500' : d.checked ? 'var(--primary)' : 'var(--bg-muted)',
              flexShrink: 0, transition: 'background .3s',
            }"
          />
        </div>
      </div>
    </div>

    <!-- 本周数据统计 -->
    <div class="card card-p card-mb">
      <div style="font-size:15px;font-weight:600;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        本周数据
      </div>
      <div style="display:flex;justify-content:space-around;">
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--primary);">{{ user.streak ?? 0 }}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">连续天数</div></div>
        <div style="width:1px;background:var(--border-light);" />
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--primary);">{{ user.total_sessions ?? 0 }}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">练习次数</div></div>
        <div style="width:1px;background:var(--border-light);" />
        <div style="text-align:center;"><div style="font-size:22px;font-weight:700;color:var(--primary);">{{ user.total_minutes ?? 0 }}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;">学习分钟</div></div>
      </div>
    </div>

    <!-- 快捷功能 -->
    <div class="card card-p card-mb">
      <div style="font-size:16px;font-weight:600;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warn)" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        快捷功能
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:4px;">
        <div class="qi" @click="$router.push('/speak')">
          <span class="qi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg></span>
          <span class="qi-label">口语练习</span>
        </div>
        <div class="qi" @click="$router.push('/write')">
          <span class="qi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
          <span class="qi-label">作文批改</span>
        </div>
        <div class="qi" @click="$router.push('/exam')">
          <span class="qi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
          <span class="qi-label">全真模考</span>
        </div>
        <div class="qi" @click="$router.push('/improve')">
          <span class="qi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
          <span class="qi-label">专项训练</span>
        </div>
      </div>
    </div>

    <!-- 快速练习入口 -->
    <div class="card card-p card-mb">
      <div style="font-size:15px;font-weight:600;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        快速练习
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="quick-btn" @click="$router.push('/speak')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/></svg>雅思口语</div>
        <div class="quick-btn" @click="$router.push('/write')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>议论文批改</div>
        <div class="quick-btn" @click="$router.push('/improve')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>发音纠正</div>
        <div class="quick-btn" @click="$router.push('/report')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warn)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>错题复习</div>
      </div>
    </div>

    <!-- 今日推荐 -->
    <div class="card card-p card-mb">
      <div style="font-size:16px;font-weight:600;color:var(--text-main);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:flex;align-items:center;gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warn)" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          今日推荐
        </span>
        <span style="font-size:13px;font-weight:400;color:var(--primary);">更多 →</span>
      </div>
      <div
        v-for="(r, i) in recs"
        :key="i"
        class="rec-row"
        :class="{ last: i === recs.length - 1 }"
        style="cursor:pointer;"
        @click="onRecClick(r)"
      >
        <div class="rec-icon" :style="{ background: recColors[i % 3] }">
          <svg v-if="r.icon === 'volume' || r.icon === 'mic'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <svg v-else-if="r.icon === 'edit'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div style="flex:1;">
          <div style="font-size:15px;font-weight:500;color:var(--text-main);">{{ r.title }}</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">{{ r.desc }}</div>
        </div>
        <span style="font-size:14px;color:var(--primary);font-weight:500;">{{ r.action_label }} →</span>
      </div>
    </div>

    <div class="page-bottom" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { homeApi } from '@/api'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const dash = ref(null)

const user = computed(() => auth.user || {})
const recColors = ['#f0f4ff', '#f3e5f5', '#e8f5e9']

const defaultRecs = [
  { icon: 'volume', title: '每日跟读 · 地道发音', desc: '重音 & 连读专项训练', action_label: '开始' },
  { icon: 'edit', title: '语法巩固 · 错题复习', desc: '结合最近作文批改查漏补缺', action_label: '去作文' },
  { icon: 'book', title: '金句积累 · 雅思口语', desc: '高分表达与例句', action_label: '查看' },
]

const greetingLine = computed(() => {
  const p = dash.value?.greeting_prefix || '你好'
  const n = dash.value?.display_name || user.value.username || '学习者'
  return `${p}，${n}`
})

const fallbackSub = computed(() => {
  const m = user.value.total_minutes ?? 0
  const s = user.value.streak ?? 0
  return `今日学习 ${m} 分钟 · 连续学习 ${s} 天`
})

const avatarChar = computed(() => {
  const u = user.value.username || '学'
  return u.slice(0, 1).toUpperCase()
})

const ringPct = computed(() => dash.value?.monthly_goal?.ring_percent ?? 0)
const barPct = computed(() => dash.value?.monthly_goal?.bar_percent ?? 0)
const recs = computed(() => dash.value?.recommendations?.length ? dash.value.recommendations : defaultRecs)

const ringStyle = computed(() => {
  const p = ringPct.value
  const deg = (p / 100) * 360
  return {
    width: '56px', height: '56px', borderRadius: '50%',
    background: `conic-gradient(var(--primary) 0deg ${deg}deg, var(--bg-muted) ${deg}deg 360deg)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 700, color: 'var(--primary)',
    position: 'relative', flexShrink: 0,
  }
})

const streakDots = computed(() => {
  const checkedSet = new Set(user.value.streak_dates || [])
  const today = new Date()
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (13 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { date: key, checked: checkedSet.has(key), isToday: i === 13 }
  })
})

onMounted(async () => {
  await auth.fetchMe()
  try { dash.value = await homeApi.dashboard() } catch { dash.value = null }
})

function onRecClick(r) {
  const label = r.action_label || ''
  if (label.includes('口语') || label === '去口语' || label === '开始') router.push('/speak')
  else if (label.includes('作文') || label === '去作文') router.push('/write')
  else router.push('/improve')
}
</script>

<style scoped>
.qi {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 0; background: var(--bg-page); border-radius: 14px;
  cursor: pointer; position: relative;
}
.qi:active { opacity: 0.85; transform: scale(0.95); }
.qi-icon { display: flex; align-items: center; justify-content: center; }
.qi-label { font-size: 12px; color: #3a3a3c; font-weight: 500; }
.quick-btn {
  padding: 10px 12px; background: var(--bg-page); border-radius: 12px;
  font-size: 13px; font-weight: 500; color: var(--text-main);
  cursor: pointer; text-align: center; border: 1px solid var(--border-light); transition: background .15s;
}
.quick-btn:active { background: var(--bg-muted); }
.rec-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.rec-row.last { border-bottom: none; }
.rec-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary); }
</style>
