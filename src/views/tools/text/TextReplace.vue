<template>
  <ToolContainer title="文本替换" description="文本查找和替换工具">
    <div class="text-replace-tool">
      <div class="input-section">
        <div class="input-header">
          <h3>原始文本</h3>
          <div class="input-actions">
            <el-button size="small" @click="clearText">清空</el-button>
            <el-button size="small" @click="pasteText">粘贴</el-button>
          </div>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          placeholder="请输入要处理的文本..."
          @input="performReplace"
        />
      </div>

      <div class="replace-section">
        <div class="replace-inputs">
          <div class="search-input">
            <h4>查找内容</h4>
            <el-input
              v-model="searchText"
              placeholder="请输入要查找的文本..."
              @input="performReplace"
            />
          </div>
          <div class="replace-input">
            <h4>替换为</h4>
            <el-input
              v-model="replaceText"
              placeholder="请输入替换的文本..."
              @input="performReplace"
            />
          </div>
        </div>

        <div class="options-section">
          <h4>替换选项</h4>
          <div class="options-grid">
            <el-checkbox v-model="useRegex" @change="performReplace">正则表达式</el-checkbox>
            <el-checkbox v-model="caseSensitive" @change="performReplace" :disabled="useRegex">区分大小写</el-checkbox>
            <el-checkbox v-model="wholeWord" @change="performReplace" :disabled="useRegex">全词匹配</el-checkbox>
            <el-checkbox v-model="multiline" @change="performReplace" :disabled="!useRegex">多行模式</el-checkbox>
            <el-checkbox v-model="global" @change="performReplace" :disabled="!useRegex">全局替换</el-checkbox>
          </div>
        </div>

        <div class="quick-actions">
          <h4>快捷操作</h4>
          <div class="quick-buttons">
            <el-button size="small" @click="removeSpaces">去除空格</el-button>
            <el-button size="small" @click="removeLineBreaks">去除换行</el-button>
            <el-button size="small" @click="removeNumbers">去除数字</el-button>
            <el-button size="small" @click="removePunctuation">去除标点</el-button>
            <el-button size="small" @click="removeEmptyLines">去除空行</el-button>
            <el-button size="small" @click="trimLines">修剪行首尾</el-button>
          </div>
        </div>
      </div>

      <div class="output-section">
        <div class="output-header">
          <h3>替换结果</h3>
          <div class="output-stats" v-if="stats.matches > 0">
            <span class="stats-item">找到 {{ stats.matches }} 处匹配</span>
            <span class="stats-item">已替换 {{ stats.replacements }} 处</span>
          </div>
          <div class="output-actions">
            <el-button size="small" @click="copyResult" :disabled="!outputText">复制</el-button>
            <el-button size="small" @click="downloadResult" :disabled="!outputText">下载</el-button>
            <el-button size="small" @click="undoReplace" :disabled="!canUndo">撤销</el-button>
          </div>
        </div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="8"
          readonly
          placeholder="替换结果将显示在这里..."
        />
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      </div>

      <div class="matches-section" v-if="matches.length > 0 && !useRegex">
        <h4>匹配详情 ({{ matches.length }} 个)</h4>
        <div class="matches-list">
          <div v-for="(match, index) in matches.slice(0, 50)" :key="index" class="match-item">
            <div class="match-info">
              <span class="match-index">{{ index + 1 }}</span>
              <span class="match-position">位置: {{ match.start }}-{{ match.end }}</span>
              <span class="match-line">行: {{ match.line }}</span>
            </div>
            <div class="match-context">
              <span class="before">{{ match.before }}</span>
              <span class="matched">{{ match.matched }}</span>
              <span class="after">{{ match.after }}</span>
            </div>
          </div>
          <div v-if="matches.length > 50" class="more-matches">
            还有 {{ matches.length - 50 }} 个匹配未显示...
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface MatchInfo {
  start: number
  end: number
  line: number
  matched: string
  before: string
  after: string
}

interface Stats {
  matches: number
  replacements: number
}

const inputText = ref('')
const searchText = ref('')
const replaceText = ref('')
const outputText = ref('')
const errorMessage = ref('')

const useRegex = ref(false)
const caseSensitive = ref(false)
const wholeWord = ref(false)
const multiline = ref(false)
const global = ref(true)

const matches = ref<MatchInfo[]>([])
const stats = reactive<Stats>({
  matches: 0,
  replacements: 0
})

const history = ref<string[]>([])
const canUndo = ref(false)

// 执行替换
const performReplace = () => {
  errorMessage.value = ''
  matches.value = []
  stats.matches = 0
  stats.replacements = 0

  if (!inputText.value || !searchText.value) {
    outputText.value = inputText.value
    return
  }

  try {
    if (useRegex.value) {
      performRegexReplace()
    } else {
      performSimpleReplace()
    }
    
    // 保存历史记录
    if (outputText.value !== inputText.value) {
      history.value.push(inputText.value)
      if (history.value.length > 10) {
        history.value.shift()
      }
      canUndo.value = true
    }
  } catch (error) {
    errorMessage.value = '替换失败: ' + (error as Error).message
    outputText.value = inputText.value
  }
}

