import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截：自动附加 Token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// 响应拦截：统一处理错误
api.interceptors.response.use(
  (res) => {
    // blob 响应直接返回 data（不解包）
    if (res.config.responseType === 'blob') return res.data
    return res.data
  },
  (err) => {
    const status = err.response?.status
    const detail = err.response?.data?.detail

    // 401 只在非认证接口时自动跳转（登录/注册失败不跳转，让页面自己处理）
    const url = err.config?.url || ''
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      const auth = useAuthStore()
      auth.logout()
      window.location.href = '/login'
    }

    // 提取友好的错误信息
    let message = '请求失败，请稍后重试'
    if (typeof detail === 'string') {
      message = detail
    } else if (Array.isArray(detail)) {
      message = detail.map(d => d.msg).join('；')
    } else if (status === 401) {
      message = '用户名或密码错误'
    } else if (status === 400) {
      message = typeof detail === 'string' ? detail : '请求参数有误'
    } else if (status === 403) {
      message = '权限不足'
    } else if (status === 500) {
      message = '服务器错误，请稍后重试'
    }

    return Promise.reject(message)
  },
)

export default api

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
}

// ── Speak ─────────────────────────────────────────────
export const speakApi = {
  getScenes: () => api.get('/speak/scenes'),
  chat: (scene, messages) => api.post('/speak/chat', { scene, messages }),
  tts: (text, scene, voice) => api.post('/speak/tts', { text, scene, voice }, { responseType: 'blob' }),
  getVoices: () => api.get('/speak/voices'),
  voiceChat: (formData) => {
    return api.post('/speak/voice-chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
  },
  // 对话历史
  getConversations: (scene) => api.get('/speak/conversations', { params: scene ? { scene } : {} }),
  getConversation: (id) => api.get(`/speak/conversations/${id}`),
  saveConversation: (data) => api.post('/speak/conversations/save', data),
  deleteConversation: (id) => api.delete(`/speak/conversations/${id}`),
}

// ── Write ─────────────────────────────────────────────
export const writeApi = {
  getTopics: () => api.get('/write/topics'),
  correct: (data) => api.post('/write/correct', data),
  ocr: (base64Image) => api.post('/write/ocr', { image: base64Image }),
}

// ── Exam ──────────────────────────────────────────────
export const examApi = {
  getTypes: () => api.get('/exam/types'),
  submitResult: (data) => api.post('/exam/result', data),
  getHistory: () => api.get('/exam/history'),
}

// ── Report ────────────────────────────────────────────
export const reportApi = {
  getReport: (period) => api.get('/report', { params: { period } }),
  getErrorBook: () => api.get('/report/error-book'),
  reviewErrorItem: (id) => api.post(`/report/error-book/${id}/review`),
  getAiInsight: () => api.get('/report/ai-insight'),
}

// ── Home ───────────────────────────────────────────────
export const homeApi = {
  dashboard: () => api.get('/home/dashboard'),
}

// ── Improve ───────────────────────────────────────────
export const improveApi = {
  getModules: () => api.get('/improve/modules'),
  getExercise: (moduleId) => api.get(`/improve/exercise/${moduleId}`),
  getPronunciation: () => api.get('/improve/pronunciation'),
  getDaily: () => api.get('/improve/daily'),
  submitExercise: (data) => api.post('/improve/submit', data),
  submitDaily: (data) => api.post('/improve/daily/submit', data),
}
