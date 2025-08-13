<template>
  <ToolContainer title="文本清理" description="文本清理和格式化工具">
    <div class="text-clean-tool">
      <div class="input-section">
        <div class="input-header">
          <h3>输入文本</h3>
          <div class="input-actions">
            <el-button size="small" @click="clearText">清空</el-button>
            <el-button size="small" @click="pasteText">粘贴</el-button>
          </div>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          placeholder="请输入要清理的文本..."
          @input="cleanText"
        />
      </div>

      <div class="options-section">
        <div class="clean-options">
          <h4>清理选项</h4>
          <div class="options-grid">
            <el-checkbox v-model="options.trimSpaces" @change="cleanText">去除首尾空格</el-checkbox>
            <el-checkbox v-model="options.removeExtraSpaces" @change="cleanText">合并多余空格</el-checkbox>
            <el-checkbox v-model="options.removeEmptyLines" @change="cleanText">删除空行</el-checkbox>
            <el-checkbox v-model="options.removeExtraLineBreaks" @change="cleanText">合并多余换行</el-checkbox>
            <el-checkbox v-model="options.removeTabs" @change="cleanText">转换制表符</el-checkbox>
            <el-checkbox v-model="options.normalizeLineBreaks" @change="cleanText">统一换行符</el-checkbox>
          </div>
        </div>

        <div class="filter-options">
          <h4>字符过滤</h4>
          <div class="options-grid">
            <el-checkbox v-model="options.removeNumbers" @change="cleanText">删除数字</el-checkbox>
            <el-checkbox v-model="options.removePunctuation" @change="cleanText">删除标点符号</el-checkbox>
            <el-checkbox v-model="options.removeSpecialChars" @change="cleanText">删除特殊字符</el-checkbox>
            <el-checkbox v-model="options.removeEmojis" @change="cleanText">删除表情符号</el-checkbox>
            <el-checkbox v-model="options.removeUrls" @change="cleanText">删除URL链接</el-checkbox>
            <el-checkbox v-model="options.removeEmails" @change="cleanText">删除邮箱地址</el-checkbox>
          </div>
        </div>

        <div class="format-options">
          <h4>格式转换</h4>
          <div class="options-grid">
            <el-select v-model="options.caseTransform" @change="cleanText" style="width: 140px;">
              <el-option label="保持原样" value="none" />
              <el-option label="全部大写" value="upper" />
              <el-option label="全部小写" value="lower" />
              <el-option label="首字母大写" value="capitalize" />
              <el-option label="标题格式" value="title" />
            </el-select>
            <el-checkbox v-model="options.removeAccents" @change="cleanText">删除重音符号</el-checkbox>
            <el-checkbox v-model="options.convertFullWidth" @change="cleanText">全角转半角</el-checkbox>
          </div>
        </div>

        <div class="custom-options">
          <h4>自定义清理</h4>
          <div class="custom-inputs">
            <el-input
              v-model="customRemoveChars"
              placeholder="要删除的字符 (如: ,.;)"
              @input="cleanText"
              style="margin-bottom: 8px;"
            />
            <div class="replace-row">
              <el-input
                v-model="customReplaceFrom"
                placeholder="查找"
                @input="cleanText"
                style="flex: 1; margin-right: 8px;"
              />
              <el-input
                v-model="customReplaceTo"
                placeholder="替换为"
                @input="cleanText"
                style="flex: 1;"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="output-section">
        <div class="output-header">
          <h3>清理结果</h3>
          <div class="output-stats">
            <span class="stats-item">原始: {{ originalStats.chars }} 字符</span>
            <span class="stats-item">清理后: {{ cleanedStats.chars }} 字符</span>
            <span class="stats-item">减少: {{ reduction }}%</span>
          </div>
          <div class="output-actions">
            <el-button size="small" @click="copyResult" :disabled="!outputText">复制</el-button>
            <el-button size="small" @click="downloadResult" :disabled="!outputText">下载</el-button>
            <el-button size="small" @click="resetOptions">重置选项</el-button>
          </div>
        </div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="8"
          readonly
          placeholder="清理结果将显示在这里..."
        />
      </div>

      <div class="summary-section" v-if="inputText.trim()">
        <h4>清理摘要</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">行数变化:</span>
            <span class="value">{{ originalStats.lines }} → {{ cleanedStats.lines }}</span>
          </div>
          <div class="summary-item">
            <span class="label">单词数变化:</span>
            <span class="value">{{ originalStats.words }} → {{ cleanedStats.words }}</span>
          </div>
          <div class="summary-item">
            <span class="label">字符数变化:</span>
            <span class="value">{{ originalStats.chars }} → {{ cleanedStats.chars }}</span>
          </div>
          <div class="summary-item">
            <span class="label">大小变化:</span>
            <span class="value">{{ (originalStats.bytes / 1024).toFixed(1) }}KB → {{ (cleanedStats.bytes / 1024).toFixed(1) }}KB</span>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface CleanOptions {
  trimSpaces: boolean
  removeExtraSpaces: boolean
  removeEmptyLines: boolean
  removeExtraLineBreaks: boolean
  removeTabs: boolean
  normalizeLineBreaks: boolean
  removeNumbers: boolean
  removePunctuation: boolean
  removeSpecialChars: boolean
  removeEmojis: boolean
  removeUrls: boolean
  removeEmails: boolean
  caseTransform: string
  removeAccents: boolean
  convertFullWidth: boolean
}

