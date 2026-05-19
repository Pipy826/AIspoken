<template>
  <div class="app-container">
    <!-- 背景气泡 -->
    <div class="bubble" style="width:20px;height:20px;left:10%;animation-duration:6s;" />
    <div class="bubble" style="width:15px;height:15px;left:30%;animation-duration:8s;animation-delay:2s;" />
    <div class="bubble" style="width:25px;height:25px;left:70%;animation-duration:7s;animation-delay:1s;" />

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
