import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ToolHistory, ToolCategory } from '@/types'
import { ToolCategory as TC } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)
  const recentTools = ref<string[]>([])
  const favorites = ref<string[]>([])
  const history = ref<ToolHistory[]>([])
  
  // 布局配置
  const tabOrder = ref<(ToolCategory | 'recent' | 'favorites')[]>([])
  const categoryToolOrder = ref<Record<ToolCategory, string[]>>({})

  // 计算属性
  const isDark = computed(() => theme.value === 'dark')

  // 方法
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }

  const addRecentTool = (toolId: string) => {
    const index = recentTools.value.indexOf(toolId)
    if (index > -1) {
      recentTools.value.splice(index, 1)
    }
    recentTools.value.unshift(toolId)
    if (recentTools.value.length > 10) {
      recentTools.value.pop()
    }
    localStorage.setItem('recentTools', JSON.stringify(recentTools.value))
  }

  const toggleFavorite = (toolId: string) => {
    const index = favorites.value.indexOf(toolId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(toolId)
    }
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const addHistory = (record: ToolHistory) => {
    history.value.unshift(record)
    if (history.value.length > 100) {
      history.value.pop()
    }
    localStorage.setItem('history', JSON.stringify(history.value))
  }

  const clearHistory = () => {
    history.value = []
    localStorage.removeItem('history')
  }

  const isFavorite = (toolId: string) => {
    return favorites.value.includes(toolId)
  }

  // 布局配置方法
  const updateTabOrder = (newOrder: (ToolCategory | 'recent' | 'favorites')[]) => {
    tabOrder.value = newOrder
    localStorage.setItem('tabOrder', JSON.stringify(newOrder))
  }

  const updateCategoryToolOrder = (category: ToolCategory, toolIds: string[]) => {
    categoryToolOrder.value[category] = toolIds
    localStorage.setItem('categoryToolOrder', JSON.stringify(categoryToolOrder.value))
  }

  const getDefaultTabOrder = (): (ToolCategory | 'recent' | 'favorites')[] => {
    return [
      'recent',
      'favorites',
      TC.ENCODING,
      TC.JSON,
      TC.TEXT,
      TC.UI,
      TC.DOCUMENT,
      TC.DEBUG
    ]
  }

  // 初始化数据
  const initializeStore = () => {
    // 读取本地存储
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      theme.value = savedTheme
    }

    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarCollapsed) {
      sidebarCollapsed.value = savedSidebarCollapsed === 'true'
    }

    const savedRecentTools = localStorage.getItem('recentTools')
    if (savedRecentTools) {
      try {
        recentTools.value = JSON.parse(savedRecentTools)
      } catch (e) {
        console.warn('Failed to parse recentTools from localStorage')
      }
    }

    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      try {
        favorites.value = JSON.parse(savedFavorites)
      } catch (e) {
        console.warn('Failed to parse favorites from localStorage')
      }
    }

    const savedHistory = localStorage.getItem('history')
    if (savedHistory) {
      try {
        history.value = JSON.parse(savedHistory)
      } catch (e) {
        console.warn('Failed to parse history from localStorage')
      }
    }

    // 读取布局配置
    const savedTabOrder = localStorage.getItem('tabOrder')
    if (savedTabOrder) {
      try {
        tabOrder.value = JSON.parse(savedTabOrder)
      } catch (e) {
        console.warn('Failed to parse tabOrder from localStorage')
        tabOrder.value = getDefaultTabOrder()
      }
    } else {
      tabOrder.value = getDefaultTabOrder()
    }

    const savedCategoryToolOrder = localStorage.getItem('categoryToolOrder')
    if (savedCategoryToolOrder) {
      try {
        categoryToolOrder.value = JSON.parse(savedCategoryToolOrder)
      } catch (e) {
        console.warn('Failed to parse categoryToolOrder from localStorage')
      }
    }
  }

  return {
    // 状态
    theme,
    sidebarCollapsed,
    recentTools,
    favorites,
    history,
    tabOrder,
    categoryToolOrder,
    
    // 计算属性
    isDark,
    
    // 方法
    setTheme,
    toggleSidebar,
    addRecentTool,
    toggleFavorite,
    addHistory,
    clearHistory,
    isFavorite,
    updateTabOrder,
    updateCategoryToolOrder,
    getDefaultTabOrder,
    initializeStore
  }
})
