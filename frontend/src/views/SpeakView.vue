<template>
  <div style="height:100%;display:flex;flex-direction:column;background:var(--bg-page);overflow:hidden;">
    <!-- 顶部栏 -->
    <div style="background:#fff;padding:14px 20px 10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);flex-shrink:0;">
      <h1 style="font-size:20px;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:6px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
        口语陪练
      </h1>
      <div style="display:flex;align-items:center;gap:10px;">
        <!-- 新对话 -->
        <span style="cursor:pointer;font-size:12px;color:var(--primary);font-weight:500;display:flex;align-items:center;gap:3px;" @click="store.startNewConversation()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新对话
        </span>
        <!-- 历史记录 -->
        <span style="cursor:pointer;display:flex;align-items:center;" @click="toggleHistory">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="store.showHistory ? 'var(--primary)' : 'var(--text-muted)'" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
        </span>
        <!-- 评分 -->
        <span style="color:var(--primary);cursor:pointer;" @click="store.lastScores ? showScoreModal = true : null" :style="{ opacity: store.lastScores ? 1 : 0.4 }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        </span>
      </div>
    </div>

    <!-- 场景标签 -->
    <div style="padding:8px 16px 0;background:#fff;flex-shrink:0;">
      <div class="scene-tabs">
        <button v-for="s in store.scenes" :key="s.id" type="button" class="scene-tab" :class="{ active: store.scene === s.id }" @click="store.setScene(s.id)">{{ s.label }}</button>
      </div>
    </div>

    <!-- 历史记录面板 -->
    <div v-if="store.showHistory" style="flex:1;overflow-y:auto;background:#fff;padding:12px 16px;">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:10px;">{{ currentSceneLabel }} · 对话记录</div>
      <div v-if="store.conversations.length === 0" style="text-align:center;padding:30px 0;color:var(--text-muted);font-size:13px;">
        暂无对话记录
      </div>
      <div v-else style="display:flex;flex-direction:column;gap:8px;">
        <div v-for="conv in store.conversations" :key="conv.id"
          style="background:var(--bg-page);border-radius:12px;padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .15s;"
          :style="{ border: store.conversationId === conv.id ? '1px solid var(--primary)' : '1px solid transparent' }"
          @click="store.loadConversation(conv.id)">
          <div style="flex:1;">
            <div style="font-size:13px;color:var(--text-main);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ conv.last_message || '新对话' }}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:3px;">{{ formatTime(conv.updated_at) }} · {{ conv.message_count }} 条消息</div>
          </div>
          <button style="width:24px;height:24px;border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:14px;" @click.stop="store.deleteConversation(conv.id)">×</button>
        </div>
      </div>
    </div>

    <!-- AI 角色卡 -->
    <div v-if="!store.showHistory" style="background:#fff;padding:8px 16px 10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-light);flex-shrink:0;">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        <div v-if="isPlayingAudio" class="voice-pulse"></div>
      </div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:var(--text-main);">小鱼 · AI 口语教练</div>
        <div style="font-size:11px;color:var(--text-muted);">
          <span v-if="isPlayingAudio" style="color:var(--primary);">🔊 正在说话...</span>
          <span v-else-if="isProcessing" style="color:var(--accent-warn);">🧠 思考中...</span>
          <span v-else>当前场景：{{ currentSceneLabel }}</span>
        </div>
      </div>
      <div v-if="store.lastScores" style="text-align:right;">
        <div style="font-size:16px;font-weight:700;color:var(--primary);">{{ scores.total }}</div>
        <div style="font-size:10px;color:var(--text-muted);">/ {{ scores.max }}</div>
      </div>
    </div>

    <!-- 对话区域 -->
    <div v-if="!store.showHistory" ref="chatRef" class="conv">
      <div v-for="msg in store.messages" :key="msg.id" style="display:flex;flex-direction:column;" :style="{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }">
        <div v-if="msg.role === 'assistant'" class="bubble-ai">
          <span v-html="msg.content" />
          <button v-if="msg.content && !msg.isSystem" class="play-btn" :class="{ playing: playingMsgId === msg.id }" @click="playMsgAudio(msg)" :disabled="playingMsgId === msg.id">
            <svg v-if="playingMsgId !== msg.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span v-else class="wave-bars"><i/><i/><i/></span>
          </button>
        </div>
        <div v-else class="bubble-user">
          <svg v-if="msg.isVoice" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>{{ msg.content }}
          <button v-if="msg.isVoice && msg.userAudio" class="play-btn-user" :class="{ playing: playingMsgId === msg.id }" @click="playUserAudio(msg)" :disabled="playingMsgId === msg.id">
            <svg v-if="playingMsgId !== msg.id" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span v-else class="wave-bars-white"><i/><i/><i/></span>
          </button>
        </div>
        <div v-if="msg.tip" style="align-self:flex-start;max-width:85%;margin-top:6px;padding:8px 12px;background:#f0f4ff;border-radius:10px;font-size:13px;color:var(--text-main);">
          <strong style="color:var(--primary);">{{ msg.tip.label }}</strong> {{ msg.tip.content }}
        </div>
        <span class="chat-time" :style="{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }">{{ msg.time }}</span>
      </div>

      <div v-if="isProcessing" style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;">
        <div class="bubble-ai" style="display:flex;gap:4px;align-items:center;padding:12px 16px;">
          <span class="loading-dot" /><span class="loading-dot" /><span class="loading-dot" />
        </div>
      </div>
      <div style="height:8px;" />
    </div>

    <!-- 实时评分卡 -->
    <div v-if="store.lastScores && !store.showHistory" class="score-bar" style="flex-shrink:0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:13px;font-weight:600;color:var(--text-main);">▤ 实时评分</span>
        <span>
          <span style="font-size:22px;font-weight:700;color:var(--primary);">{{ scores.total }}</span>
          <span style="font-size:13px;color:var(--text-muted);"> / {{ scores.max }}</span>
        </span>
      </div>
      <div style="display:flex;justify-content:space-around;">
        <div v-for="d in scores.dims" :key="d.key" style="text-align:center;font-size:12px;color:#3a3a3c;">
          {{ d.label }}
          <div class="progress-bar" style="width:32px;margin:3px auto 0;height:4px;"><div class="progress-fill" :style="{ width: d.pct + '%' }" /></div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div v-if="!store.showHistory" class="bottom-bar">
      <!-- 录音确认面板 -->
      <div v-if="pendingAudio" style="margin-bottom:10px;">
        <div style="background:var(--bg-page);border-radius:12px;padding:12px 14px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--primary);"></div>
            <span style="font-size:12px;color:var(--text-secondary);">录音 {{ pendingDuration }}s</span>
            <button style="margin-left:auto;background:none;border:none;color:var(--primary);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:3px;" @click="playPendingAudio">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              试听
            </button>
          </div>
          <div v-if="recognizedText" style="font-size:13px;color:var(--text-main);margin-bottom:8px;padding:6px 10px;background:#fff;border-radius:8px;border:1px solid var(--border-light);">
            "{{ recognizedText }}"
          </div>
          <div v-else style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">
            录音已完成，点击发送由 AI 识别
          </div>
          <div style="display:flex;gap:8px;">
            <button style="flex:1;padding:8px;border:1px solid var(--border-light);border-radius:20px;background:#fff;font-size:13px;color:var(--text-secondary);cursor:pointer;" @click="cancelPending">取消</button>
            <button style="flex:1;padding:8px;border:none;border-radius:20px;background:var(--primary);font-size:13px;color:#fff;cursor:pointer;font-weight:500;" @click="confirmSend" :disabled="isProcessing">发送</button>
          </div>
        </div>
      </div>

      <!-- 录音状态 -->
      <div v-if="isRecording" style="text-align:center;margin-bottom:8px;">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
          <div class="recording-indicator"></div>
          <span style="font-size:13px;color:var(--accent-coral);font-weight:500;">录音中 {{ recordingTime }}s</span>
        </div>
        <div class="voice-wave">
          <span v-for="i in 12" :key="i" class="wave-line" :style="{ animationDelay: (i * 0.05) + 's' }"></span>
        </div>
      </div>

      <div v-if="!pendingAudio" style="display:flex;align-items:center;gap:12px;justify-content:center;">
        <!-- 文字输入（备用） -->
        <button class="mode-btn" @click="showTextInput = !showTextInput" :class="{ active: showTextInput }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>

        <!-- 主录音按钮 -->
        <button class="main-mic-btn" :class="{ recording: isRecording, disabled: isProcessing || isPlayingAudio }" @click="toggleRecording" :disabled="isProcessing || isPlayingAudio">
          <svg v-if="!isRecording" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>
        </button>

        <!-- 停止播放 -->
        <button v-if="isPlayingAudio" class="mode-btn active" @click="stopAudio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        </button>
        <div v-else style="width:40px;"></div>
      </div>

      <!-- 文字输入框（可选） -->
      <div v-if="showTextInput && !pendingAudio" style="display:flex;align-items:center;gap:8px;margin-top:10px;">
        <input v-model="inputText" type="text" placeholder="输入文字..." style="flex:1;padding:10px 16px;border:1px solid var(--bg-muted);border-radius:24px;font-size:14px;outline:none;background:#f7f8fc;" @keydown.enter="sendTextMessage" />
        <button class="send-btn" :disabled="!inputText.trim() || isProcessing" @click="sendTextMessage">➤</button>
      </div>
    </div>
  </div>

  <!-- 评分详情弹窗 -->
  <van-popup v-model:show="showScoreModal" position="bottom" round style="padding:20px;max-height:70vh;overflow-y:auto;">
    <h3 style="font-size:18px;font-weight:700;margin-bottom:16px;">📊 本次评分详情</h3>
    <div style="display:flex;justify-content:center;margin-bottom:16px;">
      <div style="text-align:center;">
        <div style="font-size:48px;font-weight:800;color:var(--primary);">{{ scores.total }}</div>
        <div style="font-size:14px;color:var(--text-muted);">综合评分 / {{ scores.max }}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
      <div v-for="d in scores.dims" :key="d.key" style="display:flex;align-items:center;gap:12px;">
        <div style="width:48px;font-size:13px;color:var(--text-secondary);text-align:right;flex-shrink:0;">{{ d.label }}</div>
        <div class="progress-bar" style="flex:1;height:8px;"><div class="progress-fill" :style="{ width: d.pct + '%' }" /></div>
        <div style="width:32px;font-size:13px;font-weight:600;color:var(--primary);">{{ d.pct }}%</div>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
      <span v-for="(t, i) in scores.tags" :key="i" :style="{ background: t.warn ? '#fff4e5' : '#f0f4ff', color: t.warn ? '#e68a00' : 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }">{{ t.text }}</span>
    </div>
    <div v-if="scores.coaching" style="padding:12px 14px;background:#f7f8fc;border-radius:12px;font-size:13px;color:var(--text-main);line-height:1.6;">
      <strong style="color:var(--primary);">◆ AI 建议：</strong>{{ scores.coaching }}
    </div>
    <van-button block round type="primary" style="margin-top:16px;" @click="showScoreModal = false">关闭</van-button>
  </van-popup>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { showToast } from 'vant'
