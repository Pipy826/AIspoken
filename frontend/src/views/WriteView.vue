<template>
  <div class="page-scroll" style="padding-top:0;background:var(--bg-page);">
    <div style="background:#fff;padding:14px 20px 10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);">
      <h1 style="font-size:20px;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:6px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        作文批改
      </h1>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="tag" :class="store.mode === 'deep' ? 'tag-orange' : 'tag-green'" style="cursor:pointer;" @click="toggleMode">
          {{ store.mode === 'deep' ? '深度批改' : '快速批改' }}
        </span>
        <span v-if="store.result" style="font-size:12px;color:var(--primary);cursor:pointer;" @click="store.reset()">新批改</span>
      </div>
    </div>

    <!-- 题目输入区 -->
    <div class="card card-p card-mb" style="margin-top:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:14px;font-weight:600;color:var(--text-main);">题目（可选）</span>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--primary);cursor:pointer;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          拍照识别
          <input type="file" accept="image/*" capture="environment" style="display:none;" @change="onPhotoCapture" />
        </label>
      </div>
      <textarea
        v-model="store.topicText"
        rows="2"
        placeholder="输入作文题目，或拍照识别题目（留空则进行综合批改）"
        style="width:100%;background:#f7f8fc;border:1px solid var(--border-light);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.6;color:var(--text-main);font-family:inherit;resize:none;outline:none;"
      />
      <!-- OCR 识别状态 -->
      <div v-if="ocrLoading" style="font-size:11px;color:var(--accent-warn);margin-top:4px;display:flex;align-items:center;gap:4px;">
        <span class="loading-dot" style="width:6px;height:6px;"></span> 正在识别图片中的文字...
      </div>
    </div>

    <!-- 作文输入区 -->
    <div class="card card-p card-mb">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;">作文正文</div>
      <textarea
        v-model="store.essayText"
        rows="10"
        placeholder="在此输入或粘贴作文（至少 50 字）…"
        class="essay-input"
      />
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span style="font-size:13px;color:var(--text-muted);">共 {{ store.wordCount }} 字</span>
        <van-button size="small" type="primary" :loading="store.isLoading" :disabled="store.wordCount < 50" @click="store.correct()">
          提交批改
        </van-button>
      </div>
    </div>

    <!-- 批改结果 -->
    <template v-if="store.result">
      <div ref="resultRef" class="card card-p card-mb" style="text-align:center;">
        <div style="font-size:15px;font-weight:600;color:var(--text-main);margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
          ▤ 批改结果
          <span style="font-size:13px;font-weight:400;color:var(--primary);cursor:pointer;" @click="$router.push('/report')">查看报告 →</span>
        </div>
        <div style="display:flex;justify-content:center;margin-bottom:16px;">
          <div style="position:relative;width:100px;height:100px;">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-muted)" stroke-width="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" stroke-width="8" stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="ringOffset" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset 1s ease;" />
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <span style="font-size:26px;font-weight:800;color:var(--primary);">{{ store.result.overall.toFixed(1) }}</span>
              <span style="font-size:11px;color:var(--text-muted);">/ 9.0</span>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px;">
          <div v-for="d in dimCards" :key="d.key" style="background:var(--bg-page);border-radius:12px;padding:10px 12px;text-align:left;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">{{ d.label }}</div>
            <div style="font-size:20px;font-weight:700;color:var(--text-main);margin-bottom:4px;">{{ d.score.toFixed(1) }}</div>
            <div class="progress-bar" style="height:4px;"><div class="progress-fill" :style="{ width: (d.score / 9 * 100) + '%' }" /></div>
          </div>
        </div>

        <div v-if="store.result.summary" style="text-align:left;">
          <div v-if="store.result.summary.strengths?.length" style="margin-bottom:8px;">
            <div style="font-size:12px;font-weight:600;color:#34c759;margin-bottom:4px;">✦ 亮点</div>
            <div v-for="(s, i) in store.result.summary.strengths" :key="i" style="font-size:13px;color:var(--text-main);padding:3px 0;">· {{ s }}</div>
          </div>
          <div v-if="store.result.summary.improvements?.length">
            <div style="font-size:12px;font-weight:600;color:#ff9500;margin-bottom:4px;">▲ 待提升</div>
            <div v-for="(s, i) in store.result.summary.improvements" :key="i" style="font-size:13px;color:var(--text-main);padding:3px 0;">· {{ s }}</div>
          </div>
        </div>
      </div>

      <div v-if="gradingLevels.length" class="card card-p card-mb">
        <div style="font-size:15px;font-weight:600;color:var(--text-main);margin-bottom:10px;">📋 批改详情</div>
        <div v-for="(lv, i) in gradingLevels" :key="i" style="display:flex;align-items:flex-start;gap:10px;font-size:14px;padding:8px 0;border-bottom:1px solid var(--border-light);" :style="i === gradingLevels.length - 1 ? { borderBottom: 'none' } : {}">
          <span class="dot" :class="lv.dot" style="margin-top:5px;" />
          <span><strong>{{ lv.category }}：</strong>{{ lv.text }}</span>
        </div>
      </div>

      <div v-if="previewHtml" class="card card-p card-mb">
        <div style="font-size:15px;font-weight:600;color:var(--text-main);margin-bottom:8px;">🔍 批注预览</div>
        <div class="essay-preview" v-html="previewHtml" />
      </div>

      <div class="card card-p card-mb">
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <van-button type="primary" round style="flex:1;min-width:100px;" @click="showOptimized = true">📃 查看优化方案</van-button>
          <van-button round plain type="primary" style="flex:1;min-width:100px;" @click="copyOptimized">📋 复制优化版</van-button>
        </div>
      </div>
    </template>

    <div class="page-bottom" />

    <van-popup v-model:show="showOptimized" position="bottom" round style="max-height:80vh;padding:20px;overflow-y:auto;">
      <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;">📃 优化方案</h3>
      <div style="font-size:14px;line-height:1.8;color:var(--text-main);" v-html="store.result?.optimized" />
      <van-button block round type="primary" style="margin-top:16px;" @click="showOptimized = false">关闭</van-button>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useWriteStore } from '@/stores/write'
