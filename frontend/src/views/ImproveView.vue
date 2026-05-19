<template>
  <div class="page-scroll" style="background:var(--bg-page);">
    <!-- 顶部栏 -->
    <div style="background:#fff;padding:12px 18px 8px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);">
      <div style="display:flex;align-items:center;gap:8px;">
        <button @click="$router.push('/')" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-light);background:#fff;cursor:pointer;font-size:12px;">←</button>
        <h1 style="font-size:18px;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          专项提升
        </h1>
      </div>
    </div>

    <!-- AI 推荐今日训练 -->
    <div class="card card-p card-mb" style="margin-top:12px;background:linear-gradient(135deg,rgba(74,108,247,.08),rgba(124,155,247,.05));border:1px solid rgba(74,108,247,.15);">
      <div style="display:flex;gap:10px;align-items:center;">
        <div style="width:40px;height:40px;border-radius:14px;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
        </div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:13px;margin-bottom:3px;color:var(--text-main);">AI 推荐今日训练</div>
          <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">根据你的能力雷达图分析，今天重点练习<strong style="color:var(--primary);">{{ dailyData?.focus_label || '专项训练' }}</strong></div>
        </div>
      </div>
      <van-button block round type="primary" size="small" style="margin-top:10px;" @click="showDailyPractice = true">开始今日训练</van-button>
    </div>

    <!-- 四大专项模块 -->
    <div style="padding:0 14px;display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
      <div v-for="m in modules" :key="m.id"
        style="background:#fff;border-radius:16px;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.03);"
        @click="openExercise(m)">
        <div :style="{ width:'44px', height:'44px', borderRadius:'14px', background: m.color, display:'flex', alignItems:'center', justifyContent:'center' }" v-html="moduleIcon(m.id)"></div>
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:700;font-size:13px;">{{ m.title }}</span>
            <span :style="{ fontSize:'12px', fontWeight:700, color: m.iconColor }">{{ m.progress }}%</span>
          </div>
          <div style="font-size:10px;color:var(--text-secondary);margin:3px 0 5px;">{{ m.desc }}</div>
          <div class="progress-bar" style="height:5px;"><div class="progress-fill" :style="{ width: m.progress+'%', background: `linear-gradient(90deg, ${m.iconColor}88, ${m.iconColor})` }"></div></div>
        </div>
        <span style="color:var(--text-muted);font-size:14px;">›</span>
      </div>
    </div>

    <div style="height:14px;"></div>

    <!-- 专项练习弹窗 -->
    <van-popup v-model:show="showExercise" position="bottom" round style="max-height:80vh;overflow-y:auto;padding:20px 18px;">
      <div v-if="currentModule">
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <span class="tag tag-blue">{{ currentModule.title }}</span>
        </div>
        <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">{{ currentModule.exercise?.q || '加载题目中...' }}</h3>
        <div v-if="currentModule.exercise?.content" style="background:var(--bg-page);border-radius:12px;padding:14px;margin-bottom:12px;">
          <div style="font-size:13px;color:var(--text-main);line-height:1.7;">{{ currentModule.exercise.content }}</div>
        </div>
        <div v-else style="text-align:center;padding:20px;color:var(--text-muted);font-size:12px;">
          <span class="loading-dot"></span> AI 正在生成题目...
        </div>

        <!-- 发音专项：标准发音播放 + 录音跟读 -->
        <div v-if="currentModule.id === 'pronunciation' && currentModule.exercise?.content" style="margin-bottom:12px;">
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <button style="flex:1;padding:10px;border:1px solid var(--primary);border-radius:10px;background:#f0f4ff;color:var(--primary);font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;" @click="playStandardAudio" :disabled="isPlayingStandard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              {{ isPlayingStandard ? '播放中...' : '听标准发音' }}
            </button>
            <button style="flex:1;padding:10px;border:1px solid var(--accent-coral);border-radius:10px;background:#fff5f5;color:var(--accent-coral);font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;" @click="togglePronunciationRecording">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              {{ isPronRecording ? '停止录音' : '录音跟读' }}
            </button>
          </div>
          <div v-if="pronTranscript" style="background:#e8f5e9;border-radius:8px;padding:8px 10px;font-size:12px;color:#2e7d32;">
            你的发音识别：{{ pronTranscript }}
          </div>
          <div v-if="isPronTranscribing" style="font-size:11px;color:var(--accent-warn);margin-top:4px;">🔄 识别中...</div>
        </div>

        <div v-if="currentModule.exercise?.hint" style="background:#fff8e1;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:11px;color:#e65100;display:flex;align-items:center;gap:6px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e65100" stroke-width="2.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          提示：{{ currentModule.exercise.hint }}
        </div>

        <!-- 非发音专项：文字输入 -->
        <div v-if="currentModule.id !== 'pronunciation'">
          <textarea v-model="exerciseAnswer" placeholder="输入你的答案..." style="width:100%;padding:12px;border:1px solid var(--bg-muted);border-radius:12px;font-size:13px;min-height:80px;resize:none;outline:none;font-family:inherit;"></textarea>
          <van-button block round type="primary" style="margin-top:12px;" @click="submitExercise">提交答案</van-button>
        </div>
        <!-- 发音专项：提交跟读结果 -->
        <div v-else>
          <van-button block round type="primary" style="margin-top:12px;" :disabled="!pronTranscript" @click="submitPronunciation">提交跟读评估</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 每日一练弹窗 -->
    <van-popup v-model:show="showDailyPractice" position="bottom" round style="max-height:80vh;overflow-y:auto;padding:20px 18px;">
      <div v-if="dailyData">
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <span class="tag tag-orange">{{ dailyData.focus_label }}</span>
          <span class="tag tag-blue">AI推荐</span>
        </div>
        <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">{{ dailyData.type }}</h3>
        <div style="background:var(--bg-page);border-radius:12px;padding:14px;margin-bottom:12px;">
          <div style="font-size:13px;color:var(--text-main);line-height:1.7;">{{ dailyData.question }}</div>
        </div>
        <div v-if="dailyData.hints?.length" style="background:#fff8e1;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:11px;color:#e65100;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e65100" stroke-width="2.5" style="vertical-align:middle;"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          提示：{{ dailyData.hints.map(h => h.to).join(' / ') }}
        </div>
        <textarea v-model="dailyAnswer" placeholder="输入你的答案..." style="width:100%;padding:12px;border:1px solid var(--bg-muted);border-radius:12px;font-size:13px;min-height:80px;resize:none;outline:none;font-family:inherit;"></textarea>
        <van-button block round type="primary" style="margin-top:12px;" @click="submitDaily">提交答案</van-button>
      </div>
    </van-popup>

    <!-- 练习结果弹窗 -->
    <van-popup v-model:show="showResult" position="center" round style="width:80%;padding:20px;text-align:center;">
      <div style="margin-bottom:8px;">
        <svg v-if="exerciseCorrect" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-coral)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <div :style="{ fontSize:'16px', fontWeight:700, color: exerciseCorrect ? 'var(--accent-green)' : 'var(--accent-coral)', marginBottom:'4px' }">{{ exerciseCorrect ? '回答正确！' : '继续加油！' }}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">得分：{{ exerciseScore }}/10</div>
      <div v-if="exerciseFeedback" style="background:var(--bg-page);border-radius:12px;padding:12px;text-align:left;margin-bottom:10px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-main);margin-bottom:4px;">AI 反馈</div>
        <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">{{ exerciseFeedback }}</div>
      </div>
      <div style="background:var(--bg-page);border-radius:12px;padding:12px;text-align:left;margin-bottom:14px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-main);margin-bottom:4px;">参考答案</div>
        <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">{{ referenceAnswer }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <van-button round plain style="flex:1;" @click="showResult = false">返回</van-button>
        <van-button round type="primary" style="flex:1;" @click="showResult = false">下一题</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { improveApi, speakApi } from '@/api'

