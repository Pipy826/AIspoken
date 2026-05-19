import { defineStore } from 'pinia'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isVip: (state) => state.user?.is_vip || false,
  },

  actions: {
    async login(username, password) {
      const data = await authApi.login(username, password)
      this.token = data.access_token
      localStorage.setItem('token', data.access_token)
      await this.fetchMe()
    },

    async register(username, email, password) {
      const data = await authApi.register({ username, email, password })
      this.token = data.access_token
      localStorage.setItem('token', data.access_token)
      await this.fetchMe()
    },

    async fetchMe() {
      try {
        const user = await authApi.me()
        // 后端 snake_case → 前端 camelCase 映射（保留两种格式兼容）
        user.todayGoal = user.today_goal ?? { done: 0, total: 5 }
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
      } catch (e) {
        // 如果 token 已失效（401），清除本地状态
        const msg = typeof e === 'string' ? e : (e?.message || '')
        if (msg.includes('无效') || msg.includes('401') || msg.includes('认证')) {
          this.logout()
        }
        throw e
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