interface TextStats {
  chars: number
  words: number
  lines: number
  bytes: number
}

const inputText = ref('')
const outputText = ref('')
const customRemoveChars = ref('')
const customReplaceFrom = ref('')
const customReplaceTo = ref('')

const options = reactive<CleanOptions>({
  trimSpaces: true,
  removeExtraSpaces: true,
  removeEmptyLines: false,
  removeExtraLineBreaks: false,
  removeTabs: true,
  normalizeLineBreaks: true,
  removeNumbers: false,
  removePunctuation: false,
  removeSpecialChars: false,
  removeEmojis: false,
  removeUrls: false,
  removeEmails: false,
  caseTransform: 'none',
  removeAccents: false,
  convertFullWidth: false
})

const originalStats = reactive<TextStats>({
  chars: 0,
  words: 0,
  lines: 0,
  bytes: 0
})

const cleanedStats = reactive<TextStats>({
  chars: 0,
  words: 0,
  lines: 0,
  bytes: 0
})

const reduction = computed(() => {
  if (originalStats.chars === 0) return 0
  return Math.round((1 - cleanedStats.chars / originalStats.chars) * 100)
})

// 计算文本统计
const calculateStats = (text: string): TextStats => {
  return {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    bytes: new Blob([text]).size
  }
}

