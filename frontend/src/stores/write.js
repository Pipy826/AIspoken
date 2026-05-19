import { defineStore } from 'pinia'
import { writeApi } from '@/api'
import { showToast } from 'vant'

export const useWriteStore = defineStore('write', {
  state: () => ({
    mode: 'quick',
    topicText: '',      // 用户输入的题目（可选）
    essayText: '',
    isLoading: false,
    result: null,
  }),

  getters: {
    wordCount: (state) => {
      const t = state.essayText.trim()
      if (!t) return 0
      const hasChinese = /[\u4e00-\u9fff]/.test(t)
      if (hasChinese) {
        const chineseCount = (t.match(/[\u4e00-\u9fff]/g) || []).length
        const englishWords = t.replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(w => w.length > 0).length
        return chineseCount + englishWords
      }
      return t.split(/\s+/).filter(w => w.length > 0).length
    },
  },

  actions: {
    setMode(mode) {
      this.mode = mode
      showToast(mode === 'quick' ? '快速批改：约 3 秒' : '深度批改：约 10 秒，更全面')
    },

    reset() {
      this.topicText = ''
      this.essayText = ''
      this.result = null
    },

    async correct() {
      if (this.essayText.trim().length < 50) {
        showToast('请先输入至少 50 字的作文内容')
        return
      }
      this.isLoading = true
      this.result = null
      try {
        this.result = await writeApi.correct({
          topic_text: this.topicText,
          essay: this.essayText,
          mode: this.mode,
        })
        showToast('✅ 批改完成！')
      } catch (err) {
        showToast(err || '批改失败，请重试')
      } finally {
        this.isLoading = false
      }
    },
  },
})
