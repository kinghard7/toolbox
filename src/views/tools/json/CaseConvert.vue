<template>
  <ToolContainer title="大小写转换" description="各种大小写格式转换">
    <div class="case-convert-tool">
      <div class="input-section">
        <h3>输入文本</h3>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="4"
          placeholder="请输入要转换的文本..."
          @input="convertAllCases"
        />
      </div>

      <div class="results-section">
        <div class="result-item">
          <div class="result-header">
            <span class="result-label">大写 (UPPERCASE)</span>
            <el-button size="small" @click="copyResult(upperCase)">复制</el-button>
          </div>
          <el-input v-model="upperCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">小写 (lowercase)</span>
            <el-button size="small" @click="copyResult(lowerCase)">复制</el-button>
          </div>
          <el-input v-model="lowerCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">标题格式 (Title Case)</span>
            <el-button size="small" @click="copyResult(titleCase)">复制</el-button>
          </div>
          <el-input v-model="titleCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">句子格式 (Sentence case)</span>
            <el-button size="small" @click="copyResult(sentenceCase)">复制</el-button>
          </div>
          <el-input v-model="sentenceCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">驼峰格式 (camelCase)</span>
            <el-button size="small" @click="copyResult(camelCase)">复制</el-button>
          </div>
          <el-input v-model="camelCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">帕斯卡格式 (PascalCase)</span>
            <el-button size="small" @click="copyResult(pascalCase)">复制</el-button>
          </div>
          <el-input v-model="pascalCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">下划线格式 (snake_case)</span>
            <el-button size="small" @click="copyResult(snakeCase)">复制</el-button>
          </div>
          <el-input v-model="snakeCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">烤肉串格式 (kebab-case)</span>
            <el-button size="small" @click="copyResult(kebabCase)">复制</el-button>
          </div>
          <el-input v-model="kebabCase" readonly />
        </div>

        <div class="result-item">
          <div class="result-header">
            <span class="result-label">常量格式 (CONSTANT_CASE)</span>
            <el-button size="small" @click="copyResult(constantCase)">复制</el-button>
          </div>
          <el-input v-model="constantCase" readonly />
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

const inputText = ref('')
const upperCase = ref('')
const lowerCase = ref('')
const titleCase = ref('')
const sentenceCase = ref('')
const camelCase = ref('')
const pascalCase = ref('')
const snakeCase = ref('')
const kebabCase = ref('')
const constantCase = ref('')

// 转换为标题格式
const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

// 转换为句子格式
const toSentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// 转换为驼峰格式
const toCamelCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
}

// 转换为帕斯卡格式
const toPascalCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase()
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
}

// 转换为下划线格式
const toSnakeCase = (str: string): string => {
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_')
    .replace(/^_+|_+$/g, '')
}

// 转换为烤肉串格式
const toKebabCase = (str: string): string => {
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-')
    .replace(/^-+|-+$/g, '')
}

// 转换为常量格式
const toConstantCase = (str: string): string => {
  return toSnakeCase(str).toUpperCase()
}

// 转换所有格式
const convertAllCases = () => {
  if (!inputText.value.trim()) {
    clearAllResults()
    return
  }

  const text = inputText.value.trim()
  upperCase.value = text.toUpperCase()
  lowerCase.value = text.toLowerCase()
  titleCase.value = toTitleCase(text)
  sentenceCase.value = toSentenceCase(text)
  camelCase.value = toCamelCase(text)
  pascalCase.value = toPascalCase(text)
  snakeCase.value = toSnakeCase(text)
  kebabCase.value = toKebabCase(text)
  constantCase.value = toConstantCase(text)
}

// 清空所有结果
const clearAllResults = () => {
  upperCase.value = ''
  lowerCase.value = ''
  titleCase.value = ''
  sentenceCase.value = ''
  camelCase.value = ''
  pascalCase.value = ''
  snakeCase.value = ''
  kebabCase.value = ''
  constantCase.value = ''
}

// 复制结果
const copyResult = async (text: string) => {
  if (!text) {
    ElMessage.warning('没有内容可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.case-convert-tool {
  .input-section {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .results-section {
    .result-item {
      margin-bottom: 16px;
      
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .result-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}
</style>