// 清理文本
const cleanText = () => {
  if (!inputText.value) {
    outputText.value = ''
    Object.assign(originalStats, { chars: 0, words: 0, lines: 0, bytes: 0 })
    Object.assign(cleanedStats, { chars: 0, words: 0, lines: 0, bytes: 0 })
    return
  }

  let text = inputText.value

  // 计算原始统计
  Object.assign(originalStats, calculateStats(text))

  // 基础清理
  if (options.normalizeLineBreaks) {
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  }

  if (options.removeTabs) {
    text = text.replace(/\t/g, '  ')
  }

  if (options.trimSpaces) {
    text = text.split('\n').map(line => line.trim()).join('\n')
  }

  if (options.removeExtraSpaces) {
    text = text.replace(/[ ]{2,}/g, ' ')
  }

  if (options.removeEmptyLines) {
    text = text.split('\n').filter(line => line.trim().length > 0).join('\n')
  }

  if (options.removeExtraLineBreaks) {
    text = text.replace(/\n{3,}/g, '\n\n')
  }

  // 字符过滤
  if (options.removeNumbers) {
    text = text.replace(/\d/g, '')
  }

  if (options.removePunctuation) {
    text = text.replace(/[.,;:!?。，；：！？'"""""'']/g, '')
  }

  if (options.removeSpecialChars) {
    text = text.replace(/[^\w\s\u4e00-\u9fff]/g, '')
  }

  if (options.removeEmojis) {
    text = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
  }

  if (options.removeUrls) {
    text = text.replace(/https?:\/\/[^\s]+/g, '')
  }

  if (options.removeEmails) {
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
  }

  // 大小写转换
  switch (options.caseTransform) {
    case 'upper':
      text = text.toUpperCase()
      break
    case 'lower':
      text = text.toLowerCase()
      break
    case 'capitalize':
      text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      break
    case 'title':
      text = text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
      break
  }

  // 去除重音符号
  if (options.removeAccents) {
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  // 全角转半角
  if (options.convertFullWidth) {
    text = text.replace(/[\uff01-\uff5e]/g, (char) => 
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
    text = text.replace(/\u3000/g, ' ') // 全角空格转半角
  }

  // 自定义字符删除
  if (customRemoveChars.value) {
    const charsToRemove = customRemoveChars.value.split('').map(c => 
      c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('')
    const regex = new RegExp(`[${charsToRemove}]`, 'g')
    text = text.replace(regex, '')
  }

  // 自定义替换
  if (customReplaceFrom.value) {
    const from = customReplaceFrom.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const to = customReplaceTo.value || ''
    text = text.replace(new RegExp(from, 'g'), to)
  }

  // 最终清理多余空格和换行
  text = text.replace(/\n{3,}/g, '\n\n').trim()

  outputText.value = text

  // 计算清理后统计
  Object.assign(cleanedStats, calculateStats(text))
}

// 重置选项
const resetOptions = () => {
  Object.assign(options, {
    trimSpaces: true,
    removeExtraSpaces: true,
    removeEmptyLines: false,
    removeExtraLineBreaks: false,
    removeTabs: true,
    normalizeLineBreaks: true,
    removeNumbers: false,
    removePunctuation: false,
    removeSpecialChars: false,
    removeEmojis: false,
    removeUrls: false,
    removeEmails: false,
    caseTransform: 'none',
    removeAccents: false,
    convertFullWidth: false
  })
  customRemoveChars.value = ''
  customReplaceFrom.value = ''
  customReplaceTo.value = ''
  cleanText()
}

// 清空文本
const clearText = () => {
  inputText.value = ''
  outputText.value = ''
  Object.assign(originalStats, { chars: 0, words: 0, lines: 0, bytes: 0 })
  Object.assign(cleanedStats, { chars: 0, words: 0, lines: 0, bytes: 0 })
}

// 粘贴文本
const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    cleanText()
    ElMessage.success('文本已粘贴')
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 复制结果
const copyResult = async () => {
  if (!outputText.value) {
    ElMessage.warning('没有结果可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('结果已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载结果
const downloadResult = () => {
  if (!outputText.value) return

  const blob = new Blob([outputText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cleaned_text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}
</script>

<style scoped lang="scss">
.text-clean-tool {
  .input-section, .output-section {
    margin-bottom: 24px;

    .input-header, .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .output-stats {
        display: flex;
        gap: 12px;
        font-size: 14px;

        .stats-item {
          background-color: var(--el-fill-color-light);
          padding: 4px 8px;
          border-radius: 4px;
          color: var(--el-text-color-regular);
        }
      }

      .input-actions, .output-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .options-section {
    margin-bottom: 24px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 6px;

    .clean-options, .filter-options, .format-options, .custom-options {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .options-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .custom-inputs {
        .replace-row {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .summary-section {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;

      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        background-color: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 6px;

        .label {
          color: var(--el-text-color-regular);
          font-size: 14px;
        }

        .value {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .text-clean-tool {
    .input-header, .output-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;

      .output-stats {
        flex-direction: column;
        gap: 4px !important;
      }
    }

    .options-section {
      .options-grid {
        flex-direction: column;
        align-items: flex-start;
      }

      .custom-inputs .replace-row {
        flex-direction: column;
      }
    }

    .summary-section .summary-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
