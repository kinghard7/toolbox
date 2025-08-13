<template>
  <div class="tool-card" :class="{ 'is-clicking': isClicking }" @click="handleClick">
    <div class="tool-card-header">
      <div class="tool-info">
        <el-icon class="tool-icon" :style="{ color: categoryColor }">
          <component :is="tool.icon" />
        </el-icon>
        <div class="tool-details">
          <h3 class="tool-name">{{ tool.name }}</h3>
          <p class="tool-description">{{ tool.description }}</p>
        </div>
      </div>
      
      <div class="tool-actions">
        <el-icon
          class="favorite-btn"
          :class="{ 'is-favorite': isFavorite }"
          :title="isFavorite ? '取消收藏' : '收藏工具'"
          @click.stop="toggleFavorite"
        >
          <component :is="isFavorite ? StarFilled : Star" />
        </el-icon>
      </div>
    </div>
    
    <div class="tool-tags">
      <span
        v-for="tag in tool.tags"
        :key="tag"
        class="tool-tag"
        :style="{ backgroundColor: `${categoryColor}20`, color: categoryColor }"
      >
        {{ tag }}
      </span>
    </div>
    
    <div class="tool-footer">
      <span class="tool-category">{{ categoryName }}</span>
      <el-icon class="arrow-icon">
        <ArrowRight />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { categoryConfig } from '@/config/tools'
import type { ToolInfo, ToolCategory } from '@/types'
import {
  Star,
  StarFilled,
  ArrowRight,
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
  Setting,
  Search
} from '@element-plus/icons-vue'

interface Props {
  tool: ToolInfo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [tool: ToolInfo]
}>()

const appStore = useAppStore()

// 添加点击状态
const isClicking = ref(false)

// 计算属性
const isFavorite = computed(() => appStore.isFavorite(props.tool.id))

const categoryName = computed(() => {
  return categoryConfig[props.tool.category as ToolCategory]?.name || '未知分类'
})

const categoryColor = computed(() => {
  return categoryConfig[props.tool.category as ToolCategory]?.color || '#909399'
})

// 方法
const handleClick = async () => {
  if (isClicking.value) return // 防止重复点击
  
  isClicking.value = true
  
  try {
    emit('click', props.tool)
    // 短暂延迟以显示点击反馈
    await new Promise(resolve => setTimeout(resolve, 150))
  } finally {
    isClicking.value = false
  }
}

const toggleFavorite = () => {
  appStore.toggleFavorite(props.tool.id)
  
  ElMessage({
    type: 'success',
    message: isFavorite.value ? '已收藏' : '已取消收藏',
    duration: 1500,
    showClose: false
  })
}
</script>

<style lang="scss" scoped>
.tool-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  // 卡片发光边框
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    pointer-events: none;
          opacity: 0;
      transition: opacity 0.15s ease;
  }
  
  // 装饰性渐变光效
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 
      0 16px 48px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-6px) scale(1.02);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 1;
    }
  }
  
  // 点击状态
  &.is-clicking {
    transform: translateY(-2px) scale(0.98);
    opacity: 0.9;
    
    .tool-icon {
      transform: scale(1.05);
    }
  }
  
  .tool-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .tool-info {
      display: flex;
      align-items: flex-start;
      flex: 1;
      min-width: 0;
      
      .tool-icon {
        font-size: 28px;
        margin-right: 16px;
        margin-top: 2px;
        flex-shrink: 0;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 14px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 
          0 4px 16px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
      
      .tool-details {
        flex: 1;
        min-width: 0;
        
        .tool-name {
          font-size: 19px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 12px 0;
          line-height: 1.4;
          word-break: break-word;
        }
        
        .tool-description {
          font-size: 14px;
          color: #5a6c7d;
          margin: 0;
          line-height: 1.6;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
    
    .tool-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      margin-left: 12px;
      
      .favorite-btn {
        color: #95a5a6;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 8px;
        border-radius: 10px;
        min-width: 36px;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          color: #f39c12;
          background: rgba(243, 156, 18, 0.15);
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
        }
        
        &.is-favorite {
          color: #f39c12;
          background: rgba(243, 156, 18, 0.15);
          box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
        }
      }
    }
  }
  
  .tool-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    margin-left: 40px; /* 对齐到描述文本，图标宽度28px + padding 16px + icon padding 16px */
    flex: 1;
    
    .tool-tag {
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .tool-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: auto;
    
    .tool-category {
      font-size: 13px;
      color: #5a6c7d;
      font-weight: 600;
      background: rgba(52, 73, 94, 0.08);
      backdrop-filter: blur(10px);
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(52, 73, 94, 0.15);
    }
    
    .arrow-icon {
      font-size: 16px;
      color: #7f8c8d;
      transition: all 0.3s ease;
      padding: 8px;
      border-radius: 50%;
      background: rgba(52, 73, 94, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(52, 73, 94, 0.1);
    }
  }
  
  &:hover {
    .arrow-icon {
      color: #2c3e50;
      transform: translateX(3px) scale(1.1);
      background: rgba(52, 73, 94, 0.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .tool-icon {
      transform: scale(1.1) rotate(5deg);
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    
    .tool-category {
      background: rgba(52, 73, 94, 0.12);
      color: #2c3e50;
    }
  }
}

@media (max-width: 768px) {
  .tool-card {
    padding: 20px;
    border-radius: 12px;
    
    .tool-card-header {
      margin-bottom: 14px;
      
      .tool-info {
        .tool-icon {
          font-size: 24px;
          margin-right: 12px;
          padding: 6px;
        }
        
        .tool-details {
          .tool-name {
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .tool-description {
            font-size: 13px;
          }
        }
      }
      
      .tool-actions {
        gap: 6px;
        margin-left: 8px;
        
        .favorite-btn {
          font-size: 18px;
          min-width: 32px;
          min-height: 32px;
          padding: 6px;
        }
      }
    }
    
    .tool-tags {
      gap: 6px;
      margin-bottom: 16px;
      margin-left: 50px; /* 移动端图标较小：24px + 12px + 12px + 2px */
      
      .tool-tag {
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 6px;
      }
    }
    
    .tool-footer {
      padding-top: 12px;
      
      .tool-category {
        font-size: 12px;
        padding: 3px 6px;
      }
      
      .arrow-icon {
        font-size: 14px;
        padding: 3px;
      }
    }
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: 16px;
    
    .tool-card-header {
      .tool-info {
        .tool-icon {
          font-size: 20px;
          padding: 4px;
          margin-right: 10px;
        }
        
        .tool-details {
          .tool-name {
            font-size: 15px;
          }
        }
      }
      
      .tool-actions {
        .favorite-btn {
          font-size: 16px;
          min-width: 28px;
          min-height: 28px;
          padding: 4px;
        }
      }
    }
    
    .tool-tags {
      margin-left: 42px; /* 小屏幕：20px + 8px + 10px + 4px */
    }
  }
}
</style>
