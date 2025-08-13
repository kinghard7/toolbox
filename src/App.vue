<template>
  <el-config-provider :locale="locale">
    <div id="app" :class="{ 'dark': isDark }">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDark } from '@vueuse/core'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const appStore = useAppStore()
const isDark = useDark()

const locale = computed(() => zhCn)

// 同步主题状态到store
watch(isDark, (dark) => {
  appStore.setTheme(dark ? 'dark' : 'light')
}, { immediate: true })
</script>

<style lang="scss">
#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.dark {
  color-scheme: dark;
}
</style>
