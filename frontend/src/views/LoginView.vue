<template>
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:var(--bg-page);">
    <div style="font-size:48px;margin-bottom:12px;" class="animate-float">✏</div>
    <h1 style="font-size:22px;font-weight:700;color:var(--text-main);margin-bottom:4px;">AI 口语 · 作文教练</h1>
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:32px;">开口练习，精细批改</p>

    <div style="display:flex;background:#fff;padding:4px;border-radius:12px;margin-bottom:24px;width:100%;max-width:320px;box-shadow:var(--shadow-card);">
      <button
        v-for="tab in ['login','register']"
        :key="tab"
        type="button"
        @click="mode = tab"
        :style="{
          flex: 1,
          padding: '8px',
          fontSize: '13px',
          fontWeight: 700,
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all .2s',
          background: mode === tab ? 'var(--primary)' : 'transparent',
          color: mode === tab ? '#fff' : 'var(--text-secondary)',
        }"
      >
        {{ tab === 'login' ? '登录' : '注册' }}
      </button>
    </div>

    <div class="card card-p" style="width:100%;max-width:320px;">
      <van-form @submit="onSubmit">
        <van-cell-group inset style="margin:0 0 16px;">
          <van-field v-model="form.username" name="username" label="用户名" placeholder="请输入用户名（3-20位）"
            :rules="[{ required: true, message: '请输入用户名' }, { pattern: /^\w{3,20}$/, message: '用户名3-20位，仅字母数字下划线' }]" />
          <van-field v-if="mode === 'register'" v-model="form.email" name="email" label="邮箱" placeholder="请输入邮箱" type="email"
            :rules="[{ required: true, message: '请输入邮箱' }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }]" />
          <van-field v-model="form.password" name="password" label="密码" placeholder="请输入密码（至少6位）" type="password"
            :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]" />
        </van-cell-group>

        <van-button round block type="primary" native-type="submit" :loading="loading">
          {{ mode === 'login' ? '登录' : '注册' }}
        </van-button>
      </van-form>

      <p v-if="error" style="color:var(--accent-coral);font-size:12px;text-align:center;margin-top:12px;">{{ error }}</p>
    </div>

    <p style="font-size:11px;color:var(--text-muted);margin-top:20px;">演示账号：demo / demo123</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()
const mode    = ref('login')
const loading = ref(false)
const error   = ref('')
const form    = reactive({ username: '', email: '', password: '' })

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(form.username, form.password)
    } else {
      await auth.register(form.username, form.email, form.password)
    }
    router.push('/')
  } catch (e) {
    error.value = e || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
