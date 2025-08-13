<template>
  <div class="header-bar">
    <!-- 左侧：面包屑导航 -->
    <div class="header-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTool">
          {{ currentCategory?.name }}
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTool">
          {{ currentTool.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 右侧：工具操作 -->
    <div class="header-right">
      <!-- 工具收藏 -->
      <el-tooltip v-if="currentTool" :content="isFavorite ? '取消收藏' : '收藏工具'">
        <el-button
          :icon="isFavorite ? StarFilled : Star"
          :type="isFavorite ? 'warning' : 'default'"
          size="small"
          circle
          @click="toggleFavorite"
        />
      </el-tooltip>
      
      <!-- 历史记录 -->
      <el-dropdown trigger="click" @command="handleHistoryCommand">
        <el-button :icon="Clock" size="small" circle />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="clear" divided>
              <el-icon><Delete /></el-icon>
              清空历史
            </el-dropdown-item>
            <template v-if="recentHistory.length">
              <el-dropdown-item
                v-for="item in recentHistory"
                :key="item.timestamp"
                :command="item.toolId"
              >
                <div class="history-item">
                  <span class="history-tool">{{ getToolName(item.toolId) }}</span>
                  <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                </div>
              </el-dropdown-item>
            </template>
            <el-dropdown-item v-else disabled>暂无历史记录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 帮助 -->
      <el-tooltip content="帮助文档">
        <el-button :icon="QuestionFilled" size="small" circle @click="showHelp" />
      </el-tooltip>
      
      <!-- 主题切换 -->
      <el-tooltip :content="isDark ? '切换到亮色模式' : '切换到暗色模式'">
        <el-button
          :icon="isDark ? Sunny : Moon"
          size="small"
          circle
          @click="toggleTheme"
        />
      </el-tooltip>
      
      <!-- GitHub -->
      <el-tooltip content="GitHub 仓库">
        <el-button size="small" circle @click="openGitHub">
          <template #icon>
            <svg viewBox="0 0 1024 1024" width="16" height="16">
              <path d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-122.026666s39.68-12.8 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.733333 128-46.933333 128-46.933334a161.28 161.28 0 0 1 4.693334 122.026667 177.066667 177.066667 0 0 1 47.36 124.16c0 176.64-109.226667 215.466667-213.333334 226.986667a106.666667 106.666667 0 0 1 32 85.333333v125.866667c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667z" fill="currentColor"/>
            </svg>
          </template>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useDark, useToggle } from '@vueuse/core'
import { getToolById, categoryConfig } from '@/config/tools'
import type { ToolCategory } from '@/types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import {
  Star,
  StarFilled,
  Clock,
  Delete,
  QuestionFilled,
  Sunny,
  Moon
} from '@element-plus/icons-vue'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

// 计算属性
const currentTool = computed(() => {
  const toolId = route.path.split('/').pop()
  return toolId ? getToolById(toolId) : null
})

const currentCategory = computed(() => {
  if (!currentTool.value) return null
  return categoryConfig[currentTool.value.category as ToolCategory]
})

const isFavorite = computed(() => {
  if (!currentTool.value) return false
  return appStore.isFavorite(currentTool.value.id)
})

const recentHistory = computed(() => {
  return appStore.history.slice(0, 10)
})

// 方法
const toggleFavorite = () => {
  if (currentTool.value) {
    appStore.toggleFavorite(currentTool.value.id)
    
    ElMessage({
      type: 'success',
      message: isFavorite.value ? '已收藏' : '已取消收藏',
      duration: 1500
    })
  }
}

const handleHistoryCommand = (command: string) => {
  if (command === 'clear') {
    ElMessageBox.confirm(
      '确定要清空所有历史记录吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      appStore.clearHistory()
      ElMessage({
        type: 'success',
        message: '历史记录已清空'
      })
    })
  } else {
    // 跳转到工具
    const tool = getToolById(command)
    if (tool) {
      router.push(tool.path)
    }
  }
}

const getToolName = (toolId: string) => {
  const tool = getToolById(toolId)
  return tool?.name || '未知工具'
}

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).fromNow()
}

const showHelp = () => {
  ElMessageBox.alert(
    '这是一个完全由前端实现的工具盒子，为开发、测试、产品、UI 同学提供便利。所有数据处理都在客户端完成，保证您的隐私安全。',
    '关于 Toolbox',
    {
      confirmButtonText: '我知道了'
    }
  )
}

const toggleTheme = () => {
  toggleDark()
}

const openGitHub = () => {
  window.open('https://github.com/kinghard7/toolbox', '_blank')
}
</script>

<style lang="scss" scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  
  .header-left {
    .el-breadcrumb {
      font-size: 20px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-button {
      width: 30px !important;
      height: 30px !important;
      min-width: 30px !important;
      min-height: 30px !important;
      
      .el-icon {
        font-size: 16px;
        color: #333 !important;
      }
      
      svg {
        width: 16px;
        height: 16px;
        color: #333 !important;
      }
      
      &:hover {
        .el-icon,
        svg {
          color: #000 !important;
        }
      }
    }
  }
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 200px;
  
  .history-tool {
    font-weight: 500;
    margin-right: 12px;
  }
  
  .history-time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 0 16px;
    
    .header-left {
      .el-breadcrumb {
        font-size: 12px;
      }
    }
    
    .header-right {
      gap: 4px;
    }
  }
}
</style>
