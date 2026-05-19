<template>
  <div class="page-scroll" style="background:var(--bg-page);">
    <!-- 顶部栏 -->
    <div style="background:#fff;padding:12px 18px 8px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);">
      <h1 style="font-size:18px;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:6px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        学习报告
      </h1>
      <span style="font-size:12px;color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:4px;" @click="showErrorBook = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        错题本
      </span>
    </div>

    <!-- 时间切换 -->
    <div style="padding:12px 14px 0;">
      <div style="display:flex;background:var(--bg-muted);border-radius:10px;padding:3px;">
        <span v-for="p in periods" :key="p.key"
          :style="{ flex:1, textAlign:'center', padding:'6px 0', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all .2s',
            background: period === p.key ? '#fff' : 'transparent',
            color: period === p.key ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: period === p.key ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }"
          @click="setPeriod(p.key)">{{ p.label }}</span>
      </div>
    </div>

    <!-- 六维能力雷达图 -->
    <div class="card card-p card-mb" style="margin-top:12px;">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        能力雷达图
      </div>
      <div style="display:flex;justify-content:center;padding:10px 0;overflow:visible;">
        <svg width="100%" height="220" viewBox="-50 -10 300 220" style="max-width:320px;">
          <!-- 网格 -->
          <polygon :points="gridPoints(1)" fill="none" stroke="#e9ecf2" stroke-width="1"/>
          <polygon :points="gridPoints(0.67)" fill="none" stroke="#e9ecf2" stroke-width="1"/>
          <polygon :points="gridPoints(0.33)" fill="none" stroke="#e9ecf2" stroke-width="1"/>
          <!-- 数据区域 -->
          <polygon :points="dataPoints" fill="rgba(74,108,247,.15)" stroke="var(--primary)" stroke-width="2"/>
          <!-- 数据点 -->
          <circle v-for="(pt, i) in dataPointsArray" :key="i" :cx="pt.x" :cy="pt.y" r="4" fill="var(--primary)"/>
          <!-- 标签 -->
          <text v-for="(lbl, i) in radarLabels" :key="'l'+i" :x="lbl.x" :y="lbl.y" :text-anchor="lbl.anchor" font-size="12" fill="#3a3a3c" font-weight="500">{{ lbl.text }}</text>
        </svg>
      </div>
    </div>

    <!-- 学习时长柱状图 -->
    <div class="card card-p card-mb">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          学习时长
        </span>
        <span style="font-size:11px;color:var(--primary);font-weight:400;">共 {{ totalMinutes }} 分钟</span>
      </div>
      <div v-if="studyHistory.length === 0" style="display:flex;align-items:center;justify-content:center;height:80px;color:var(--text-muted);font-size:12px;">
        暂无学习记录，开始练习后这里会显示数据
      </div>
      <div v-else style="display:flex;align-items:flex-end;justify-content:space-between;height:80px;padding:0 4px;">
        <div v-for="(m, i) in studyHistory" :key="i" style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;">
          <div :style="{ width:'20px', height: barHeight(m) + 'px', background: i === currentPeriodIndex ? 'var(--primary)' : (m === maxMinutes ? 'var(--accent-warn)' : 'var(--primary-light)'), borderRadius:'4px 4px 0 0', opacity: i === currentPeriodIndex || m === maxMinutes ? 1 : 0.7 }"></div>
          <span :style="{ fontSize:'9px', color: i === currentPeriodIndex ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i === currentPeriodIndex ? '600' : '400' }">{{ dayLabels[i] }}</span>
        </div>
      </div>
    </div>

    <!-- 评分趋势 -->
    <div class="card card-p card-mb">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        评分趋势
      </div>
      <div style="display:flex;gap:12px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:3px;background:var(--primary);border-radius:2px;"></span><span style="font-size:10px;color:var(--text-secondary);">口语 {{ speakScore }}</span></div>
        <div style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:3px;background:var(--accent-warn);border-radius:2px;"></span><span style="font-size:10px;color:var(--text-secondary);">作文 {{ writeScore }}</span></div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;">
        <span>口语趋势 <strong :style="{color: speakTrend >= 0 ? 'var(--accent-green)' : 'var(--accent-coral)'}">{{ speakTrend >= 0 ? '+' : '' }}{{ speakTrend }}</strong></span>
        <span>作文趋势 <strong :style="{color: writeTrend >= 0 ? 'var(--accent-green)' : 'var(--accent-coral)'}">{{ writeTrend >= 0 ? '+' : '' }}{{ writeTrend }}</strong></span>
      </div>
    </div>

    <!-- 学习成就 -->
    <div class="card card-p card-mb">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warn)" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
        学习成就
      </div>
      <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;">
        <div v-for="badge in badges" :key="badge.name" :style="{ minWidth:'70px', textAlign:'center', padding:'8px', background: badge.unlocked ? badge.bg : 'var(--bg-muted)', borderRadius:'12px', opacity: badge.unlocked ? 1 : 0.5 }">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="badge.unlocked ? badge.color : 'var(--text-muted)'" stroke-width="2" v-html="badge.path"></svg>
          <div style="font-size:10px;font-weight:600;margin-top:3px;">{{ badge.name }}</div>
        </div>
      </div>
    </div>

    <!-- AI 数据洞察 -->
    <div class="card card-p card-mb" style="background:linear-gradient(135deg,#f0f4ff,#fff);">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
        AI 数据洞察
      </div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.7;">
        <p>本周学习数据分析：</p>
        <p style="margin-top:6px;" v-for="(tip, i) in aiTips" :key="i" v-html="tip"></p>
        <p style="margin-top:6px;color:var(--primary);font-weight:500;">建议：本周重点关注{{ weakestArea }}专项训练</p>
      </div>
    </div>

    <div style="height:24px;"></div>

    <!-- 错题本弹窗 -->
    <van-popup v-model:show="showErrorBook" position="bottom" round style="max-height:70vh;overflow-y:auto;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:4px;">错题本</h3>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px;">共 {{ errorBook?.total || 0 }} 道错题 · {{ errorBook?.today_review || 0 }} 道待复习</p>
      <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;">
        <div v-for="item in errorBook?.items || []" :key="item.id" style="background:var(--bg-page);border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" :style="{ background: item.error_type === 'pronunciation' ? '#fff3e0' : item.error_type === 'grammar' ? '#e8f5e9' : '#f0f4ff' }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="item.error_type === 'pronunciation' ? 'var(--accent-warn)' : item.error_type === 'grammar' ? 'var(--accent-green)' : 'var(--primary)'" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:500;">{{ item.content }}</div>
            <div style="font-size:10px;color:var(--text-muted);">{{ item.correction }}</div>
          </div>
          <span class="tag" :class="item.reviewed ? 'tag-green' : 'tag-orange'" style="font-size:10px;cursor:pointer;" @click="reviewItem(item)">{{ item.reviewed ? '已复习' : '复习' }}</span>
        </div>
        <div v-if="!errorBook?.items?.length" style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">暂无错题记录</div>
      </div>
      <van-button block round type="primary" style="margin-top:14px;" @click="showErrorBook = false">开始复习</van-button>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reportApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const report = ref(null)
