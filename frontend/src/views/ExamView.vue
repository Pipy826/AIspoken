<template>
  <div class="page-scroll" style="background:var(--bg-page);">
    <!-- 顶部栏 -->
    <div style="background:#fff;padding:12px 18px 8px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);">
      <div style="display:flex;align-items:center;gap:8px;">
        <button @click="$router.push('/')" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-light);background:#fff;cursor:pointer;font-size:12px;">←</button>
        <h1 style="font-size:18px;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          全真模考
        </h1>
      </div>
      <span style="font-size:12px;color:var(--primary);cursor:pointer;" @click="openHistory">历史 →</span>
    </div>

    <!-- 考试类型选择 3列网格 -->
    <div style="padding:14px;">
      <div style="font-size:13px;font-weight:600;color:var(--text-main);margin-bottom:10px;">选择考试类型</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">
        <div v-for="t in examTypes" :key="t.id"
          style="background:#fff;border-radius:16px;text-align:center;padding:14px 8px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.03);"
          :style="{ border: selected === t.id ? '2px solid var(--primary)' : '2px solid transparent', background: selected === t.id ? '#f0f4ff' : '#fff' }"
          @click="selected = t.id">
          <div style="margin-bottom:6px;" v-html="getExamIcon(t)"></div>
          <div style="font-weight:700;font-size:12px;">{{ t.name }}</div>
          <div style="font-size:9px;color:var(--text-muted);margin-top:2px;">{{ t.id.toUpperCase() }}</div>
        </div>
        <!-- 自定义 -->
        <div style="background:#fff;border-radius:16px;text-align:center;padding:14px 8px;cursor:pointer;border:2px solid transparent;box-shadow:0 2px 10px rgba(0,0,0,.03);" @click="showToast('自定义模考即将开放')">
          <div style="margin-bottom:6px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <div style="font-weight:700;font-size:12px;">自定义</div>
          <div style="font-size:9px;color:var(--text-muted);margin-top:2px;">Custom</div>
        </div>
      </div>
    </div>

    <!-- 考试详情 -->
    <div class="card card-p card-mb" v-if="currentType">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#f0f4ff,#e8eeff);border-radius:12px;display:flex;align-items:center;justify-content:center;" v-html="getExamIcon(currentType)"></div>
        <div>
          <div style="font-size:14px;font-weight:700;">{{ currentType.name }}口语模考</div>
          <div style="font-size:11px;color:var(--text-muted);">{{ currentType.parts?.join(' · ') }}</div>
        </div>
      </div>
      <div style="background:var(--bg-page);border-radius:10px;padding:10px 12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:11px;color:var(--text-secondary);">考试时长</span><span style="font-size:11px;font-weight:600;">{{ currentType.duration }} 分钟</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:11px;color:var(--text-secondary);">题目数量</span><span style="font-size:11px;font-weight:600;">{{ currentType.parts?.length || 3 }} 个 Part</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:11px;color:var(--text-secondary);">评分标准</span><span style="font-size:11px;font-weight:600;">9 分制</span></div>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">
        <strong>考试说明：</strong><br>
        <span v-for="(part, i) in currentType.parts" :key="i">• {{ part }}<br></span>
      </div>
      <van-button block round type="primary" @click="startExam">开始模考</van-button>
    </div>

    <!-- 历史模考记录 -->
    <div class="card card-p card-mb">
      <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:8px;">历史模考记录</div>
      <div v-if="!history.length" style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">暂无模考记录</div>
      <div v-else style="display:flex;flex-direction:column;gap:8px;">
        <div v-for="r in history" :key="r.id" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg-page);border-radius:12px;">
          <div>
            <div style="display:flex;gap:4px;margin-bottom:3px;"><span class="tag tag-blue">{{ r.type }}</span><span style="font-size:10px;color:var(--text-secondary);">{{ r.parts }}</span></div>
            <span style="font-size:10px;color:var(--text-muted);">{{ r.date }} · {{ r.duration }}分钟</span>
          </div>
          <div style="text-align:right;"><div style="font-size:20px;font-weight:800;color:var(--primary);">{{ r.score }}</div><div style="font-size:9px;color:var(--text-muted);">/ 9.0</div></div>
        </div>
      </div>
    </div>
    <div style="height:14px;"></div>

    <!-- 模考进行弹窗 -->
    <van-popup v-model:show="showExam" position="bottom" round style="max-height:85vh;overflow-y:auto;padding:20px;" :close-on-click-overlay="false">
      <div style="text-align:center;">
        <!-- Part 进度指示 -->
        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:8px;">
          <span v-for="(p, i) in examParts" :key="i"
            :style="{ width:'8px', height:'8px', borderRadius:'50%', background: i < currentPartIndex ? 'var(--accent-green)' : i === currentPartIndex ? 'var(--primary)' : 'var(--bg-muted)', transition:'background .3s' }"></span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">{{ examParts[currentPartIndex]?.title || 'Part' }} ({{ currentPartIndex + 1 }}/{{ examParts.length }})</div>
        <div style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:12px;">{{ timerDisplay }}</div>
        <div style="background:var(--bg-page);border-radius:12px;padding:14px;margin-bottom:14px;text-align:left;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Question</div>
          <div style="font-size:14px;font-weight:600;color:var(--text-main);line-height:1.6;">{{ examParts[currentPartIndex]?.question || '' }}</div>
          <div v-if="examParts[currentPartIndex]?.hint" style="font-size:11px;color:var(--text-secondary);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-light);">
            💡 {{ examParts[currentPartIndex].hint }}
          </div>
        </div>
        <!-- 录音按钮 -->
        <div style="margin-bottom:14px;">
          <div @click="toggleRecording"
            :style="{ width:'64px', height:'64px', background: isRecording ? 'linear-gradient(135deg,#ff8a80,#ff5252)' : 'linear-gradient(135deg,var(--primary),var(--primary-light))', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', cursor:'pointer', boxShadow:'0 4px 16px rgba(74,108,247,.3)' }">
            <svg v-if="!isRecording" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">{{ isTranscribing ? '🔄 识别中...' : isRecording ? '录音中，点击停止...' : '点击开始录音' }}</div>
        </div>
        <!-- 转写文本 -->
        <div style="background:var(--bg-page);border-radius:10px;padding:10px 12px;text-align:left;font-size:12px;color:var(--text-secondary);min-height:40px;">
          <textarea v-model="partTranscripts[currentPartIndex]" placeholder="录音转写文本将显示在这里，也可手动输入..." style="width:100%;border:none;background:transparent;font-size:12px;outline:none;resize:none;min-height:40px;font-family:inherit;color:var(--text-main);"></textarea>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;">
          <van-button round plain style="flex:1;" @click="cancelExam">结束模考</van-button>
          <van-button round type="primary" style="flex:1;" :loading="isSubmitting" @click="nextPart">
            {{ currentPartIndex < examParts.length - 1 ? '下一题 →' : '完成作答 →' }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 模考结果弹窗 -->
    <van-popup v-model:show="showResult" position="bottom" round style="max-height:85vh;overflow-y:auto;padding:20px;">
      <div style="text-align:center;">
        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">模考完成</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:14px;">{{ currentType?.name }} · {{ examDuration }} 分钟</div>
        <div style="font-size:48px;font-weight:800;color:var(--primary);">{{ resultData.overall }}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">综合评分 / 9.0</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;text-align:left;">
          <div style="background:var(--bg-page);border-radius:10px;padding:10px;"><div style="font-size:10px;color:var(--text-secondary);">发音</div><div style="font-size:18px;font-weight:700;">{{ resultData.pronunciation }}</div><div class="progress-bar" style="height:3px;margin-top:4px;"><div class="progress-fill" :style="{width: (resultData.pronunciation/9*100)+'%'}"></div></div></div>
          <div style="background:var(--bg-page);border-radius:10px;padding:10px;"><div style="font-size:10px;color:var(--text-secondary);">语法</div><div style="font-size:18px;font-weight:700;">{{ resultData.grammar }}</div><div class="progress-bar" style="height:3px;margin-top:4px;"><div class="progress-fill" :style="{width: (resultData.grammar/9*100)+'%'}"></div></div></div>
          <div style="background:var(--bg-page);border-radius:10px;padding:10px;"><div style="font-size:10px;color:var(--text-secondary);">词汇</div><div style="font-size:18px;font-weight:700;">{{ resultData.vocabulary || '—' }}</div></div>
          <div style="background:var(--bg-page);border-radius:10px;padding:10px;"><div style="font-size:10px;color:var(--text-secondary);">流利度</div><div style="font-size:18px;font-weight:700;">{{ resultData.fluency }}</div><div class="progress-bar" style="height:3px;margin-top:4px;"><div class="progress-fill" :style="{width: (resultData.fluency/9*100)+'%'}"></div></div></div>
        </div>
        <!-- AI 点评 -->
        <div v-if="resultData.comment" style="background:var(--bg-page);border-radius:12px;padding:12px;text-align:left;margin-bottom:14px;">
          <div style="font-size:12px;font-weight:600;margin-bottom:6px;">AI 点评</div>
          <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">{{ resultData.comment }}</div>
        </div>
        <van-button block round type="primary" @click="showResult = false">关闭</van-button>
      </div>
    </van-popup>

    <!-- 历史记录弹窗 -->
    <van-popup v-model:show="showHistoryPanel" position="bottom" round style="max-height:75vh;overflow-y:auto;padding:20px 18px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px;">模考历史记录</h3>
      <div v-if="!history.length" style="text-align:center;padding:30px 0;color:var(--text-muted);font-size:13px;">暂无模考记录，完成一次模考后这里会显示</div>
      <div v-else style="display:flex;flex-direction:column;gap:8px;">
        <div v-for="r in history" :key="r.id" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg-page);border-radius:12px;">
          <div>
            <div style="display:flex;gap:4px;margin-bottom:3px;"><span class="tag tag-blue">{{ r.type }}</span></div>
            <span style="font-size:11px;color:var(--text-muted);">{{ r.date }} · {{ r.duration }}分钟</span>
          </div>
          <div style="text-align:right;">
            <div style="font-size:22px;font-weight:800;color:var(--primary);">{{ r.score }}</div>
            <div style="font-size:9px;color:var(--text-muted);">/ 9.0</div>
          </div>
        </div>
      </div>
      <van-button block round plain type="primary" style="margin-top:14px;" @click="showHistoryPanel = false">关闭</van-button>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { examApi, speakApi } from '@/api'