// 正则表达式替换
const performRegexReplace = () => {
  let flags = ''
  if (!caseSensitive.value) flags += 'i'
  if (global.value) flags += 'g'
  if (multiline.value) flags += 'm'

  const regex = new RegExp(searchText.value, flags)
  const originalMatches = inputText.value.match(regex)
  
  if (originalMatches) {
    stats.matches = originalMatches.length
    stats.replacements = originalMatches.length
  }

  outputText.value = inputText.value.replace(regex, replaceText.value)
}

// 简单文本替换
const performSimpleReplace = () => {
  const text = inputText.value
  let searchPattern = searchText.value

  // 处理全词匹配
  if (wholeWord.value) {
    searchPattern = `\\b${escapeRegex(searchText.value)}\\b`
  } else {
    searchPattern = escapeRegex(searchText.value)
  }

  let flags = 'g'
  if (!caseSensitive.value) flags += 'i'

  const regex = new RegExp(searchPattern, flags)
  
  // 查找所有匹配
  let match
  const allMatches: MatchInfo[] = []
  
  while ((match = regex.exec(text)) !== null) {
    const start = match.index
    const end = start + match[0].length
    const line = text.substring(0, start).split('\n').length
    
    // 获取上下文
    const contextLength = 20
    const before = text.substring(Math.max(0, start - contextLength), start)
    const after = text.substring(end, Math.min(text.length, end + contextLength))
    
    allMatches.push({
      start,
      end,
      line,
      matched: match[0],
      before,
      after
    })
    
    // 防止无限循环
    if (!global.value) break
  }

  matches.value = allMatches
  stats.matches = allMatches.length
  stats.replacements = allMatches.length

  // 执行替换
  outputText.value = text.replace(regex, replaceText.value)
}

// 转义正则表达式特殊字符
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 快捷操作
const removeSpaces = () => {
  searchText.value = ' '
  replaceText.value = ''
  useRegex.value = false
  global.value = true
  performReplace()
}

const removeLineBreaks = () => {
  searchText.value = '\\n'
  replaceText.value = ' '
  useRegex.value = true
  global.value = true
  performReplace()
}

const removeNumbers = () => {
  searchText.value = '\\d'
  replaceText.value = ''
  useRegex.value = true
  global.value = true
  performReplace()
}

const removePunctuation = () => {
  searchText.value = '[.,;:!?。，；：！？]'
  replaceText.value = ''
  useRegex.value = true
  global.value = true
  performReplace()
}

const removeEmptyLines = () => {
  searchText.value = '^\\s*\\n'
  replaceText.value = ''
  useRegex.value = true
  global.value = true
  multiline.value = true
  performReplace()
}

const trimLines = () => {
  searchText.value = '^\\s+|\\s+$'
  replaceText.value = ''
  useRegex.value = true
  global.value = true
  multiline.value = true
  performReplace()
}

// 撤销操作
const undoReplace = () => {
  if (history.value.length > 0) {
    const previous = history.value.pop()!
    inputText.value = previous
    outputText.value = previous
    performReplace()
    
    if (history.value.length === 0) {
      canUndo.value = false
    }
  }
}

// 清空文本
const clearText = () => {
  inputText.value = ''
  outputText.value = ''
  searchText.value = ''
  replaceText.value = ''
  matches.value = []
  stats.matches = 0
  stats.replacements = 0
  history.value = []
  canUndo.value = false
  errorMessage.value = ''
}

// 粘贴文本
const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    performReplace()
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
  a.download = 'replaced_text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}
</script>

<style scoped lang="scss">
.text-replace-tool {
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
        gap: 16px;
        font-size: 14px;
        color: var(--el-text-color-regular);

        .stats-item {
          background-color: var(--el-fill-color-light);
          padding: 4px 8px;
          border-radius: 4px;
        }
      }

      .input-actions, .output-actions {
        display: flex;
        gap: 8px;
      }
    }

    .error {
      color: var(--el-color-danger);
      margin-top: 8px;
      font-size: 14px;
    }
  }

  .replace-section {
    margin-bottom: 24px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 6px;

    .replace-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .options-section, .quick-actions {
      margin-bottom: 16px;

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
      }

      .quick-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  .matches-section {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .matches-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;

      .match-item {
        padding: 8px 12px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:last-child {
          border-bottom: none;
        }

        .match-info {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
          font-size: 12px;
          color: var(--el-text-color-regular);

          .match-index {
            background-color: var(--el-color-primary);
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 600;
          }
        }

        .match-context {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;

          .before, .after {
            color: var(--el-text-color-regular);
          }

          .matched {
            background-color: var(--el-color-warning-light-8);
            color: var(--el-color-warning);
            font-weight: 600;
          }
        }
      }

      .more-matches {
        padding: 12px;
        text-align: center;
        color: var(--el-text-color-placeholder);
        font-style: italic;
      }
    }
  }
}

@media (max-width: 768px) {
  .text-replace-tool {
    .input-header, .output-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;

      .output-stats {
        flex-direction: column;
        gap: 4px !important;
      }
    }

    .replace-section {
      .replace-inputs {
        grid-template-columns: 1fr;
      }

      .options-grid, .quick-buttons {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}
</style>
