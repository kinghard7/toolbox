<template>
  <div class="home">
    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-header">
        <h1 class="page-title">
          <el-icon class="title-icon"><Box /></el-icon>
          Toolbox 工具盒子
        </h1>
        <p class="page-subtitle">一个完全由前端实现的工具盒子，为开发、测试、产品、UI 同学提供便利</p>
      </div>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索工具，如：JSON、Base64、颜色转换..."
        size="large"
        :prefix-icon="Search"
        clearable
        class="search-input"
        @input="handleSearch"
      />
    </div>
    
    <!-- 搜索结果 -->
    <div v-if="searchKeyword && searchResults.length" class="tools-section">
      <h2 class="section-title">
        <el-icon><Search /></el-icon>
        搜索结果 ({{ searchResults.length }})
      </h2>
      <div class="tools-grid">
        <ToolCard
          v-for="tool in searchResults"
          :key="tool.id"
          :tool="tool"
          @click="navigateToTool(tool)"
        />
      </div>
    </div>
    
    <!-- 工具分类 Tab -->
    <div v-if="!searchKeyword" class="categories-section">
      <!-- 可拖拽的tab header -->
      <div class="draggable-tabs">
        <draggable 
          v-model="orderedTabsData" 
          class="tabs-header"
          @change="handleTabOrderChange"
          item-key="key"
        >
          <template #item="{ element: tab }">
            <div 
              class="draggable-tab"
              :class="{ active: activeTab === tab.key }"
              @click="handleTabClick(tab.key)"
            >
              <span class="tab-label">
                <el-icon>
                  <component :is="tab.icon" />
                </el-icon>
                {{ tab.name }}
                <el-badge 
                  v-if="tab.count !== undefined"
                  :value="tab.count" 
                  class="category-badge"
                  type="info"
                />
              </span>
            </div>
          </template>
        </draggable>
      </div>
      
      <!-- 内容区域 -->
      <div class="tab-content">
        <!-- 最近使用 -->
        <div v-if="activeTab === 'recent'" class="tab-pane">
          <div class="tools-grid" v-if="recentToolsData.length">
            <ToolCard
              v-for="tool in recentToolsData"
              :key="tool.id"
              :tool="tool"
              @click="navigateToTool(tool)"
            />
          </div>
          <div v-else class="empty-state-small">
            <el-icon class="empty-icon"><Clock /></el-icon>
            <p class="empty-text">暂无使用记录</p>
            <p class="empty-hint">使用工具后会在这里显示</p>
          </div>
        </div>
        
        <!-- 我的收藏 -->
        <div v-else-if="activeTab === 'favorites'" class="tab-pane">
          <div class="tools-grid" v-if="favoriteToolsData.length">
            <ToolCard
              v-for="tool in favoriteToolsData"
              :key="tool.id"
              :tool="tool"
              @click="navigateToTool(tool)"
            />
          </div>
          <div v-else class="empty-state-small">
            <el-icon class="empty-icon"><StarFilled /></el-icon>
            <p class="empty-text">还没有收藏任何工具</p>
            <p class="empty-hint">点击工具卡片右上角的星星来收藏工具</p>
          </div>
        </div>
        
        <!-- 分类内容 -->
        <div v-else-if="categoryConfig[activeTab as ToolCategory]" class="tab-pane">
          <draggable 
            v-model="categoryToolsMap[activeTab as ToolCategory]" 
            class="tools-grid"
            @change="handleToolOrderChange(activeTab as ToolCategory)"
            item-key="id"
          >
            <template #item="{ element: tool }">
              <ToolCard
                :tool="tool"
                @click="navigateToTool(tool)"
              />
            </template>
          </draggable>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="searchKeyword && !searchResults.length" class="empty-state">
      <el-icon class="empty-icon"><Search /></el-icon>
      <p class="empty-text">未找到相关工具</p>
      <p class="empty-hint">尝试使用其他关键词搜索</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { toolsConfig, categoryConfig, getToolsByCategory, getToolsByCategoryWithOrder, searchTools, getToolById } from '@/config/tools'
