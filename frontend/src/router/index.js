import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',        name: 'Home',    component: () => import('@/views/HomeView.vue') },
      { path: 'speak',   name: 'Speak',   component: () => import('@/views/SpeakView.vue') },
      { path: 'write',   name: 'Write',   component: () => import('@/views/WriteView.vue') },
      { path: 'report',  name: 'Report',  component: () => import('@/views/ReportView.vue') },
      { path: 'profile', name: 'Profile', component: () => import('@/views/ProfileView.vue') },
      { path: 'exam',    name: 'Exam',    component: () => import('@/views/ExamView.vue') },
      { path: 'improve', name: 'Improve', component: () => import('@/views/ImproveView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth) {
    if (!auth.token) return '/login'
    // 如果有 token 但没有用户信息（如页面刷新），尝试拉取用户信息
    if (!auth.user) {
      try {
        await auth.fetchMe()
      } catch {
        return '/login'
      }
    }
  }
  if (to.meta.guest && auth.token) return '/'
})

export default router