const modules = ref([])
const dailyData = ref(null)
const showExercise = ref(false)
const showDailyPractice = ref(false)
const showResult = ref(false)
const currentModule = ref(null)
const exerciseAnswer = ref('')
const dailyAnswer = ref('')
const referenceAnswer = ref('')
const exerciseCorrect = ref(true)
const exerciseFeedback = ref('')
const exerciseScore = ref(0)

// 发音专项状态
const isPlayingStandard = ref(false)
const isPronRecording = ref(false)
const isPronTranscribing = ref(false)
const pronTranscript = ref('')
let pronAudio = null
let pronMediaRecorder = null

// SVG icons for modules
const moduleIcons = {
  pronunciation: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
  grammar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  vocabulary: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  logic: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e65100" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
}

function moduleIcon(id) { return moduleIcons[id] || moduleIcons.grammar }

function openExercise(m) {
  currentModule.value = { ...m, exercise: null }
  exerciseAnswer.value = ''
  pronTranscript.value = ''
  isPlayingStandard.value = false
  isPronRecording.value = false
  showExercise.value = true
  loadExercise(m.id)
}

async function loadExercise(moduleId) {
  try {
    const exercise = await improveApi.getExercise(moduleId)
    if (currentModule.value) {
      currentModule.value.exercise = exercise
    }
  } catch {
    if (currentModule.value) {
      currentModule.value.exercise = { q: '加载失败', content: '请重试', hint: '' }
    }
  }
}