import { preloadByCategory, isRoutePreloaded } from '@/utils/routePreloader'
import ToolCard from '@/components/base/ToolCard.vue'
import draggable from 'vuedraggable'
import type { ToolInfo, ToolCategory } from '@/types'
import {
  Box,
  Search,
  Star,
  StarFilled,
  Clock,
  // 分类图标
  Key,
  Document,
  EditPen,
  Brush,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()

const searchKeyword = ref('')
const searchResults = ref<ToolInfo[]>([])
const activeTab = ref('recent')

// 计算属性
const recentToolsData = computed(() => {
  return appStore.recentTools
    .map(id => getToolById(id))
    .filter(Boolean)
    .slice(0, 8) as ToolInfo[]
})

const favoriteToolsData = computed(() => {
  return appStore.favorites
    .map(id => getToolById(id))
    .filter(Boolean) as ToolInfo[]
})

// 按顺序显示的tab列表
const orderedTabs = computed(() => {
  return appStore.tabOrder.length > 0 ? appStore.tabOrder : appStore.getDefaultTabOrder()
})

// 各分类的工具映射
const categoryToolsMap = ref<Record<ToolCategory, ToolInfo[]>>({} as Record<ToolCategory, ToolInfo[]>)

// 初始化分类工具映射
const initializeCategoryToolsMap = () => {
  Object.keys(categoryConfig).forEach(key => {
    const category = key as ToolCategory
    const customOrder = appStore.categoryToolOrder[category]
    categoryToolsMap.value[category] = getToolsByCategoryWithOrder(category, customOrder)
  })
}

// 可拖拽的tab数据
const orderedTabsData = ref<Array<{
  key: string
  name: string
  icon: string
  count?: number
}>>([])

// 初始化tab数据
const initializeTabsData = () => {
  orderedTabsData.value = orderedTabs.value.map(tabKey => {
    if (tabKey === 'recent') {
      return {
        key: 'recent',
        name: '最近使用',
        icon: 'Clock'
      }
    } else if (tabKey === 'favorites') {
      return {
        key: 'favorites',
        name: '我的收藏',
        icon: 'StarFilled'
      }
    } else {
      const category = tabKey as ToolCategory
      const config = categoryConfig[category]
      if (!config) {
        console.warn(`Category config not found for: ${category}`)
        return {
          key: tabKey,
          name: tabKey,
          icon: 'Setting',
          count: 0
        }
      }
      return {
        key: tabKey,
        name: config.name,
        icon: config.icon,
        count: getToolsByCategory(category).length
      }
    }
  })
}

// 方法
const handleSearch = (keyword: string) => {
  if (keyword.trim()) {
    searchResults.value = searchTools(keyword.trim())
  } else {
    searchResults.value = []
  }
}

const navigateToTool = async (tool: ToolInfo) => {
  try {
    // 立即添加到最近使用，提供即时反馈
    appStore.addRecentTool(tool.id)
    
    // 检查是否已预加载，如果没有则显示加载提示
    if (!isRoutePreloaded(tool.path)) {
      ElMessage({
        type: 'info',
        message: `正在打开 ${tool.name}...`,
        duration: 800,
        showClose: false
      })
    }
    
    // 执行路由跳转
    await router.push(tool.path)
  } catch (error) {
    console.error('Failed to navigate to tool:', error)
    ElMessage({
      type: 'error',
      message: '页面加载失败，请重试',
      duration: 2000
    })
  }
}

const handleTabClick = (tabKey: string) => {
  activeTab.value = tabKey
  
  // 当用户切换到某个分类时，预加载该分类的热门工具
  if (tabKey !== 'recent' && tabKey !== 'favorites') {
    const categoryMap: Record<string, string> = {
      'encoding': 'encoding',
      'json': 'json', 
      'text': 'text',
      'ui': 'ui',
      'document': 'document',
      'debug': 'debug'
    }
    
    const category = categoryMap[tabKey]
    if (category) {
      preloadByCategory(category)
    }
  }
}

const handleToolOrderChange = (category: ToolCategory) => {
  const toolIds = categoryToolsMap.value[category]?.map(tool => tool.id) || []
  appStore.updateCategoryToolOrder(category, toolIds)
}

const handleTabOrderChange = () => {
  const newOrder = orderedTabsData.value.map(tab => tab.key) as (ToolCategory | 'recent' | 'favorites')[]
  appStore.updateTabOrder(newOrder)
}

onMounted(() => {
  // 初始化分类工具映射
  initializeCategoryToolsMap()
  // 初始化tab数据
  initializeTabsData()
})
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: transparent;
  position: relative;
}