import { useSpeakStore } from '@/stores/speak'
import { speakApi } from '@/api'

const store = useSpeakStore()
const chatRef = ref(null)
const showScoreModal = ref(false)
const showTextInput = ref(false)
const inputText = ref('')

// 状态
const isRecording = ref(false)
const isProcessing = ref(false)
const isPlayingAudio = ref(false)
const playingMsgId = ref(null)
const recordingTime = ref(0)
const recognizedText = ref('')
const pendingAudio = ref(null)  // 录音完成后待确认的 Blob
const pendingDuration = ref(0)

let mediaRecorder = null
let audioChunks = []
let recordingTimer = null
let currentAudio = null
let speechRecognition = null

const currentSceneLabel = computed(() => {
  const s = store.scenes.find(s => s.id === store.scene)
  return s ? s.label : '自由对话'
})

async function toggleHistory() {
  store.showHistory = !store.showHistory
  if (store.showHistory) {
    await store.loadSceneConversations()
  }
}

function formatTime(dateStr) {
  if (!dateStr || dateStr === 'None') return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
    return `${d.getMonth() + 1}/${d.getDate()}`
  } catch { return '' }
}

const defaultScores = { total: '—', max: '9.0', dims: [{ key: 'pronunciation', label: '发音', pct: 0 }, { key: 'grammar', label: '语法', pct: 0 }, { key: 'vocabulary', label: '词汇', pct: 0 }, { key: 'fluency', label: '流利度', pct: 0 }], tags: [], coaching: '' }

