<template>
  <div class="layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="layout-sidebar">
        <Sidebar />
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container class="layout-main">
        <!-- 顶部导航 -->
        <el-header class="layout-header">
          <HeaderBar />
        </el-header>
        
        <!-- 内容区域 -->
        <el-main class="layout-content">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from '@/components/layout/Sidebar.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() => 
  appStore.sidebarCollapsed ? '64px' : '240px'
)

onMounted(() => {
  appStore.initializeStore()
})
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  overflow: hidden;
  
  &-container {
    height: 100%;
  }
  
  &-sidebar {
    border-right: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
    transition: width 0.3s ease;
    overflow: hidden;
  }
  
  &-main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  &-header {
    border-bottom: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
    padding: 0;
    height: 60px !important;
    line-height: 60px;
  }
  
  &-content {
    flex: 1;
    overflow: auto;
    padding: 0;
    background: var(--el-bg-color-page);
  }
}

// 页面切换动画 - 优化性能
.page-fade-enter-active {
  transition: opacity 0.15s ease-out;
}

.page-fade-leave-active {
  transition: opacity 0.1s ease-in;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .layout-sidebar {
    position: absolute;
    z-index: 1000;
    height: 100%;
  }
}
</style>