.search-section {
  padding: 48px 20px 32px;
  text-align: center;
  background: transparent;
  position: relative;
  
  // 搜索区域背景效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 800px;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.18);
    z-index: -1;
  }
  
  .search-header {
    margin-bottom: 32px;
    
    .page-title {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: #667eea; // 兼容性回退
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      position: relative;
      
      // 标题发光效果
      &::before {
        content: '';
        position: absolute;
        inset: -4px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 16px;
        opacity: 0.1;
        filter: blur(8px);
        z-index: -1;
      }
      
      .title-icon {
        font-size: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
        animation: pulse 2s ease-in-out infinite;
      }
    }
    
    .page-subtitle {
      font-size: 16px;
      color: #5a6c7d;
      margin: 0;
      line-height: 1.6;
      font-weight: 400;
    }
  }
  
  .search-input {
    max-width: 640px;
    position: relative;
    
    :deep(.el-input) {
      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 32px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 8px 24px;
        
        &:hover {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        &.is-focus {
          border-color: rgba(102, 126, 234, 0.6);
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px rgba(102, 126, 234, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
      }
      
      .el-input__inner {
        color: #2c3e50;
        font-size: 16px;
        font-weight: 500;
        
        &::placeholder {
          color: #7f8c8d;
          font-weight: 400;
        }
      }
      
      .el-input__prefix-inner {
        color: #5a6c7d;
        font-size: 18px;
      }
      
      .el-input__suffix-inner {
        color: #5a6c7d;
      }
    }
  }
}

// 图标脉冲动画
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 激活状态微光动画
@keyframes shimmerActive {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

// 工具网格入场动画
.tab-content .tools-grid {
  .tool-card {
    animation: fadeInUp 0.6s ease-out;
    
    @for $i from 1 through 12 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.tools-section {
  padding: 24px 20px 32px;
  position: relative;
  
  // 内容区域背景
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    height: calc(100% - 24px);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    z-index: -1;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 24px;
    
    .el-icon {
      font-size: 22px;
      color: #5a6c7d;
    }
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}

.categories-section {
  padding: 24px 20px 32px;
  position: relative;
  
  // 分类区域背景
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    height: calc(100% - 24px);
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(15px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: -1;
  }
  
  .draggable-tabs {
    margin-bottom: 32px;
    
    .tabs-header {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 16px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.18);
      position: relative;
      
      // 装饰性渐变边框
      &::before {
        content: '';
        position: absolute;
        inset: -1px;
        padding: 1px;
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.3) 0%, 
          rgba(255, 255, 255, 0.1) 50%, 
          rgba(255, 255, 255, 0.3) 100%
        );
        border-radius: inherit;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        pointer-events: none;
      }
    }
    
    .draggable-tab {
      padding: 0 24px;
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 16px;
      position: relative;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.08);
      color: #34495e;
      user-select: none;
      overflow: hidden;
      
      // 内部发光效果
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%,
          rgba(255, 255, 255, 0.05) 100%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: inherit;
      }
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #2c3e50;
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px) scale(1.02);
        box-shadow: 
          0 8px 24px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.1);
        
        &::before {
          opacity: 1;
        }
      }
      
      &.active {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.25) 0%, 
          rgba(255, 255, 255, 0.15) 100%
        );
        color: #2c3e50;
        border-color: rgba(255, 255, 255, 0.4);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        
        // 激活状态的发光效果
        &::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 100%
          );
          border-radius: inherit;
          opacity: 0.8;
          animation: shimmerActive 3s ease-in-out infinite;
        }
      }
      
      &.sortable-ghost {
        opacity: 0.5;
        background: var(--el-color-primary-light-9);
      }
      
      &.sortable-chosen {
        cursor: grabbing;
      }
      
      .tab-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        
        .el-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        
        .category-badge {
          margin-left: 6px;
          
          :deep(.el-badge__content) {
            font-size: 10px;
            padding: 0 6px;
            height: 18px;
            line-height: 18px;
            min-width: 18px;
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.9);
            color: var(--el-color-primary);
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }
      }
      
      &.active .tab-label .category-badge :deep(.el-badge__content) {
        background: rgba(255, 255, 255, 0.95);
        color: var(--el-color-primary);
      }
    }
  }
  
  .tab-content {
    .tab-pane {
      min-height: 200px;
    }
    
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      
      .sortable-ghost {
        opacity: 0.5;
      }
      
      .sortable-chosen {
        cursor: grabbing;
        transform: rotate(5deg);
      }
    }
  }
  
  .category-tabs {
    // 优化header整体样式
    :deep(.el-tabs__header) {
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }
    
    // 移除默认的下边框
    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
    
    // 优化导航容器
    :deep(.el-tabs__nav-wrap) {
      border-radius: 12px;
      overflow: hidden;
    }
    
    // 美化每个tab项
    :deep(.el-tabs__item) {
      padding: 0 20px;
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 12px;
      margin-right: 6px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      background: transparent;
      color: var(--el-text-color-regular);
      
      // 添加伪元素用于背景动画
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, 
          var(--el-color-primary-light-9) 0%,
          var(--el-color-primary-light-8) 100%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 12px;
      }
      
      // 激活状态
      &.is-active {
        background: linear-gradient(135deg, 
          var(--el-color-primary) 0%, 
          #667eea 100%
        );
        color: white;
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
        transform: translateY(-1px);
        
        &::before {
          opacity: 0;
        }
        
        // 添加微光效果
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          animation: shimmer 2s ease-in-out infinite;
          border-radius: 12px;
        }
      }
      
      // 悬停效果
      &:hover:not(.is-active) {
        background: rgba(64, 158, 255, 0.1);
        color: var(--el-color-primary);
        border-color: rgba(64, 158, 255, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
        
        &::before {
          opacity: 1;
        }
      }
    }
    
    // tab标签内容样式
    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      position: relative;
      z-index: 1;
      
      .el-icon {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
      
      .category-badge {
        margin-left: 6px;
        
        :deep(.el-badge__content) {
          font-size: 10px;
          padding: 0 6px;
          height: 18px;
          line-height: 18px;
          min-width: 18px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.9);
          color: var(--el-color-primary);
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    // 激活状态下的图标动画
    :deep(.el-tabs__item.is-active) .tab-label .el-icon {
      transform: scale(1.1);
    }
    
    // 内容区域样式
    :deep(.el-tabs__content) {
      padding-top: 0;
    }
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    min-height: 200px;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-icon {
    font-size: 64px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 16px;
  }
  
  .empty-text {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }
  
  .empty-hint {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }
}

.empty-state-small {
  text-align: center;
  padding: 40px 20px;
  
  .empty-icon {
    font-size: 48px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 12px;
  }
  
  .empty-text {
    font-size: 16px;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
  }
  
  .empty-hint {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }
}

@media (max-width: 1200px) and (min-width: 769px) {
  .tools-section,
  .categories-section {
    .tools-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 18px;
    }
  }
}

