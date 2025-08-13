<template>
  <ToolContainer 
    title="MD5 哈希" 
    description="计算文本或文件的MD5哈希值"
    :favorite="isFavorite"
    @toggle-favorite="toggleFavorite"
  >
    <div class="md5-tool">
      <div class="input-section">
        <h3>输入文本</h3>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          :placeholder="'请输入要计算MD5的文本...'"
          @input="calculateMD5"
        />
      </div>
      
      <div class="output-section">
        <h3>MD5 哈希值</h3>
        <el-input
          v-model="outputText"
          readonly
          :placeholder="'MD5哈希值将显示在这里...'"
        />
        <el-button @click="copyOutput" style="margin-top: 8px;">复制结果</el-button>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { useAppStore } from '@/stores/app'
import CryptoJS from 'crypto-js'

const appStore = useAppStore()
const inputText = ref('')
const outputText = ref('')

const isFavorite = computed(() => appStore.favorites.includes('md5'))
const toggleFavorite = () => appStore.toggleFavorite('md5')

const calculateMD5 = () => {
  if (!inputText.value) {
    outputText.value = ''
    return
  }
  outputText.value = CryptoJS.MD5(inputText.value).toString()
}

const copyOutput = async () => {
  if (!outputText.value) {
    ElMessage.warning({ message: '输出内容为空' })
    return
  }
  
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success({ message: '已复制到剪贴板' })
  } catch (error) {
    ElMessage.error({ message: '复制失败' })
  }
}
</script>

<style scoped lang="scss">
.md5-tool {
  .input-section,
  .output-section {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