const examTypes = ref([])
const selected = ref(null)
const history = ref([])
const showHistoryPanel = ref(false)
const showExam = ref(false)
const showResult = ref(false)
const isRecording = ref(false)
const isSubmitting = ref(false)
const isTranscribing = ref(false)
const examDuration = ref(0)
const resultData = ref({ overall: '—', pronunciation: '—', grammar: '—', fluency: '—', vocabulary: '—', comment: '' })
const timeLeft = ref(0)
const elapsedSeconds = ref(0)
const currentPartIndex = ref(0)
const partTranscripts = ref([])
let timer = null
let mediaRecorder = null

// 每种考试类型的题目库
const examQuestions = {
  ielts: [
    { title: 'Part 1 · 日常话题', question: 'Do you enjoy traveling? Tell me about a memorable trip you\'ve taken recently.', hint: '回答 1-2 分钟，注意时态和细节描述' },
    { title: 'Part 2 · 个人陈述', question: 'Describe a skill you learned that you think is useful. You should say: what the skill is, how you learned it, how long it took you to learn, and explain why you think it is useful.', hint: '准备 1 分钟，陈述 2 分钟，注意结构完整' },
    { title: 'Part 3 · 深入讨论', question: 'Do you think schools should teach more practical skills? What skills do you think will be important in the future workplace?', hint: '展开论述，给出理由和例子，注意逻辑连贯' },
  ],
  toefl: [
    { title: 'Independent Speaking', question: 'Some people prefer to work in a team, while others prefer to work alone. Which do you prefer and why? Give specific reasons and examples.', hint: '准备 15 秒，回答 45 秒' },
    { title: 'Integrated Speaking', question: 'The university plans to close the campus library on weekends. Based on the reading and listening materials, summarize the student\'s opinion and explain the reasons.', hint: '准备 30 秒，回答 60 秒' },
  ],
  cet6: [
    { title: '口语考试 · 自我介绍', question: 'Please introduce yourself briefly, including your major, hobbies, and future plans.', hint: '时间 1 分钟' },
    { title: '口语考试 · 话题讨论', question: 'What do you think about the impact of social media on young people? Give your opinion with examples.', hint: '时间 2 分钟' },
  ],
  gaokao: [
    { title: '口语 · 朗读短文', question: 'Please read the following passage aloud: "Education is not just about learning facts. It is about developing critical thinking skills and the ability to solve problems creatively."', hint: '注意发音和语调' },
    { title: '口语 · 情景对话', question: 'Your foreign friend wants to learn about Chinese food culture. Please recommend a traditional Chinese dish and explain how it is made.', hint: '注意表达清晰，内容完整' },
  ],
  postgrad: [
    { title: '英语写作 · 应用文', question: 'Write a letter to your professor asking for a recommendation letter for a graduate program. Include your academic achievements and research interests.', hint: '注意格式和礼貌用语' },
    { title: '翻译 · 段落翻译', question: 'Translate the following into English: 随着科技的发展，人工智能正在改变我们的生活方式。从智能手机到自动驾驶汽车，AI技术已经渗透到日常生活的方方面面。', hint: '注意专业术语和句式多样性' },
  ],
}

