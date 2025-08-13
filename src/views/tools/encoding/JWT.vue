<template>
  <ToolContainer 
    title="JWT 解析器" 
    description="JWT Token解析和验证"
    :favorite="isFavorite"
    @toggle-favorite="toggleFavorite"
  >
    <div class="jwt-tool">
      <div class="input-section">
        <h3>JWT Token</h3>
        <el-input
          v-model="inputToken"
          type="textarea"
          :rows="4"
          :placeholder="'请输入JWT Token...'"
          @input="parseJWT"
        />
      </div>
      
      <div class="output-section">
        <h3>解析结果</h3>
        <div class="jwt-parts">
          <div class="part">
            <h4>Header</h4>
            <pre>{{ headerText }}</pre>
          </div>
          <div class="part">
            <h4>Payload</h4>
            <pre>{{ payloadText }}</pre>
          </div>
          <div class="part">
            <h4>Signature</h4>
            <pre>{{ signatureText }}</pre>
          </div>
        </div>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const inputToken = ref('')
const headerText = ref('')
const payloadText = ref('')
const signatureText = ref('')
const errorMessage = ref('')

const isFavorite = computed(() => appStore.favorites.includes('jwt'))
const toggleFavorite = () => appStore.toggleFavorite('jwt')

const parseJWT = () => {
  errorMessage.value = ''
  headerText.value = ''
  payloadText.value = ''
  signatureText.value = ''
  
  if (!inputToken.value.trim()) return
  
  try {
    const parts = inputToken.value.split('.')
    if (parts.length !== 3) {
      throw new Error('无效的JWT格式')
    }
    
    // 解析 header
    const header = JSON.parse(atob(parts[0]!))
    headerText.value = JSON.stringify(header, null, 2)
    
    // 解析 payload
    const payload = JSON.parse(atob(parts[1]!))
    payloadText.value = JSON.stringify(payload, null, 2)
    
    // 显示 signature
    signatureText.value = parts[2]!
    
  } catch (error) {
    errorMessage.value = `解析失败: ${error instanceof Error ? error.message : '未知错误'}`
  }
}
</script>

<style scoped lang="scss">
.jwt-tool {
  .input-section,
  .output-section {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .jwt-parts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    
    .part {
      padding: 16px;
      background: var(--el-bg-color-page);
      border-radius: 8px;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
      
      pre {
        margin: 0;
        font-family: var(--el-font-family-mono);
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
  
  .error {
    color: var(--el-color-danger);
    margin-top: 12px;
  }
}
</style>