const scores = computed(() => {
  const s = store.lastScores
  if (!s) return defaultScores
  return {
    total: String(s.total ?? '—'),
    max: String(s.max ?? '9.0'),
    dims: (s.dims || defaultScores.dims).map(d => ({ key: d.key, label: d.label, pct: Math.min(100, Math.round(Number(d.pct) <= 1 ? Number(d.pct) * 100 : Number(d.pct))) })),
    tags: s.tags || [],
    coaching: s.coaching || '',
  }
})

// ── 录音控制 ──────────────────────────────────────────
async function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() })
    audioChunks = []
    recordingTime.value = 0
    recognizedText.value = ''

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      clearInterval(recordingTimer)
      stopSpeechRecognition()
      const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType })
      if (blob.size > 0) {
        // 不直接发送，进入确认状态
        pendingAudio.value = blob
        pendingDuration.value = recordingTime.value
      }
    }

    mediaRecorder.start(100)
    isRecording.value = true
    recordingTimer = setInterval(() => { recordingTime.value++ }, 1000)

    // 同时启动浏览器语音识别（静默获取文本）
    startSpeechRecognition()
  } catch (err) {
    showToast('无法访问麦克风，请检查权限')
  }
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) return

  speechRecognition = new SpeechRecognition()
  speechRecognition.lang = 'en-US'
  speechRecognition.continuous = true
  speechRecognition.interimResults = true

  speechRecognition.onresult = (event) => {
    let finalText = ''
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript
      }
    }
    if (finalText) recognizedText.value = finalText.trim()
  }

  speechRecognition.onerror = () => { /* 静默失败 */ }
  try { speechRecognition.start() } catch { /* ignore */ }
}