const examParts = computed(() => {
  return examQuestions[selected.value] || examQuestions.ielts
})

const currentType = computed(() => examTypes.value.find(t => t.id === selected.value))

const timerDisplay = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// SVG icons for exam types
const examIcons = {
  ielts: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/></svg>',
  toefl: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  cet6: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  gaokao: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  postgrad: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
}

function getExamIcon(t) {
  return examIcons[t.id] || examIcons.ielts
}

async function openHistory() {
  await loadHistory()
  showHistoryPanel.value = true
}

function startExam() {
  const totalSec = (currentType.value?.duration || 14) * 60
  timeLeft.value = totalSec
  elapsedSeconds.value = 0
  currentPartIndex.value = 0
  partTranscripts.value = examParts.value.map(() => '')
  showExam.value = true
  timer = setInterval(() => {
    timeLeft.value--
    elapsedSeconds.value++
    if (timeLeft.value <= 0) finishExam()
  }, 1000)
}

function nextPart() {
  // 检查当前 part 是否有输入
  const currentText = (partTranscripts.value[currentPartIndex.value] || '').trim()
  if (!currentText) {
    showToast('请先录音或输入回答内容')
    return
  }
  // 如果是最后一个 part，提交评分
  if (currentPartIndex.value >= examParts.value.length - 1) {
    finishExam()
    return
  }
  // 停止录音
  if (isRecording.value) {
    isRecording.value = false
    if (mediaRecorder?.state === 'recording') mediaRecorder.stop()
  }
  // 进入下一个 part
  currentPartIndex.value++
}