const errorBook = ref(null)
const aiInsight = ref(null)
const showErrorBook = ref(false)
const period = ref('week')
const periods = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
]

async function setPeriod(p) {
  period.value = p
  try { report.value = await reportApi.getReport(p) } catch { report.value = null }
}

// 雷达图计算 - 新用户全部为0
const radarDims = computed(() => {
  const r = report.value?.radar
  if (!r) return [0, 0, 0, 0, 0, 0]
  return [r.pronunciation, r.grammar, r.vocabulary, r.fluency, r.writing, r.logic]
})

const radarLabelsData = ['发音', '语法', '词汇', '流利度', '写作', '逻辑']

function hexPoint(cx, cy, radius, angle) {
  const rad = (angle - 90) * Math.PI / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

function gridPoints(scale) {
  const r = 60 * scale
  return [0, 60, 120, 180, 240, 300].map(a => {
    const p = hexPoint(100, 100, r, a)
    return `${p.x},${p.y}`
  }).join(' ')
}

const dataPointsArray = computed(() => {
  return radarDims.value.map((v, i) => {
    const r = (v / 100) * 60
    return hexPoint(100, 100, r, i * 60)
  })
})

const dataPoints = computed(() => dataPointsArray.value.map(p => `${p.x},${p.y}`).join(' '))

const radarLabels = computed(() => {
  const positions = [
    { x: 100, y: 22, anchor: 'middle' },
    { x: 180, y: 58, anchor: 'start' },
    { x: 180, y: 150, anchor: 'start' },
    { x: 100, y: 190, anchor: 'middle' },
    { x: 20, y: 150, anchor: 'end' },
    { x: 20, y: 58, anchor: 'end' },
  ]
  return positions.map((pos, i) => ({
    ...pos,
    text: `${radarLabelsData[i]} ${(radarDims.value[i] / 100 * 9).toFixed(1)}`
  }))
})

// 学习时长 - 使用后端返回的真实数据
const studyHistory = computed(() => report.value?.study_history || [])
const totalMinutes = computed(() => studyHistory.value.reduce((a, b) => a + b, 0))
const maxMinutes = computed(() => Math.max(...studyHistory.value, 1))

// 使用后端返回的标签，根据 period 自动适配
const dayLabels = computed(() => {
  if (report.value?.study_labels?.length) return report.value.study_labels
  // 后端未返回时的兜底：根据 period 生成
  if (period.value === 'week') {
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const today = new Date().getDay() // 0=周日
    const todayIdx = today === 0 ? 6 : today - 1 // 转为 0=周一
    return weekDays.map((d, i) => i === todayIdx ? '今天' : d)
  }
  if (period.value === 'month') {
    return studyHistory.value.map((_, i) => `第${i + 1}周`)
  }
  if (period.value === 'year') {
    return Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
  }
  return []
})

function barHeight(m) {
  return Math.max(4, (m / maxMinutes.value) * 65)
}

// 当前时间对应的柱子索引（高亮"今天"/"本周"/"本月"）
const currentPeriodIndex = computed(() => {
  if (period.value === 'week') {
    // 本周视图：高亮今天（周一=0, 周二=1, ...）
    const today = new Date().getDay() // 0=周日
    return today === 0 ? 6 : today - 1 // 转为 0=周一
  }
  if (period.value === 'month') {
    // 本月视图：高亮当前是第几周
    const today = new Date()
    const weekOfMonth = Math.ceil(today.getDate() / 7) - 1
    return Math.min(weekOfMonth, studyHistory.value.length - 1)
  }
  if (period.value === 'year') {
    // 本年视图：高亮当前月份
    return new Date().getMonth() // 0=1月
  }
  return -1
})

// 评分趋势 - 真实数据，新用户为0
const speakScore = computed(() => (report.value?.speak_score ?? 0).toFixed(1))
const writeScore = computed(() => (report.value?.write_score ?? 0).toFixed(1))
const speakTrend = computed(() => (report.value?.speak_trend ?? 0).toFixed(1))
const writeTrend = computed(() => (report.value?.write_trend ?? 0).toFixed(1))

// 成就徽章
const badges = computed(() => {
  const user = auth.user || {}
  return [
    { name: '7天连续', path: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', color: 'var(--accent-warn)', unlocked: (user.streak || 0) >= 7 },
    { name: '首次8分', path: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', color: 'var(--accent-green)', unlocked: (report.value?.speak_score || 0) >= 8 },
    { name: '百篇作文', path: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>', bg: 'linear-gradient(135deg,#f0f4ff,#e8eeff)', color: 'var(--primary)', unlocked: (report.value?.essay_count || 0) >= 100 },
    { name: '词汇达人', path: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', color: '#af52de', unlocked: (radarDims.value[2] || 0) >= 80 },
    { name: '待解锁', path: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>', bg: 'var(--bg-muted)', color: 'var(--text-muted)', unlocked: false },
  ]
})

// AI 洞察
const weakestArea = computed(() => {
  if (aiInsight.value?.weakest_area) return aiInsight.value.weakest_area
  const dims = radarDims.value
  const labels = ['发音', '语法', '词汇', '流利度', '写作', '逻辑']
  const minIdx = dims.indexOf(Math.min(...dims))
  return labels[minIdx]
})

const aiTips = computed(() => {
  if (aiInsight.value?.tips?.length) return aiInsight.value.tips.map(t => `• ${t}`)
  const r = report.value
  if (!r) return ['开始练习后，AI 将为你生成学习数据分析']
  const tips = []
  if (r.speak_score > 0) {
    if (r.speak_trend > 0) tips.push(`• 口语流利度提升 <strong style="color:var(--accent-green)">+${r.speak_trend.toFixed(1)}</strong>，继续保持每日对话练习`)
    else tips.push(`• 口语评分 <strong style="color:var(--primary)">${r.speak_score.toFixed(1)}</strong>，建议增加每日对话频率`)
  }
  if (r.write_score > 0) tips.push(`• 作文评分 <strong style="color:var(--primary)">${r.write_score.toFixed(1)}</strong>，${r.write_trend >= 0 ? '稳步提升中' : '建议重点练习论证结构'}`)
  if (r.percentile > 0) tips.push(`• 超越 <strong style="color:var(--primary)">${r.percentile}%</strong> 同龄学习者`)
  if (tips.length === 0) tips.push('• 完成首次练习后将生成个性化学习建议')
  return tips
})

onMounted(async () => {
  try { report.value = await reportApi.getReport('week') } catch { report.value = null }
  try { errorBook.value = await reportApi.getErrorBook() } catch { errorBook.value = null }
  try { aiInsight.value = await reportApi.getAiInsight() } catch { aiInsight.value = null }
})

async function reviewItem(item) {
  if (item.reviewed) return
  try {
    await reportApi.reviewErrorItem(item.id)
    item.reviewed = true
  } catch { /* ignore */ }
}
</script>
