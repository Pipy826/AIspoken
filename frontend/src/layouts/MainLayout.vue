<template>
  <div style="height:100%;display:flex;flex-direction:column;background:var(--bg-page);">
    <div style="flex:1;overflow:hidden;position:relative;">
      <router-view />
    </div>

    <div class="main-tabbar">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="{ active: active === tab.name }"
        @click="onTabChange(tab.name)"
      >
        <span class="tab-icon" v-html="tab.svg"></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  {
    name: 'home',
    label: '首页',
    route: 'Home',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    name: 'speak',
    label: '口语',
    route: 'Speak',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>',
  },
  {
    name: 'write',
    label: '作文',
    route: 'Write',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  },
  {
    name: 'report',
    label: '学习',
    route: 'Report',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  },
  {
    name: 'profile',
    label: '我的',
    route: 'Profile',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  },
]

const routeToTab = {
  Home: 'home',
  Speak: 'speak',
  Write: 'write',
  Report: 'report',
  Profile: 'profile',
}

const tabToRouteName = {
  home: 'Home',
  speak: 'Speak',
  write: 'Write',
  report: 'Report',
  profile: 'Profile',
}

const active = ref(routeToTab[route.name] || 'home')

watch(
  () => route.name,
  (name) => {
    if (routeToTab[name]) active.value = routeToTab[name]
  },
)

function onTabChange(name) {
  const routeName = tabToRouteName[name]
  if (routeName) router.replace({ name: routeName })
}
</script>

<style scoped>
.main-tabbar {
  height: 60px;
  background: #fff;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 4px;
  flex-shrink: 0;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 500;
  padding: 4px 12px;
  transition: color 0.2s;
}
.tab-item.active {
  color: var(--primary);
}
.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.tab-item.active .tab-icon {
  transform: scale(1.1);
}
.tab-label {
  margin-top: 1px;
}
</style>