function stopSpeechRecognition() {
  if (speechRecognition) {
    try { speechRecognition.stop() } catch { /* ignore */ }
    speechRecognition = null
  }
}

function stopRecording() {
  isRecording.value = false
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
  }
  clearInterval(recordingTimer)
}

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return 'audio/webm'
}

// ── 录音确认/取消 ──────────────────────────────────────
function cancelPending() {
  pendingAudio.value = null
  pendingDuration.value = 0
  recognizedText.value = ''
  stopAudio()
}

function confirmSend() {
  if (!pendingAudio.value) return
  const blob = pendingAudio.value
  pendingAudio.value = null
  pendingDuration.value = 0
  sendVoiceMessage(blob)
}

function playPendingAudio() {
  if (!pendingAudio.value) return
  stopAudio()
  const url = URL.createObjectURL(pendingAudio.value)
  currentAudio = new Audio(url)
  isPlayingAudio.value = true
  currentAudio.onended = () => { stopAudio(); URL.revokeObjectURL(url) }
  currentAudio.onerror = () => { stopAudio(); URL.revokeObjectURL(url) }
  currentAudio.play()
}

// ── 回听用户语音 ──────────────────────────────────────
function playUserAudio(msg) {
  if (!msg.userAudio) return
  stopAudio()
  const binary = atob(msg.userAudio)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'audio/webm' })
  const url = URL.createObjectURL(blob)
  currentAudio = new Audio(url)
  playingMsgId.value = msg.id
  isPlayingAudio.value = true
  currentAudio.onended = () => { stopAudio(); URL.revokeObjectURL(url) }
  currentAudio.onerror = () => { stopAudio(); URL.revokeObjectURL(url) }
  currentAudio.play()
}