import { showToast } from 'vant'

const store = useWriteStore()
const showOptimized = ref(false)
const resultRef = ref(null)
const ocrLoading = ref(false)

const circumference = 2 * Math.PI * 40

watch(() => store.result, (val) => {
  if (val) nextTick(() => resultRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
})

const gradingLevels = computed(() => store.result?.grading_levels || [])
const dimCards = computed(() => {
  if (!store.result?.dimensions) return []
  return store.result.dimensions.filter(d => d.key !== 'total')
})
const ringOffset = computed(() => {
  if (!store.result) return circumference
  return circumference * (1 - Math.min(1, store.result.overall / 9))
})

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function hlClass(type) {
  if (type === 'error') return 'hl-error'
  if (type === 'good') return 'hl-good'
  return 'hl-warning'
}
const previewHtml = computed(() => {
  if (!store.result || !store.essayText.trim()) return ''
  const anns = store.result.annotations || []
  const essay = store.essayText
  const sorted = [...anns].sort((a, b) => essay.indexOf(a.original) - essay.indexOf(b.original))
  const parts = []
  let cursor = 0
  for (const a of sorted) {
    const idx = essay.indexOf(a.original, cursor)
    if (idx === -1) continue
    parts.push(escapeHtml(essay.slice(cursor, idx)))
    parts.push(`<span class="${hlClass(a.type)}" title="${escapeHtml(a.suggestion)}">${escapeHtml(a.original)}</span>`)
    cursor = idx + a.original.length
  }
  parts.push(escapeHtml(essay.slice(cursor)))
  return parts.join('')
})

function toggleMode() {
  store.setMode(store.mode === 'deep' ? 'quick' : 'deep')
}

async function copyOptimized() {
  const text = store.result?.optimized?.replace(/<[^>]+>/g, '') || ''
  if (!text) { showToast('暂无优化内容'); return }
  try {
    await navigator.clipboard.writeText(text)
    showToast('✅ 已复制到剪贴板')
  } catch { showToast('复制失败') }
}

// 拍照 OCR 识别题目
async function onPhotoCapture(event) {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = '' // 重置 input

  ocrLoading.value = true
  try {
    // 使用 Canvas 压缩图片后提取文字
    const text = await extractTextFromImage(file)
    if (text) {
      store.topicText = text
      showToast('✅ 题目识别成功')
    } else {
      showToast('未识别到文字，请手动输入')
    }
  } catch {
    showToast('识别失败，请手动输入题目')
  } finally {
    ocrLoading.value = false
  }
}

async function extractTextFromImage(file) {
  // 将图片转为 base64，发送给后端 DeepSeek 做 OCR
  const base64 = await fileToBase64(file)
  try {
    const { writeApi } = await import('@/api')
    const res = await writeApi.ocr(base64)
    return res.text || ''
  } catch {
    return ''
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.essay-input {
  width: 100%; background: #f7f8fc; border: 1px solid var(--border-light);
  border-radius: 12px; padding: 14px 16px; font-size: 14px; line-height: 1.7;
  color: var(--text-main); font-family: inherit; resize: none; outline: none;
}
.essay-preview {
  background: #f7f8fc; border-radius: 12px; padding: 14px 16px;
  font-size: 14px; line-height: 1.8; color: #3a3a3c; max-height: 220px; overflow-y: auto;
}
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.green { background: #34c759; }
.dot.orange { background: #ff9500; }
.dot.blue { background: var(--primary); }
.dot.purple { background: #af52de; }
</style>
