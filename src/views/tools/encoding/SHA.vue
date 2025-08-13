<template>
  <ToolContainer 
    title="SHA 哈希" 
    description="计算SHA1/SHA256/SHA512哈希值"
    :favorite="isFavorite"
    @toggle-favorite="toggleFavorite"
  >
    <div class="sha-tool">
      <div class="options-section">
        <el-radio-group v-model="shaType" @change="calculateSHA">
          <el-radio-button label="SHA1">SHA1</el-radio-button>
          <el-radio-button label="SHA256">SHA256</el-radio-button>
          <el-radio-button label="SHA512">SHA512</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="input-section">
        <h3>输入文本</h3>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          :placeholder="'请输入要计算SHA哈希的文本...'"
          @input="calculateSHA"
        />
      </div>
      
      <div class="output-section">
        <h3>{{ shaType }} 哈希值</h3>
        <el-input
          v-model="outputText"
          readonly
          :placeholder="'SHA哈希值将显示在这里...'"
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
const shaType = ref('SHA256')

const isFavorite = computed(() => appStore.favorites.includes('sha'))
const toggleFavorite = () => appStore.toggleFavorite('sha')

const calculateSHA = () => {
  if (!inputText.value) {
    outputText.value = ''
    return
  }
  
  switch (shaType.value) {
    case 'SHA1':
      outputText.value = CryptoJS.SHA1(inputText.value).toString()
      break
    case 'SHA256':
      outputText.value = CryptoJS.SHA256(inputText.value).toString()
      break
    case 'SHA512':
      outputText.value = CryptoJS.SHA512(inputText.value).toString()
      break
  }
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
.sha-tool {
  .options-section {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--el-bg-color-page);
    border-radius: 8px;
  }
  
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