// ── 发送语音消息 ──────────────────────────────────────
async function sendVoiceMessage(audioBlob) {
  isProcessing.value = true
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  // 将录音转为 base64 保存（用于回听）
  let userAudioB64 = null
  try {
    const reader = new FileReader()
    userAudioB64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(audioBlob)
    })
  } catch { /* ignore */ }

  // 先显示占位消息
  store.addMessage({ role: 'user', content: '🎤 语音消息...', time, isVoice: true, userAudio: userAudioB64 })
  scrollToBottom()

  try {
    // 构建对话历史
    const history = store.messages.slice(0, -1)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    // 发送到后端（始终发送音频文件，由后端 Whisper 识别）
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('scene', store.scene)
    formData.append('history', JSON.stringify(history))

    const res = await speakApi.voiceChat(formData)

    // 更新用户消息为识别到的文本
    const lastUserMsg = store.messages[store.messages.length - 1]
    if (lastUserMsg && lastUserMsg.role === 'user') {
      lastUserMsg.content = res.user_text || '(未识别到内容)'
    }

    // 添加 AI 回复
    store.lastScores = res.scores || store.lastScores
    const aiMsg = {
      role: 'assistant',
      content: res.reply,
      tip: res.tip,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      audioData: res.audio_base64 || null,
    }
    store.addMessage(aiMsg)
    scrollToBottom()

    // 自动播放 AI 语音回复
    if (res.audio_base64) {
      await playAudioBase64(res.audio_base64, store.messages[store.messages.length - 1].id)
    }

    // 自动保存对话
    store.saveCurrentConversation()
  } catch (err) {
    showToast(typeof err === 'string' ? err : '语音处理失败，请重试')
    // 移除占位消息
    const idx = store.messages.findIndex(m => m.content === '🎤 语音消息...')
    if (idx >= 0) store.messages.splice(idx, 1)
  } finally {
    isProcessing.value = false
    recognizedText.value = ''
  }
}

// ── 文字消息（备用） ──────────────────────────────────
async function sendTextMessage() {
  const text = inputText.value.trim()
  if (!text || isProcessing.value) return
  inputText.value = ''
  isProcessing.value = true

  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  store.addMessage({ role: 'user', content: text, time })
  scrollToBottom()

  try {
    const apiMessages = store.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    const res = await speakApi.chat(store.scene, apiMessages)
    store.lastScores = res.scores || store.lastScores

    // TTS
    let audioData = null
    try {
      const blob = await speakApi.tts(res.reply.replace(/<[^>]+>/g, ''), store.scene)
      const reader = new FileReader()
      audioData = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.readAsDataURL(blob)
      })
    } catch { /* TTS 失败不影响主流程 */ }

    const aiMsg = {
      role: 'assistant',
      content: res.reply,
      tip: res.tip,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      audioData,
    }
    store.addMessage(aiMsg)
    scrollToBottom()

    if (audioData) {
      await playAudioBase64(audioData, store.messages[store.messages.length - 1].id)
    }
  } catch (err) {
    showToast(err || 'AI 回复失败')
  } finally {
    isProcessing.value = false
  }
}

// ── 音频播放 ──────────────────────────────────────────
async function playAudioBase64(base64, msgId) {
  stopAudio()
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)

    currentAudio = new Audio(url)
    playingMsgId.value = msgId
    isPlayingAudio.value = true

    currentAudio.onended = () => { stopAudio(); URL.revokeObjectURL(url) }
    currentAudio.onerror = () => { stopAudio(); URL.revokeObjectURL(url) }
    await currentAudio.play()
  } catch { stopAudio() }
}

async function playMsgAudio(msg) {
  if (msg.audioData) {
    playAudioBase64(msg.audioData, msg.id)
  } else {
    // 没有缓存音频，实时调用 TTS
    stopAudio()
    playingMsgId.value = msg.id
    isPlayingAudio.value = true
    try {
      const cleanText = msg.content.replace(/<[^>]+>/g, '').trim()
      if (!cleanText) { stopAudio(); return }
      const blob = await speakApi.tts(cleanText, store.scene)
      const url = URL.createObjectURL(blob)
      currentAudio = new Audio(url)
      currentAudio.onended = () => { stopAudio(); URL.revokeObjectURL(url) }
      currentAudio.onerror = () => { stopAudio(); URL.revokeObjectURL(url) }
      await currentAudio.play()
      // 缓存到消息对象，下次不用再请求
      const reader = new FileReader()
      reader.onload = () => { msg.audioData = reader.result.split(',')[1] }
      reader.readAsDataURL(blob)
    } catch {
      stopAudio()
      showToast('语音播放失败')
    }
  }
}

function stopAudio() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  isPlayingAudio.value = false
  playingMsgId.value = null
}

function scrollToBottom() {
  nextTick(() => { if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight })
}

watch(() => store.messages.length, scrollToBottom)

