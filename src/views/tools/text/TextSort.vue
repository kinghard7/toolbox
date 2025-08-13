<template>
  <ToolContainer title="文本排序" description="文本行排序和去重工具">
    <div class="text-sort-tool">
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
          placeholder="请输入要排序的文本，每行一个项目..."
          @input="sortText"
        />
      </div>

      <div class="options-section">
        <h4>排序选项</h4>
        <div class="options-grid">
          <el-select v-model="sortType" @change="sortText" style="width: 140px;">
            <el-option label="字母排序" value="alphabetical" />
            <el-option label="数字排序" value="numerical" />
            <el-option label="长度排序" value="length" />
            <el-option label="随机排序" value="random" />
            <el-option label="自然排序" value="natural" />
          </el-select>
          <el-select v-model="sortOrder" @change="sortText" style="width: 100px;">
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
          </el-select>
          <el-checkbox v-model="ignoreCase" @change="sortText">忽略大小写</el-checkbox>
          <el-checkbox v-model="removeDuplicates" @change="sortText">去除重复</el-checkbox>
          <el-checkbox v-model="removeEmpty" @change="sortText">去除空行</el-checkbox>
          <el-checkbox v-model="trimLines" @change="sortText">去除首尾空格</el-checkbox>
        </div>
      </div>

      <div class="output-section">
        <div class="output-header">
          <h3>排序结果 ({{ outputLines.length }} 行)</h3>
          <div class="output-actions">
            <el-button size="small" @click="copyResult" :disabled="!outputText">复制</el-button>
            <el-button size="small" @click="downloadResult" :disabled="!outputText">下载</el-button>
            <el-button size="small" @click="reverseResult" :disabled="!outputText">反转</el-button>
          </div>
        </div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="8"
          readonly
          placeholder="排序结果将显示在这里..."
        />
      </div>

      <div class="stats-section" v-if="inputText.trim()">
        <div class="stats-cards">
          <div class="stats-card">
            <div class="stats-label">原始行数</div>
            <div class="stats-value">{{ originalLineCount }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">排序后行数</div>
            <div class="stats-value">{{ outputLines.length }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">去除重复</div>
            <div class="stats-value">{{ duplicatesRemoved }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">去除空行</div>
            <div class="stats-value">{{ emptyLinesRemoved }}</div>
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

const inputText = ref('')
const sortType = ref('alphabetical')
const sortOrder = ref('asc')
const ignoreCase = ref(false)
const removeDuplicates = ref(false)
const removeEmpty = ref(true)
const trimLines = ref(true)

const originalLineCount = ref(0)
const duplicatesRemoved = ref(0)
const emptyLinesRemoved = ref(0)

const outputLines = ref<string[]>([])
const outputText = computed(() => outputLines.value.join('\n'))

// 排序文本
const sortText = () => {
  if (!inputText.value.trim()) {
    outputLines.value = []
    resetStats()
    return
  }

  let lines = inputText.value.split('\n')
  originalLineCount.value = lines.length

  // 处理选项
  if (trimLines.value) {
    lines = lines.map(line => line.trim())
  }

  let emptyRemoved = 0
  if (removeEmpty.value) {
    const beforeLength = lines.length
    lines = lines.filter(line => line.length > 0)
    emptyRemoved = beforeLength - lines.length
  }
  emptyLinesRemoved.value = emptyRemoved

  let duplicatesCount = 0
  if (removeDuplicates.value) {
    const beforeLength = lines.length
    const compareLines = ignoreCase.value ? lines.map(line => line.toLowerCase()) : lines
    const seen = new Set()
    lines = lines.filter((line, index) => {
      const compareLine = compareLines[index]
      if (seen.has(compareLine)) {
        return false
      }
      seen.add(compareLine)
      return true
    })
    duplicatesCount = beforeLength - lines.length
  }
  duplicatesRemoved.value = duplicatesCount

  // 排序
  let sortedLines = [...lines]
  
  switch (sortType.value) {
    case 'alphabetical':
      sortedLines.sort((a, b) => {
        const compareA = ignoreCase.value ? a.toLowerCase() : a
        const compareB = ignoreCase.value ? b.toLowerCase() : b
        return compareA.localeCompare(compareB)
      })
      break
      
    case 'numerical':
      sortedLines.sort((a, b) => {
        const numA = parseFloat(a) || 0
        const numB = parseFloat(b) || 0
        return numA - numB
      })
      break
      
    case 'length':
      sortedLines.sort((a, b) => a.length - b.length)
      break
      
    case 'random':
      for (let i = sortedLines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[sortedLines[i], sortedLines[j]] = [sortedLines[j], sortedLines[i]]
      }
      break
      
    case 'natural':
      sortedLines.sort((a, b) => {
        return naturalCompare(
          ignoreCase.value ? a.toLowerCase() : a,
          ignoreCase.value ? b.toLowerCase() : b
        )
      })
      break
  }

  if (sortOrder.value === 'desc' && sortType.value !== 'random') {
    sortedLines.reverse()
  }

  outputLines.value = sortedLines
}

// 自然排序比较函数
const naturalCompare = (a: string, b: string): number => {
  const regex = /(\d+)|(\D+)/g
  const aParts = a.match(regex) || []
  const bParts = b.match(regex) || []
  
  const maxLength = Math.max(aParts.length, bParts.length)
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || ''
    const bPart = bParts[i] || ''
    
    const aIsNum = /^\d+$/.test(aPart)
    const bIsNum = /^\d+$/.test(bPart)
    
    if (aIsNum && bIsNum) {
      const numA = parseInt(aPart, 10)
      const numB = parseInt(bPart, 10)
      if (numA !== numB) {
        return numA - numB
      }
    } else {
      const result = aPart.localeCompare(bPart)
      if (result !== 0) {
        return result
      }
    }
  }
  
  return 0
}

// 重置统计
const resetStats = () => {
  originalLineCount.value = 0
  duplicatesRemoved.value = 0
  emptyLinesRemoved.value = 0
}

// 清空文本
const clearText = () => {
  inputText.value = ''
  outputLines.value = []
  resetStats()
}

// 粘贴文本
const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    sortText()
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
  a.download = 'sorted_text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}

// 反转结果
const reverseResult = () => {
  if (outputLines.value.length === 0) return
  
  outputLines.value = [...outputLines.value].reverse()
}
</script>

<style scoped lang="scss">
.text-sort-tool {
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
  }

  .stats-section {
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  .text-sort-tool {
    .input-header, .output-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;
    }

    .options-section .options-grid {
      flex-direction: column;
      align-items: flex-start;
    }

    .stats-section .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
