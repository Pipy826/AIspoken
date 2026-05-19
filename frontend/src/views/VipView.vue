<template>
  <div class="page-scroll" style="padding-top:0;background:var(--bg-page);">
    <div
      style="background:#fff;padding:14px 20px 10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);"
    >
      <h1 style="font-size:20px;font-weight:700;color:var(--text-main);">◆ 会员中心</h1>
      <span style="font-size:18px;">🔔</span>
    </div>

    <div v-if="data" style="padding-bottom:24px;">
      <div class="vip-banner-gradient" style="margin-top:14px;">
        <h2 style="font-size:22px;font-weight:700;">★ {{ data.banner_title }}</h2>
        <p style="font-size:14px;opacity:0.95;margin-top:4px;">{{ data.banner_desc }}</p>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <span
            v-for="(b, i) in data.badges"
            :key="i"
            style="background:rgba(255,255,255,0.25);padding:2px 14px;border-radius:20px;font-size:13px;"
          >{{ b }}</span>
        </div>
      </div>

      <div class="card card-p card-mb">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;">选择套餐</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
          <div
            v-for="p in data.plans"
            :key="p.id"
            class="vip-plan"
            :class="{ active: selected === p.id }"
            @click="selected = p.id"
          >
            <div class="price">{{ p.price_display }} <small v-if="p.price_sub">{{ p.price_sub }}</small></div>
            <div class="name">{{ p.name }}</div>
            <div v-if="p.note" style="font-size:11px;color:var(--text-muted);margin-top:2px;">{{ p.note }}</div>
            <span v-if="p.tag" class="hot">{{ p.tag }}</span>
          </div>
        </div>
      </div>

      <div class="card card-p card-mb">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;">✦ 会员权益</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div v-for="(f, i) in data.features" :key="i" style="display:flex;align-items:center;gap:8px;font-size:13px;color:#3a3a3c;">
            <span style="color:#34c759;font-weight:700;">✓</span> {{ f }}
          </div>
        </div>
      </div>

      <div class="card card-p card-mb">
        <div style="font-size:16px;font-weight:600;margin-bottom:10px;display:flex;justify-content:space-between;">
          ◆ 增值服务
          <span style="font-size:13px;font-weight:400;color:var(--primary);">了解 →</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <div
            v-for="(a, i) in data.addons"
            :key="i"
            style="flex:1;min-width:80px;background:#f7f8fc;border-radius:12px;padding:12px;text-align:center;"
          >
            <div style="font-size:24px;">{{ a.icon }}</div>
            <div style="font-size:13px;font-weight:500;">{{ a.title }}</div>
            <div style="font-size:12px;color:var(--text-muted);">{{ a.price }}</div>
          </div>
        </div>
      </div>

      <div style="margin:0 16px 16px;">
        <van-button round block type="primary" @click="onPay">➚ 立即开通 · 首月 ¥29</van-button>
        <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px;">7 天无理由退款 · 随时取消</p>
      </div>
    </div>
    <div v-else style="padding:40px;text-align:center;color:var(--text-muted);">加载中…</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { vipApi } from '@/api'

const data = ref(null)
const selected = ref('month')

onMounted(async () => {
  try {
    data.value = await vipApi.plans()
    const hot = data.value.plans.find((p) => p.highlight)
    if (hot) selected.value = hot.id
  } catch {
    showToast('加载失败')
  }
})

function onPay() {
  showToast(`已选择套餐：${selected.value}（演示）`)
}
</script>

<style scoped>
.vip-plan {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  text-align: center;
  flex: 1;
  min-width: 70px;
  border: 2px solid var(--bg-muted);
  cursor: pointer;
}
.vip-plan.active {
  border-color: var(--primary);
  background: #f0f4ff;
}
.vip-plan .price {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}
.vip-plan .price small {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
}
.vip-plan .name {
  font-size: 13px;
  color: #3a3a3c;
  margin-top: 2px;
}
.vip-plan .hot {
  font-size: 11px;
  background: var(--primary);
  color: #fff;
  padding: 1px 10px;
  border-radius: 10px;
  display: inline-block;
  margin-top: 4px;
}
</style>
