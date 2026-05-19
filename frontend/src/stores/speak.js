import { defineStore } from 'pinia'
import { speakApi } from '@/api'
import { showToast } from 'vant'

export const useSpeakStore = defineStore('speak', {
  state: () => ({
    scene: 'free',
    scenes: [],
    messages: [],
    isLoading: false,
    lastScores: null,
    conversationId: null,
    conversations: [],      // 当前场景的对话列表
    showHistory: false,     // 是否显示历史面板
  }),

  actions: {
    async loadScenes() {
      this.scenes = await speakApi.getScenes()
    },

    async setScene(sceneId) {
      if (this.scene === sceneId) return
      
      // 保存当前对话
      await this.saveCurrentConversation()
      
      // 切换场景
      this.scene = sceneId
      this.conversationId = null
      this.messages = []
      this.lastScores = null
      this.showHistory = false

      // 加载该场景最近的对话
      await this.loadSceneConversations()
      if (this.conversations.length > 0) {
        await this.loadConversation(this.conversations[0].id)
      } else {
        this.initMessages()
      }
    },

    addMessage(msg) {
      this.messages.push({ ...msg, id: Date.now() + Math.random() })
    },

    async sendMessage(content) {
      if (!content.trim()) return
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      this.addMessage({ role: 'user', content, time })
      this.isLoading = true
      try {
        const apiMessages = this.messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role, content: m.content }))
        const res = await speakApi.chat(this.scene, apiMessages)
        this.lastScores = res.scores || this.lastScores
        this.addMessage({
          role: 'assistant', content: res.reply, tip: res.tip,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        })
        this.saveCurrentConversation()
      } catch (err) {
        showToast(err || 'AI 回复失败，请重试')
      } finally {
        this.isLoading = false
      }
    },

    initMessages() {
      const scene = this.scenes.find(s => s.id === this.scene)
      const sceneName = scene?.label || '自由对话'
      this.messages = [{
        id: 1, role: 'assistant', isSystem: true,
        content: `Hello! I'm your AI speaking coach. We're in "${sceneName}" mode. What would you like to talk about?`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }]
    },

    // ── 对话持久化 ──────────────────────────────────────
    async saveCurrentConversation() {
      const hasUserMsg = this.messages.some(m => m.role === 'user')
      if (!hasUserMsg) return
      try {
        const cleanMessages = this.messages.map(m => ({
          role: m.role, content: m.content, time: m.time,
          isVoice: m.isVoice || false, isSystem: m.isSystem || false, tip: m.tip || null,
        }))
        const res = await speakApi.saveConversation({
          id: this.conversationId, scene: this.scene,
          messages: cleanMessages, last_scores: this.lastScores,
        })
        this.conversationId = res.id
      } catch { /* ignore */ }
    },

    async loadSceneConversations() {
      try {
        this.conversations = await speakApi.getConversations(this.scene)
      } catch {
        this.conversations = []
      }
    },

    async loadConversation(convId) {
      try {
        const data = await speakApi.getConversation(convId)
        this.conversationId = data.id
        this.scene = data.scene
        this.messages = (data.messages || []).map((m, i) => ({ ...m, id: Date.now() + i }))
        this.lastScores = data.last_scores
        this.showHistory = false
      } catch {
        showToast('加载对话失败')
      }
    },

    async deleteConversation(convId) {
      try {
        await speakApi.deleteConversation(convId)
        this.conversations = this.conversations.filter(c => c.id !== convId)
        if (this.conversationId === convId) {
          this.conversationId = null
          this.initMessages()
        }
      } catch {
        showToast('删除失败')
      }
    },

    async startNewConversation() {
      await this.saveCurrentConversation()
      this.conversationId = null
      this.lastScores = null
      this.showHistory = false
      this.initMessages()
    },
  },
})