@media (max-width: 768px) and (min-width: 481px) {
  .search-section {
    padding: 24px 16px;
    
    .search-header {
      margin-bottom: 20px;
      
      .page-title {
        font-size: 24px;
        
        .title-icon {
          font-size: 28px;
        }
      }
      
      .page-subtitle {
        font-size: 13px;
      }
    }
  }
  
  .tools-section,
  .categories-section {
    padding: 0 16px 24px;
    
    .draggable-tabs {
      .tabs-header {
        padding: 8px;
        gap: 6px;
      }
      
      .draggable-tab {
        padding: 0 12px;
        height: 38px;
        line-height: 38px;
        font-size: 13px;
        
        .tab-label {
          font-size: 13px;
          gap: 6px;
          
          .el-icon {
            font-size: 15px;
          }
          
          .category-badge {
            margin-left: 4px;
            
            :deep(.el-badge__content) {
              font-size: 9px;
              padding: 0 4px;
              height: 16px;
              line-height: 16px;
              min-width: 16px;
              border-radius: 8px;
            }
          }
        }
      }
    }
    
    .tab-content .tools-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .section-title {
      font-size: 16px;
      margin-bottom: 12px;
    }
    
    .tools-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .category-tabs {
      // 平板样式优化
      :deep(.el-tabs__header) {
        margin-bottom: 18px;
        padding: 6px;
        border-radius: 12px;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
      }
      
      :deep(.el-tabs__item) {
        padding: 0 12px;
        height: 38px;
        line-height: 38px;
        font-size: 13px;
        margin-right: 4px;
        border-radius: 10px;
        
        &.is-active {
          box-shadow: 0 3px 12px rgba(64, 158, 255, 0.25);
        }
        
        &:hover:not(.is-active) {
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
        }
      }
      
      .tab-label {
        font-size: 13px;
        gap: 6px;
        
        .el-icon {
          font-size: 15px;
        }
        
        .category-badge {
          margin-left: 4px;
          
          :deep(.el-badge__content) {
            font-size: 9px;
            padding: 0 4px;
            height: 16px;
            line-height: 16px;
            min-width: 16px;
            border-radius: 8px;
          }
        }
      }
      
      :deep(.el-tabs__nav-scroll) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        
        &::-webkit-scrollbar {
          display: none;
        }
      }
      
      :deep(.el-tabs__nav) {
        white-space: nowrap;
        padding: 0 4px;
      }
    }
  }
}