onMounted(async () => {
  await store.loadScenes()
  // 加载当前场景最近的对话
  await store.loadSceneConversations()
  if (store.conversations.length > 0) {
    await store.loadConversation(store.conversations[0].id)
  } else {
    store.initMessages()
  }
})

onUnmounted(() => {
  stopAudio()
  if (isRecording.value) stopRecording()
  stopSpeechRecognition()
})
</script>

<style scoped>
.conv { flex: 1; overflow-y: auto; padding: 16px 16px 8px; display: flex; flex-direction: column; gap: 12px; }
.score-bar { background: #fff; padding: 10px 16px 8px; border-top: 1px solid var(--border-light); }
.bottom-bar { background: #fff; padding: 14px 16px 16px; border-top: 1px solid var(--border-light); flex-shrink: 0; }

.main-mic-btn {
  width: 64px; height: 64px; background: var(--primary); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3); transition: all .2s;
}
.main-mic-btn:active { transform: scale(0.95); }
.main-mic-btn.recording { background: #ff5252; box-shadow: 0 4px 16px rgba(255, 82, 82, 0.4); animation: pulse-mic .8s ease-in-out infinite alternate; }
.main-mic-btn.disabled { opacity: 0.5; cursor: not-allowed; }
@keyframes pulse-mic { from { transform: scale(1); } to { transform: scale(1.06); } }

.mode-btn {
  width: 40px; height: 40px; border: 1px solid var(--border-light); border-radius: 50%;
  background: #fff; color: var(--text-muted); cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: all .2s;
}
.mode-btn.active { border-color: var(--primary); color: var(--primary); background: #f0f4ff; }

.send-btn {
  width: 36px; height: 36px; background: var(--primary); border: none; border-radius: 50%;
  color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* 播放按钮 */
.play-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; background: rgba(74, 108, 247, 0.1);
  border-radius: 50%; color: var(--primary); cursor: pointer; margin-left: 6px; vertical-align: middle;
}
.play-btn.playing { background: rgba(74, 108, 247, 0.15); cursor: default; }

/* 用户消息播放按钮 */
.play-btn-user {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border: none; background: rgba(255, 255, 255, 0.25);
  border-radius: 50%; color: #fff; cursor: pointer; margin-left: 6px; vertical-align: middle;
}
.play-btn-user.playing { background: rgba(255, 255, 255, 0.35); cursor: default; }

/* 声波动画 */
.wave-bars { display: flex; align-items: center; gap: 2px; height: 12px; }
.wave-bars i { display: block; width: 2px; height: 8px; background: var(--primary); border-radius: 1px; animation: wave-bar 0.6s ease-in-out infinite; }
.wave-bars i:nth-child(1) { animation-delay: 0s; }
.wave-bars i:nth-child(2) { animation-delay: 0.15s; }
.wave-bars i:nth-child(3) { animation-delay: 0.3s; }
.wave-bars-white { display: flex; align-items: center; gap: 2px; height: 10px; }
.wave-bars-white i { display: block; width: 2px; height: 6px; background: #fff; border-radius: 1px; animation: wave-bar 0.6s ease-in-out infinite; }
.wave-bars-white i:nth-child(1) { animation-delay: 0s; }
.wave-bars-white i:nth-child(2) { animation-delay: 0.15s; }
.wave-bars-white i:nth-child(3) { animation-delay: 0.3s; }
@keyframes wave-bar { 0%, 100% { height: 4px; } 50% { height: 12px; } }

/* AI 头像脉冲 */
.voice-pulse { position: absolute; inset: -4px; border-radius: 50%; border: 2px solid var(--primary); animation: voice-pulse-anim 1s ease-out infinite; }
@keyframes voice-pulse-anim { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }

/* 录音指示器 */
.recording-indicator { width: 8px; height: 8px; border-radius: 50%; background: #ff5252; animation: blink 1s ease-in-out infinite; display: inline-block; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 录音声波 */
.voice-wave { display: flex; align-items: center; justify-content: center; gap: 3px; height: 24px; margin-top: 6px; }
.wave-line { width: 3px; height: 8px; background: var(--accent-coral); border-radius: 2px; animation: wave-line-anim 0.5s ease-in-out infinite alternate; }
@keyframes wave-line-anim { 0% { height: 4px; } 100% { height: 20px; } }
</style>