async function toggleRecording() {
  if (isRecording.value) {
    isRecording.value = false
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
    return
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = getSupportedMimeType()
    mediaRecorder = new MediaRecorder(stream, { mimeType })
    let audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(audioChunks, { type: mimeType })
      if (blob.size > 0) {
        // 发送到后端 Whisper 转写
        isTranscribing.value = true
        try {
          const formData = new FormData()
          formData.append('audio', blob, 'exam_recording.webm')
          formData.append('scene', 'ielts')
          formData.append('history', '[]')
          formData.append('transcript', '')
          // 使用 voice-chat 端点只做转写（我们只需要 user_text）
          const res = await speakApi.voiceChat(formData)
          if (res.user_text) {
            // 追加到当前 part 的文本
            const existing = partTranscripts.value[currentPartIndex.value] || ''
            partTranscripts.value[currentPartIndex.value] = (existing ? existing + ' ' : '') + res.user_text
          }
        } catch (err) {
          showToast('语音识别失败，请手动输入')
        } finally {
          isTranscribing.value = false
        }
      }
    }

    mediaRecorder.start(100)
    isRecording.value = true
  } catch {
    showToast('无法访问麦克风，请检查权限')
  }
}

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return 'audio/webm'
}

function cancelExam() {
  clearInterval(timer); timer = null
  if (isRecording.value) { isRecording.value = false; if (mediaRecorder?.state === 'recording') mediaRecorder.stop() }
  showExam.value = false
}

async function finishExam() {
  clearInterval(timer); timer = null
  if (isRecording.value) { isRecording.value = false; if (mediaRecorder?.state === 'recording') mediaRecorder.stop() }
  examDuration.value = Math.max(1, Math.round(elapsedSeconds.value / 60))
  isSubmitting.value = true

  // 合并所有 part 的转写文本
  const fullTranscript = partTranscripts.value
    .map((t, i) => `[${examParts.value[i]?.title || 'Part ' + (i+1)}]\n${t}`)
    .filter(t => t.trim())
    .join('\n\n')

  try {
    const res = await examApi.submitResult({
      exam_type: selected.value,
      duration_seconds: elapsedSeconds.value || 60,
      transcript: fullTranscript || null,
    })
    resultData.value = { overall: res.overall?.toFixed(1) || '—', pronunciation: res.pronunciation?.toFixed(1) || '—', grammar: res.grammar?.toFixed(1) || '—', fluency: res.fluency?.toFixed(1) || '—', vocabulary: '—', comment: res.comment || '' }
  } catch (err) {
    showToast(err || 'AI 评分失败')
    resultData.value = { overall: '—', pronunciation: '—', grammar: '—', fluency: '—', vocabulary: '—', comment: '' }
  } finally { isSubmitting.value = false }
  showExam.value = false
  setTimeout(() => { showResult.value = true }, 300)
}

async function loadHistory() {
  try {
    const data = await examApi.getHistory()
    const typeMap = { ielts: '雅思', toefl: '托福', cet6: '四六级', gaokao: '高考', postgrad: '考研' }
    history.value = data.map(r => {
      const d = new Date(r.created_at)
      return { id: r.id, type: typeMap[r.exam_type] || r.exam_type, date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, score: r.score != null ? Number(r.score).toFixed(1) : '—', duration: r.duration_minutes, parts: 'Speaking' }
    })
  } catch { history.value = [] }
}

onMounted(async () => {
  try { examTypes.value = await examApi.getTypes() } catch { showToast('加载考试类型失败') }
  if (examTypes.value.length) selected.value = examTypes.value[0].id
  loadHistory()
})

onUnmounted(() => { clearInterval(timer) })
</script>

<style scoped>
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
</style>