@media (max-width: 480px) {
  .search-section {
    padding: 20px 12px;
    
    .search-header {
      margin-bottom: 16px;
      
      .page-title {
        font-size: 22px;
        
        .title-icon {
          font-size: 24px;
        }
      }
      
      .page-subtitle {
        font-size: 12px;
      }
    }
  }
  
  .tools-section,
  .categories-section {
    padding: 0 12px 20px;
    
    .tools-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .draggable-tabs {
      .tabs-header {
        padding: 6px;
        gap: 4px;
        flex-wrap: wrap;
      }
      
      .draggable-tab {
        padding: 0 8px;
        height: 34px;
        line-height: 34px;
        font-size: 12px;
        
        .tab-label {
          font-size: 12px;
          gap: 4px;
          
          .el-icon {
            font-size: 13px;
          }
          
          .category-badge {
            margin-left: 3px;
            
            :deep(.el-badge__content) {
              font-size: 8px;
              padding: 0 3px;
              height: 14px;
              line-height: 14px;
              min-width: 14px;
              border-radius: 7px;
            }
          }
        }
      }
    }
    
    .tab-content .tools-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .category-tabs {
      // 小屏幕优化
      :deep(.el-tabs__header) {
        margin-bottom: 16px;
        padding: 4px;
        border-radius: 10px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
      
      :deep(.el-tabs__item) {
        padding: 0 8px;
        height: 34px;
        line-height: 34px;
        font-size: 12px;
        margin-right: 3px;
        border-radius: 8px;
        
        &.is-active {
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
          transform: translateY(0);
        }
        
        &:hover:not(.is-active) {
          box-shadow: 0 1px 6px rgba(64, 158, 255, 0.15);
          transform: translateY(0);
        }
      }
      
      .tab-label {
        font-size: 12px;
        gap: 4px;
        
        .el-icon {
          font-size: 13px;
        }
        
        .category-badge {
          margin-left: 3px;
          
          :deep(.el-badge__content) {
            font-size: 8px;
            padding: 0 3px;
            height: 14px;
            line-height: 14px;
            min-width: 14px;
            border-radius: 7px;
          }
        }
      }
      
      :deep(.el-tabs__nav-scroll) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        
        &::-webkit-scrollbar {
          display: none;
        }
      }
      
      :deep(.el-tabs__nav) {
        white-space: nowrap;
        padding: 0 2px;
      }
    }
  }
}

// 动画关键帧
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 添加暗色主题适配
@media (prefers-color-scheme: dark) {
  .categories-section .category-tabs {
    :deep(.el-tabs__header) {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
    }
    
    :deep(.el-tabs__item) {
      &.is-active {
        background: linear-gradient(135deg, 
          var(--el-color-primary) 0%, 
          #4e73df 100%
        );
        
        .category-badge :deep(.el-badge__content) {
          background: rgba(255, 255, 255, 0.95);
          color: var(--el-color-primary);
        }
      }
      
      &:hover:not(.is-active) {
        background: rgba(64, 158, 255, 0.15);
        border-color: rgba(64, 158, 255, 0.4);
      }
    }
  }
}
</style>

