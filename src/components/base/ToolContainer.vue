<template>
  <div class="tool-container">
    <!-- 工具头部 -->
    <div class="tool-header">
      <div class="tool-title-section">
        <h1 class="tool-title">{{ title }}</h1>
        <p v-if="description" class="tool-description">{{ description }}</p>
      </div>
      
      <div class="tool-header-actions">
        <slot name="header-actions" />
      </div>
    </div>
    
    <!-- 工具内容 -->
    <div class="tool-content">
      <slot />
    </div>
    
    <!-- 工具底部操作 -->
    <div v-if="$slots.footer" class="tool-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
defineSlots<{
  default: () => any
  'header-actions': () => any
  footer: () => any
}>()
</script>

<style lang="scss" scoped>
.tool-container {
  min-height: 100%;
  background: var(--el-bg-color-page);
}

.tool-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  
  .tool-title-section {
    flex: 1;
    min-width: 0;
    
    .tool-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    
    .tool-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
      line-height: 1.5;
    }
  }
  
  .tool-header-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.tool-content {
  padding: 24px;
}

.tool-footer {
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  padding: 16px 24px;
}

@media (max-width: 768px) {
  .tool-header {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    
    .tool-title-section {
      .tool-title {
        font-size: 20px;
      }
    }
    
    .tool-header-actions {
      justify-content: flex-end;
    }
  }
  
  .tool-content {
    padding: 16px;
  }
  
  .tool-footer {
    padding: 12px 16px;
  }
}
</style>