// ── 发音专项功能 ──────────────────────────────────────
async function playStandardAudio() {
  const exercise = currentModule.value?.exercise
  if (!exercise?.content) return

  // 如果有后端预生成的音频
  if (exercise.audio_base64) {
    playBase64Audio(exercise.audio_base64)
    return
  }

  // 实时调用后端本地 TTS
  isPlayingStandard.value = true
  try {
    const blob = await speakApi.tts(exercise.content, 'ielts')
    const url = URL.createObjectURL(blob)
    pronAudio = new Audio(url)
    pronAudio.onended = () => { isPlayingStandard.value = false; URL.revokeObjectURL(url) }
    pronAudio.onerror = () => { isPlayingStandard.value = false; URL.revokeObjectURL(url) }
    await pronAudio.play()
  } catch {
    isPlayingStandard.value = false
    showToast('播放失败，请重试')
  }
}

function playBase64Audio(base64) {
  if (pronAudio) { pronAudio.pause(); pronAudio = null }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  pronAudio = new Audio(url)
  isPlayingStandard.value = true
  pronAudio.onended = () => { isPlayingStandard.value = false; URL.revokeObjectURL(url) }
  pronAudio.onerror = () => { isPlayingStandard.value = false; URL.revokeObjectURL(url) }
  pronAudio.play()
}

async function togglePronunciationRecording() {
  if (isPronRecording.value) {
    isPronRecording.value = false
    if (pronMediaRecorder?.state === 'recording') pronMediaRecorder.stop()
    return
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
    pronMediaRecorder = new MediaRecorder(stream, { mimeType })
    let chunks = []
    pronMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    pronMediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(chunks, { type: mimeType })
      if (blob.size > 0) {
        isPronTranscribing.value = true
        try {
          const formData = new FormData()
          formData.append('audio', blob, 'pron.webm')
          formData.append('scene', 'free')
          formData.append('history', '[]')
          formData.append('transcript', '')
          const res = await speakApi.voiceChat(formData)
          pronTranscript.value = res.user_text || '(未识别到内容)'
        } catch {
          showToast('语音识别失败')
        } finally {
          isPronTranscribing.value = false
        }
      }
    }
    pronMediaRecorder.start(100)
    isPronRecording.value = true
  } catch {
    showToast('无法访问麦克风')
  }
}

async function submitPronunciation() {
  if (!pronTranscript.value) return
  showExercise.value = false
  showToast('AI 评估中...')
  try {
    const res = await improveApi.submitExercise({
      module_id: 'pronunciation',
      question: currentModule.value?.exercise?.content || '',
      answer: pronTranscript.value,
    })
    referenceAnswer.value = res.reference || currentModule.value?.exercise?.content || ''
    exerciseCorrect.value = res.correct
    exerciseFeedback.value = res.feedback || ''
    exerciseScore.value = res.score || 0
    showResult.value = true
  } catch (err) {
    showToast(err || '提交失败')
  }
}

function submitExercise() {
  if (!exerciseAnswer.value.trim()) { showToast('请输入答案'); return }
  doSubmitExercise()
}

async function doSubmitExercise() {
  showExercise.value = false
  showToast('AI 评判中...')
  try {
    const res = await improveApi.submitExercise({
      module_id: currentModule.value?.id,
      question: currentModule.value?.exercise?.content || '',
      answer: exerciseAnswer.value,
    })
    referenceAnswer.value = res.reference || res.feedback || '参考答案加载中...'
    exerciseCorrect.value = res.correct
    exerciseFeedback.value = res.feedback || ''
    exerciseScore.value = res.score || 0
    showResult.value = true
  } catch (err) {
    showToast(err || '提交失败')
  }
}

function submitDaily() {
  if (!dailyAnswer.value.trim()) { showToast('请输入答案'); return }
  doSubmitDaily()
}

async function doSubmitDaily() {
  showDailyPractice.value = false
  showToast('AI 评判中...')
  try {
    const res = await improveApi.submitDaily({
      focus_area: dailyData.value?.focus_area,
      question: dailyData.value?.question || '',
      answer: dailyAnswer.value,
    })
    referenceAnswer.value = res.reference || res.feedback || '参考答案加载中...'
    exerciseCorrect.value = res.correct
    exerciseFeedback.value = res.feedback || ''
    exerciseScore.value = res.score || 0
    showResult.value = true
  } catch (err) {
    showToast(err || '提交失败')
  }
}

onMounted(async () => {
  try { modules.value = await improveApi.getModules() } catch { modules.value = [] }
  try { dailyData.value = await improveApi.getDaily() } catch { dailyData.value = null }
})
</script>
