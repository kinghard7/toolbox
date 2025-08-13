<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo" @click="$router.push('/')">
      <el-icon class="logo-icon">
        <Box />
      </el-icon>
      <span v-show="!collapsed" class="logo-text">Toolbox</span>
    </div>
    
    <!-- 搜索框 -->
    <div v-show="!collapsed" class="sidebar-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索工具..."
        size="small"
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
    </div>
    
    <!-- 导航菜单 -->
    <el-scrollbar class="sidebar-menu">
      <!-- 最近使用 -->
      <div v-if="recentTools.length && !searchKeyword" class="menu-section">
        <div v-show="!collapsed" class="section-title">最近使用</div>
        <div class="menu-items">
          <div
            v-for="tool in recentToolsData"
            :key="tool.id"
            class="menu-item"
            :class="{ active: isActive(tool.path) }"
            @click="navigateToTool(tool)"
          >
            <el-icon class="item-icon">
              <component :is="tool.icon" />
            </el-icon>
            <span v-show="!collapsed" class="item-text">{{ tool.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 收藏夹 -->
      <div v-if="favoriteTools.length && !searchKeyword" class="menu-section">
        <div v-show="!collapsed" class="section-title">收藏夹</div>
        <div class="menu-items">
          <div
            v-for="tool in favoriteToolsData"
            :key="tool.id"
            class="menu-item"
            :class="{ active: isActive(tool.path) }"
            @click="navigateToTool(tool)"
          >
            <el-icon class="item-icon">
              <component :is="tool.icon" />
            </el-icon>
            <span v-show="!collapsed" class="item-text">{{ tool.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="searchKeyword && searchResults.length" class="menu-section">
        <div v-show="!collapsed" class="section-title">搜索结果</div>
        <div class="menu-items">
          <div
            v-for="tool in searchResults"
            :key="tool.id"
            class="menu-item"
            :class="{ active: isActive(tool.path) }"
            @click="navigateToTool(tool)"
          >
            <el-icon class="item-icon">
              <component :is="tool.icon" />
            </el-icon>
            <span v-show="!collapsed" class="item-text">{{ tool.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 工具分类 -->
      <div v-if="!searchKeyword" class="menu-categories">
        <div
          v-for="(category, key) in categoryConfig"
          :key="key"
          class="menu-section"
        >
          <div
            v-show="!collapsed"
            class="section-title category-title"
            :style="{ color: category.color }"
          >
            <el-icon class="category-icon">
              <component :is="category.icon" />
            </el-icon>
            {{ category.name }}
          </div>
          
          <div class="menu-items">
            <div
              v-for="tool in getToolsByCategory(key as ToolCategory)"
              :key="tool.id"
              class="menu-item"
              :class="{ active: isActive(tool.path) }"
              @click="navigateToTool(tool)"
            >
              <el-icon class="item-icon">
                <component :is="tool.icon" />
              </el-icon>
              <span v-show="!collapsed" class="item-text">{{ tool.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    
    <!-- 底部操作 -->
    <div class="sidebar-footer">
      <div class="footer-actions">
        <el-tooltip content="主题切换" placement="right">
          <el-button
            :icon="isDark ? Sunny : Moon"
            circle
            size="small"
            @click="toggleTheme"
          />
        </el-tooltip>
        
        <el-tooltip :content="collapsed ? '展开侧边栏' : '收起侧边栏'" placement="right">
          <el-button
            :icon="collapsed ? Expand : Fold"
            circle
            size="small"
            @click="toggleSidebar"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { useAppStore } from '@/stores/app'
import { toolsConfig, categoryConfig, getToolsByCategory, searchTools, getToolById } from '@/config/tools'
import type { ToolInfo, ToolCategory } from '@/types'
import {
  Box,
  Search,
  Star,
  Sunny,
  Moon,
  Expand,
  Fold,
  // 工具图标
  Key,
  Document,
  Link,
  Postcard,
  Lock,
  DocumentCopy,
  DocumentChecked,
  EditPen,
  Sort,
  DataAnalysis,
  Delete,
  Brush,
  Picture,
  Monitor,
  Connection,
  Timer,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const searchKeyword = ref('')
const searchResults = ref<ToolInfo[]>([])

// 计算属性
const collapsed = computed(() => appStore.sidebarCollapsed)
const recentTools = computed(() => appStore.recentTools)
const favoriteTools = computed(() => appStore.favorites)

const recentToolsData = computed(() => {
  return recentTools.value
    .map(id => getToolById(id))
    .filter(Boolean)
    .slice(0, 5) as ToolInfo[]
})

const favoriteToolsData = computed(() => {
  return favoriteTools.value
    .map(id => getToolById(id))
    .filter(Boolean) as ToolInfo[]
})

// 方法
const toggleTheme = () => {
  toggleDark()
}

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const isActive = (path: string) => {
  return route.path === path
}

const navigateToTool = (tool: ToolInfo) => {
  router.push(tool.path)
  appStore.addRecentTool(tool.id)
}

const handleSearch = (keyword: string) => {
  if (keyword.trim()) {
    searchResults.value = searchTools(keyword.trim())
  } else {
    searchResults.value = []
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  
  &-logo {
    display: flex;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .logo-icon {
      font-size: 24px;
      color: var(--el-color-primary);
      margin-right: 12px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  &-search {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  &-menu {
    flex: 1;
    padding: 8px 0;
  }
  
  &-footer {
    border-top: 1px solid var(--el-border-color-light);
    padding: 12px;
    
    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 8px;
    }
  }
}

.menu-section {
  margin-bottom: 16px;
  
  .section-title {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    &.category-title {
      display: flex;
      align-items: center;
      font-size: 13px;
      
      .category-icon {
        margin-right: 6px;
      }
    }
  }
  
  .menu-items {
    .menu-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
      
      &.active {
        background: var(--el-color-primary-light-8);
        color: var(--el-color-primary);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--el-color-primary);
        }
      }
      
      .item-icon {
        font-size: 16px;
        margin-right: 12px;
        width: 16px;
        flex-shrink: 0;
      }
      
      .item-text {
        flex: 1;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      

    }
  }
}

// 响应式
@media (max-width: 768px) {
  .sidebar {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
