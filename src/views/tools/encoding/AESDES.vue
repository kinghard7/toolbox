<template>
  <ToolContainer 
    title="AES/DES 加密解密" 
    description="对称加密解密工具"
    :favorite="isFavorite"
    @toggle-favorite="toggleFavorite"
  >
    <div class="aes-des-tool">
      <div class="options-section">
        <div class="option-row">
          <el-radio-group v-model="algorithm">
            <el-radio-button label="AES">AES</el-radio-button>
            <el-radio-button label="DES">DES</el-radio-button>
          </el-radio-group>
          
          <el-radio-group v-model="mode">
            <el-radio-button label="encrypt">加密</el-radio-button>
            <el-radio-button label="decrypt">解密</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="key-section">
          <el-input
            v-model="secretKey"
            :placeholder="'请输入密钥...'"
            style="width: 300px;"
          />
        </div>
      </div>
      
      <div class="input-section">
        <h3>{{ mode === 'encrypt' ? '原始文本' : '加密文本' }}</h3>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          :placeholder="mode === 'encrypt' ? '请输入要加密的文本...' : '请输入要解密的文本...'"
          @input="processText"
        />
      </div>
      
      <div class="output-section">
        <h3>{{ mode === 'encrypt' ? '加密结果' : '解密结果' }}</h3>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="6"
          readonly
          placeholder="结果将显示在这里..."
        />
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <el-button @click="copyOutput" style="margin-top: 8px;">复制结果</el-button>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { useAppStore } from '@/stores/app'
import CryptoJS from 'crypto-js'

const appStore = useAppStore()
const inputText = ref('')
const outputText = ref('')
const secretKey = ref('')
const algorithm = ref('AES')
const mode = ref('encrypt')
const errorMessage = ref('')

const isFavorite = computed(() => appStore.favorites.includes('aes-des'))
const toggleFavorite = () => appStore.toggleFavorite('aes-des')

const processText = () => {
  errorMessage.value = ''
  
  if (!inputText.value || !secretKey.value) {
    outputText.value = ''
    return
  }
  
  try {
    if (mode.value === 'encrypt') {
      if (algorithm.value === 'AES') {
        outputText.value = CryptoJS.AES.encrypt(inputText.value, secretKey.value).toString()
      } else {
        outputText.value = CryptoJS.DES.encrypt(inputText.value, secretKey.value).toString()
      }
    } else {
      if (algorithm.value === 'AES') {
        const bytes = CryptoJS.AES.decrypt(inputText.value, secretKey.value)
        outputText.value = bytes.toString(CryptoJS.enc.Utf8)
      } else {
        const bytes = CryptoJS.DES.decrypt(inputText.value, secretKey.value)
        outputText.value = bytes.toString(CryptoJS.enc.Utf8)
      }
    }
  } catch (error) {
    errorMessage.value = `${mode.value === 'encrypt' ? '加密' : '解密'}失败: ${error instanceof Error ? error.message : '未知错误'}`
    outputText.value = ''
  }
}

watch([algorithm, mode, secretKey], () => {
  processText()
})

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
.aes-des-tool {
  .options-section {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--el-bg-color-page);
    border-radius: 8px;
    
    .option-row {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }
    
    .key-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
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
  
  .error {
    color: var(--el-color-danger);
    margin-top: 8px;
    font-size: 14px;
  }
}
</style>
