<template>
  <ToolContainer title="文本去重" description="文本行去重和重复项分析工具">
    <div class="text-deduplicate-tool">
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
          placeholder="请输入要去重的文本，每行一个项目..."
          @input="deduplicateText"
        />
      </div>

      <div class="options-section">
        <h4>去重选项</h4>
        <div class="options-grid">
          <el-checkbox v-model="ignoreCase" @change="deduplicateText">忽略大小写</el-checkbox>
          <el-checkbox v-model="trimWhitespace" @change="deduplicateText">去除首尾空格</el-checkbox>
          <el-checkbox v-model="removeEmpty" @change="deduplicateText">删除空行</el-checkbox>
          <el-checkbox v-model="sortOutput" @change="deduplicateText">排序输出</el-checkbox>
          <el-checkbox v-model="preserveOrder" @change="deduplicateText" :disabled="sortOutput">保持原始顺序</el-checkbox>
          <el-checkbox v-model="showCount" @change="deduplicateText">显示出现次数</el-checkbox>
        </div>
      </div>

      <div class="results-section">
        <div class="output-section">
          <div class="output-header">
            <h3>去重结果 ({{ uniqueLines.length }} 行)</h3>
            <div class="output-actions">
              <el-button size="small" @click="copyResult" :disabled="!outputText">复制</el-button>
              <el-button size="small" @click="downloadResult" :disabled="!outputText">下载</el-button>
            </div>
          </div>
          <el-input
            v-model="outputText"
            type="textarea"
            :rows="8"
            readonly
            placeholder="去重结果将显示在这里..."
          />
        </div>

        <div class="duplicates-section" v-if="duplicates.length > 0">
          <div class="duplicates-header">
            <h3>重复项 ({{ duplicates.length }} 个)</h3>
            <div class="duplicates-actions">
              <el-button size="small" @click="copyDuplicates">复制重复项</el-button>
              <el-button size="small" @click="showDuplicatesOnly">仅显示重复项</el-button>
            </div>
          </div>
          <div class="duplicates-list">
            <div v-for="(item, index) in duplicates" :key="index" class="duplicate-item">
              <div class="duplicate-text">{{ item.text }}</div>
              <div class="duplicate-count">出现 {{ item.count }} 次</div>
              <div class="duplicate-lines">行号: {{ item.lineNumbers.join(', ') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section" v-if="inputText.trim()">
        <h4>统计信息</h4>
        <div class="stats-grid">
          <div class="stats-card">
            <div class="stats-label">原始行数</div>
            <div class="stats-value">{{ originalLineCount }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">唯一行数</div>
            <div class="stats-value">{{ uniqueLines.length }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">重复项数</div>
            <div class="stats-value">{{ duplicates.length }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">去重率</div>
            <div class="stats-value">{{ deduplicationRate }}%</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">删除行数</div>
            <div class="stats-value">{{ removedCount }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">空行数</div>
            <div class="stats-value">{{ emptyLineCount }}</div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface DuplicateItem {
  text: string
  count: number
  lineNumbers: number[]
}

const inputText = ref('')
const ignoreCase = ref(false)
const trimWhitespace = ref(true)
const removeEmpty = ref(true)
const sortOutput = ref(false)
const preserveOrder = ref(true)
const showCount = ref(false)

const originalLineCount = ref(0)
const uniqueLines = ref<string[]>([])
const duplicates = ref<DuplicateItem[]>([])
const emptyLineCount = ref(0)

const outputText = computed(() => {
  if (showCount.value) {
    return uniqueLines.value.map(line => {
      const duplicate = duplicates.value.find(d => 
        ignoreCase.value ? 
          d.text.toLowerCase() === line.toLowerCase() : 
          d.text === line
      )
      const count = duplicate ? duplicate.count : 1
      return `${line} (${count})`
    }).join('\n')
  }
  return uniqueLines.value.join('\n')
})

const deduplicationRate = computed(() => {
  if (originalLineCount.value === 0) return 0
  return Math.round((1 - uniqueLines.value.length / originalLineCount.value) * 100)
})

const removedCount = computed(() => {
  return originalLineCount.value - uniqueLines.value.length
})

// 去重处理
const deduplicateText = () => {
  if (!inputText.value.trim()) {
    uniqueLines.value = []
    duplicates.value = []
    originalLineCount.value = 0
    emptyLineCount.value = 0
    return
  }

  let lines = inputText.value.split('\n')
  originalLineCount.value = lines.length

  // 处理空行统计
  emptyLineCount.value = lines.filter(line => !line.trim()).length

  // 预处理
  if (trimWhitespace.value) {
    lines = lines.map(line => line.trim())
  }

  if (removeEmpty.value) {
    lines = lines.filter(line => line.length > 0)
  }

  // 统计重复项
  const lineCount = new Map<string, { count: number, lineNumbers: number[], originalText: string }>()
  
  lines.forEach((line, index) => {
    const key = ignoreCase.value ? line.toLowerCase() : line
    
    if (lineCount.has(key)) {
      const existing = lineCount.get(key)!
      existing.count++
      existing.lineNumbers.push(index + 1)
    } else {
      lineCount.set(key, {
        count: 1,
        lineNumbers: [index + 1],
        originalText: line
      })
    }
  })

  // 分离唯一行和重复项
  const uniqueSet = new Set<string>()
  const duplicateItems: DuplicateItem[] = []
  const resultLines: string[] = []

  for (const [key, data] of lineCount) {
    if (data.count > 1) {
      duplicateItems.push({
        text: data.originalText,
        count: data.count,
        lineNumbers: data.lineNumbers
      })
    }

    if (!uniqueSet.has(key)) {
      uniqueSet.add(key)
      resultLines.push(data.originalText)
    }
  }

  // 排序处理
  if (sortOutput.value) {
    resultLines.sort((a, b) => {
      const compareA = ignoreCase.value ? a.toLowerCase() : a
      const compareB = ignoreCase.value ? b.toLowerCase() : b
      return compareA.localeCompare(compareB)
    })
  } else if (!preserveOrder.value) {
    // 如果不保持原始顺序且不排序，按首次出现顺序
    const orderMap = new Map<string, number>()
    lines.forEach((line, index) => {
      const key = ignoreCase.value ? line.toLowerCase() : line
      if (!orderMap.has(key)) {
        orderMap.set(key, index)
      }
    })
    
    resultLines.sort((a, b) => {
      const keyA = ignoreCase.value ? a.toLowerCase() : a
      const keyB = ignoreCase.value ? b.toLowerCase() : b
      return (orderMap.get(keyA) || 0) - (orderMap.get(keyB) || 0)
    })
  }

  uniqueLines.value = resultLines
  duplicates.value = duplicateItems.sort((a, b) => b.count - a.count)
}

// 仅显示重复项
const showDuplicatesOnly = () => {
  if (duplicates.value.length === 0) {
    ElMessage.warning('没有重复项')
    return
  }

  uniqueLines.value = duplicates.value.map(item => item.text)
  ElMessage.success('已切换到仅显示重复项')
}

// 复制重复项
const copyDuplicates = async () => {
  if (duplicates.value.length === 0) {
    ElMessage.warning('没有重复项可复制')
    return
  }

  const duplicatesText = duplicates.value.map(item => 
    `${item.text} (出现${item.count}次)`
  ).join('\n')

  try {
    await navigator.clipboard.writeText(duplicatesText)
    ElMessage.success('重复项已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空文本
const clearText = () => {
  inputText.value = ''
  uniqueLines.value = []
  duplicates.value = []
  originalLineCount.value = 0
  emptyLineCount.value = 0
}

// 粘贴文本
const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    deduplicateText()
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
  a.download = 'deduplicated_text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}
</script>

<style scoped lang="scss">
.text-deduplicate-tool {
  .input-section {
    margin-bottom: 24px;

    .input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .input-actions {
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
  }

  .results-section {
    margin-bottom: 24px;

    .output-section, .duplicates-section {
      margin-bottom: 24px;

      .output-header, .duplicates-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .output-actions, .duplicates-actions {
          display: flex;
          gap: 8px;
        }
      }

      .duplicates-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;

        .duplicate-item {
          padding: 12px;
          border-bottom: 1px solid var(--el-border-color-lighter);

          &:last-child {
            border-bottom: none;
          }

          .duplicate-text {
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--el-text-color-primary);
          }

          .duplicate-count {
            font-size: 14px;
            color: var(--el-color-warning);
            margin-bottom: 2px;
          }

          .duplicate-lines {
            font-size: 12px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }

  .stats-section {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;

      .stats-card {
        padding: 12px;
        background-color: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 6px;
        text-align: center;

        .stats-label {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-bottom: 4px;
        }

        .stats-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .text-deduplicate-tool {
    .input-header, .output-header, .duplicates-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;
    }

    .options-section .options-grid {
      flex-direction: column;
      align-items: flex-start;
    }

    .stats-section .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
