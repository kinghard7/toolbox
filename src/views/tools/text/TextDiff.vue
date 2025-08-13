<template>
  <ToolContainer title="文本对比" description="文本差异对比和分析工具">
    <div class="text-diff-tool">
      <div class="input-sections">
        <div class="input-section">
          <div class="input-header">
            <h3>文本A</h3>
            <div class="input-actions">
              <el-button size="small" @click="clearTextA">清空</el-button>
              <el-button size="small" @click="pasteTextA">粘贴</el-button>
            </div>
          </div>
          <el-input
            v-model="textA"
            type="textarea"
            :rows="8"
            placeholder="请输入第一个文本..."
            @input="compareTexts"
          />
        </div>

        <div class="input-section">
          <div class="input-header">
            <h3>文本B</h3>
            <div class="input-actions">
              <el-button size="small" @click="clearTextB">清空</el-button>
              <el-button size="small" @click="pasteTextB">粘贴</el-button>
            </div>
          </div>
          <el-input
            v-model="textB"
            type="textarea"
            :rows="8"
            placeholder="请输入第二个文本..."
            @input="compareTexts"
          />
        </div>
      </div>

      <div class="options-section">
        <h4>对比选项</h4>
        <div class="options-grid">
          <el-checkbox v-model="ignoreCase" @change="compareTexts">忽略大小写</el-checkbox>
          <el-checkbox v-model="ignoreWhitespace" @change="compareTexts">忽略空白字符</el-checkbox>
          <el-checkbox v-model="ignoreEmptyLines" @change="compareTexts">忽略空行</el-checkbox>
          <el-radio-group v-model="compareMode" @change="compareTexts">
            <el-radio value="character">字符级对比</el-radio>
            <el-radio value="word">单词级对比</el-radio>
            <el-radio value="line">行级对比</el-radio>
          </el-radio-group>
        </div>
      </div>

      <div class="stats-section" v-if="textA.trim() || textB.trim()">
        <h4>对比统计</h4>
        <div class="stats-grid">
          <div class="stats-card">
            <div class="stats-label">相同部分</div>
            <div class="stats-value same">{{ stats.same }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">差异部分</div>
            <div class="stats-value different">{{ stats.different }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">仅在A中</div>
            <div class="stats-value only-a">{{ stats.onlyInA }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">仅在B中</div>
            <div class="stats-value only-b">{{ stats.onlyInB }}</div>
          </div>
          <div class="stats-card">
            <div class="stats-label">相似度</div>
            <div class="stats-value similarity">{{ similarity }}%</div>
          </div>
        </div>
      </div>

      <div class="result-section" v-if="diffResult.length > 0">
        <div class="result-header">
          <h3>对比结果</h3>
          <div class="result-actions">
            <el-button size="small" @click="exportDiff">导出差异</el-button>
            <el-button size="small" @click="copyDiffReport">复制报告</el-button>
          </div>
        </div>

        <div class="diff-display">
          <div class="diff-legend">
            <span class="legend-item same">相同</span>
            <span class="legend-item added">新增</span>
            <span class="legend-item deleted">删除</span>
            <span class="legend-item modified">修改</span>
          </div>

          <div class="diff-content">
            <div v-for="(chunk, index) in diffResult" :key="index" class="diff-chunk" :class="chunk.type">
              <div class="chunk-header" v-if="chunk.type !== 'same' || showSameContent">
                <span class="chunk-type">{{ getChunkTypeLabel(chunk.type) }}</span>
                <span class="chunk-position">{{ getChunkPosition(chunk) }}</span>
              </div>
              <div class="chunk-content" v-if="chunk.type !== 'same' || showSameContent">
                <div v-if="chunk.type === 'modified'" class="modified-content">
                  <div class="old-content">
                    <span class="content-label">原内容:</span>
                    <pre>{{ chunk.oldValue }}</pre>
                  </div>
                  <div class="new-content">
                    <span class="content-label">新内容:</span>
                    <pre>{{ chunk.newValue }}</pre>
                  </div>
                </div>
                <div v-else class="single-content">
                  <pre>{{ chunk.value }}</pre>
                </div>
              </div>
            </div>
          </div>

          <div class="diff-controls">
            <el-checkbox v-model="showSameContent" @change="toggleSameContent">显示相同内容</el-checkbox>
            <el-button size="small" @click="jumpToNextDiff">下一处差异</el-button>
            <el-button size="small" @click="jumpToPrevDiff">上一处差异</el-button>
          </div>
        </div>
      </div>

      <div class="no-diff" v-if="textA.trim() && textB.trim() && diffResult.length === 0">
        <el-result icon="success" title="文本完全相同" sub-title="两个文本没有任何差异">
        </el-result>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface DiffChunk {
  type: 'same' | 'added' | 'deleted' | 'modified'
  value?: string
  oldValue?: string
  newValue?: string
  positionA?: number
  positionB?: number
  lineA?: number
  lineB?: number
}

interface DiffStats {
  same: number
  different: number
  onlyInA: number
  onlyInB: number
}

const textA = ref('')
const textB = ref('')
const ignoreCase = ref(false)
const ignoreWhitespace = ref(false)
const ignoreEmptyLines = ref(false)
const compareMode = ref('line')
const showSameContent = ref(false)

const diffResult = ref<DiffChunk[]>([])
const stats = reactive<DiffStats>({
  same: 0,
  different: 0,
  onlyInA: 0,
  onlyInB: 0
})

const similarity = computed(() => {
  const total = stats.same + stats.different + stats.onlyInA + stats.onlyInB
  if (total === 0) return 100
  return Math.round((stats.same / total) * 100)
})

// 文本预处理
const preprocessText = (text: string): string => {
  let processed = text

  if (ignoreCase.value) {
    processed = processed.toLowerCase()
  }

  if (ignoreWhitespace.value) {
    processed = processed.replace(/\s+/g, ' ').trim()
  }

  if (ignoreEmptyLines.value) {
    processed = processed.split('\n').filter(line => line.trim()).join('\n')
  }

  return processed
}

// 对比文本
const compareTexts = () => {
  if (!textA.value.trim() && !textB.value.trim()) {
    diffResult.value = []
    resetStats()
    return
  }

  const processedA = preprocessText(textA.value)
  const processedB = preprocessText(textB.value)

  switch (compareMode.value) {
    case 'character':
      compareCharacters(processedA, processedB)
      break
    case 'word':
      compareWords(processedA, processedB)
      break
    case 'line':
      compareLines(processedA, processedB)
      break
  }

  calculateStats()
}

// 字符级对比
const compareCharacters = (textA: string, textB: string) => {
  const result: DiffChunk[] = []
  const lenA = textA.length
  const lenB = textB.length
  const dp: number[][] = Array(lenA + 1).fill(null).map(() => Array(lenB + 1).fill(0))

  // 计算LCS
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      if (textA[i - 1] === textB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // 回溯构建差异
  let i = lenA, j = lenB
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && textA[i - 1] === textB[j - 1]) {
      result.unshift({
        type: 'same',
        value: textA[i - 1],
        positionA: i - 1,
        positionB: j - 1
      })
      i--
      j--
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      result.unshift({
        type: 'deleted',
        value: textA[i - 1],
        positionA: i - 1
      })
      i--
    } else {
      result.unshift({
        type: 'added',
        value: textB[j - 1],
        positionB: j - 1
      })
      j--
    }
  }

  diffResult.value = mergeConsecutiveChunks(result)
}

// 单词级对比
const compareWords = (textA: string, textB: string) => {
  const wordsA = textA.split(/\s+/).filter(w => w)
  const wordsB = textB.split(/\s+/).filter(w => w)
  
  const result = diffArrays(wordsA, wordsB)
  diffResult.value = result.map(chunk => ({
    ...chunk,
    value: Array.isArray(chunk.value) ? chunk.value.join(' ') : chunk.value
  }))
}

// 行级对比
const compareLines = (textA: string, textB: string) => {
  const linesA = textA.split('\n')
  const linesB = textB.split('\n')
  
  const result = diffArrays(linesA, linesB)
  diffResult.value = result.map((chunk, index) => ({
    ...chunk,
    lineA: chunk.type !== 'added' ? getLineNumber(linesA, index) : undefined,
    lineB: chunk.type !== 'deleted' ? getLineNumber(linesB, index) : undefined
  }))
}

// 通用数组差异算法
const diffArrays = (arrayA: string[], arrayB: string[]): DiffChunk[] => {
  const result: DiffChunk[] = []
  const lenA = arrayA.length
  const lenB = arrayB.length
  const dp: number[][] = Array(lenA + 1).fill(null).map(() => Array(lenB + 1).fill(0))

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      if (arrayA[i - 1] === arrayB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  let i = lenA, j = lenB
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && arrayA[i - 1] === arrayB[j - 1]) {
      result.unshift({
        type: 'same',
        value: arrayA[i - 1]
      })
      i--
      j--
    } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
      result.unshift({
        type: 'deleted',
        value: arrayA[i - 1]
      })
      i--
    } else {
      result.unshift({
        type: 'added',
        value: arrayB[j - 1]
      })
      j--
    }
  }

  return result
}

// 合并连续的相同类型块
const mergeConsecutiveChunks = (chunks: DiffChunk[]): DiffChunk[] => {
  const merged: DiffChunk[] = []
  let current: DiffChunk | null = null

  for (const chunk of chunks) {
    if (current && current.type === chunk.type && chunk.type !== 'modified') {
      current.value += chunk.value
    } else {
      if (current) merged.push(current)
      current = { ...chunk }
    }
  }

  if (current) merged.push(current)
  return merged
}

// 获取行号
const getLineNumber = (lines: string[], index: number): number => {
  return Math.min(index + 1, lines.length)
}

// 计算统计信息
const calculateStats = () => {
  resetStats()
  
  diffResult.value.forEach(chunk => {
    switch (chunk.type) {
      case 'same':
        stats.same++
        break
      case 'modified':
        stats.different++
        break
      case 'added':
        stats.onlyInB++
        break
      case 'deleted':
        stats.onlyInA++
        break
    }
  })
}

// 重置统计
const resetStats = () => {
  stats.same = 0
  stats.different = 0
  stats.onlyInA = 0
  stats.onlyInB = 0
}

// 获取块类型标签
const getChunkTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    same: '相同',
    added: '新增',
    deleted: '删除',
    modified: '修改'
  }
  return labels[type] || type
}

// 获取块位置信息
const getChunkPosition = (chunk: DiffChunk): string => {
  if (compareMode.value === 'line') {
    return `行 ${chunk.lineA || '?'} - ${chunk.lineB || '?'}`
  }
  return `位置 ${chunk.positionA || '?'} - ${chunk.positionB || '?'}`
}

// 切换显示相同内容
const toggleSameContent = () => {
  // 重新渲染差异显示
}

// 跳转到下一处差异
const jumpToNextDiff = () => {
  // 实现跳转逻辑
  ElMessage.info('跳转到下一处差异')
}

// 跳转到上一处差异
const jumpToPrevDiff = () => {
  // 实现跳转逻辑
  ElMessage.info('跳转到上一处差异')
}

// 清空文本
const clearTextA = () => {
  textA.value = ''
  compareTexts()
}

const clearTextB = () => {
  textB.value = ''
  compareTexts()
}

// 粘贴文本
const pasteTextA = async () => {
  try {
    const text = await navigator.clipboard.readText()
    textA.value = text
    compareTexts()
    ElMessage.success('文本A已粘贴')
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

const pasteTextB = async () => {
  try {
    const text = await navigator.clipboard.readText()
    textB.value = text
    compareTexts()
    ElMessage.success('文本B已粘贴')
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 导出差异
const exportDiff = () => {
  const diffReport = generateDiffReport()
  const blob = new Blob([diffReport], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'text_diff_report.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('差异报告已下载')
}

// 复制差异报告
const copyDiffReport = async () => {
  const diffReport = generateDiffReport()
  try {
    await navigator.clipboard.writeText(diffReport)
    ElMessage.success('差异报告已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 生成差异报告
const generateDiffReport = (): string => {
  const lines = [
    '文本差异对比报告',
    '==================',
    '',
    `对比模式: ${compareMode.value}`,
    `相似度: ${similarity.value}%`,
    '',
    '统计信息:',
    `- 相同部分: ${stats.same}`,
    `- 差异部分: ${stats.different}`,
    `- 仅在文本A中: ${stats.onlyInA}`,
    `- 仅在文本B中: ${stats.onlyInB}`,
    '',
    '差异详情:',
    '--------'
  ]

  diffResult.value.forEach((chunk, index) => {
    if (chunk.type !== 'same') {
      lines.push(`${index + 1}. ${getChunkTypeLabel(chunk.type)}`)
      if (chunk.type === 'modified') {
        lines.push(`   原内容: ${chunk.oldValue}`)
        lines.push(`   新内容: ${chunk.newValue}`)
      } else {
        lines.push(`   内容: ${chunk.value}`)
      }
      lines.push('')
    }
  })

  return lines.join('\n')
}
</script>

<style scoped lang="scss">
.text-diff-tool {
  .input-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;

    .input-section {
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
    margin-bottom: 24px;

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

          &.same { color: var(--el-color-success); }
          &.different { color: var(--el-color-warning); }
          &.only-a { color: var(--el-color-danger); }
          &.only-b { color: var(--el-color-info); }
          &.similarity { color: var(--el-color-primary); }
        }
      }
    }
  }

  .result-section {
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .result-actions {
        display: flex;
        gap: 8px;
      }
    }

    .diff-display {
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      overflow: hidden;

      .diff-legend {
        display: flex;
        gap: 16px;
        padding: 12px 16px;
        background-color: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color);

        .legend-item {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 3px;

          &.same { background-color: var(--el-color-success-light-8); color: var(--el-color-success); }
          &.added { background-color: var(--el-color-info-light-8); color: var(--el-color-info); }
          &.deleted { background-color: var(--el-color-danger-light-8); color: var(--el-color-danger); }
          &.modified { background-color: var(--el-color-warning-light-8); color: var(--el-color-warning); }
        }
      }

      .diff-content {
        max-height: 500px;
        overflow-y: auto;

        .diff-chunk {
          border-bottom: 1px solid var(--el-border-color-lighter);

          &:last-child {
            border-bottom: none;
          }

          &.same {
            background-color: var(--el-color-success-light-9);
          }

          &.added {
            background-color: var(--el-color-info-light-9);
          }

          &.deleted {
            background-color: var(--el-color-danger-light-9);
          }

          &.modified {
            background-color: var(--el-color-warning-light-9);
          }

          .chunk-header {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background-color: rgba(0, 0, 0, 0.05);
            font-size: 12px;

            .chunk-type {
              font-weight: 600;
            }

            .chunk-position {
              color: var(--el-text-color-regular);
            }
          }

          .chunk-content {
            padding: 12px;

            .modified-content {
              .old-content, .new-content {
                margin-bottom: 8px;

                .content-label {
                  font-size: 12px;
                  font-weight: 600;
                  color: var(--el-text-color-regular);
                  display: block;
                  margin-bottom: 4px;
                }
              }

              .old-content {
                border-left: 3px solid var(--el-color-danger);
                padding-left: 8px;
              }

              .new-content {
                border-left: 3px solid var(--el-color-info);
                padding-left: 8px;
              }
            }

            pre {
              margin: 0;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 14px;
              white-space: pre-wrap;
              word-break: break-word;
            }
          }
        }
      }

      .diff-controls {
        padding: 12px 16px;
        background-color: var(--el-fill-color-light);
        border-top: 1px solid var(--el-border-color);
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }

  .no-diff {
    margin: 40px 0;
  }
}

@media (max-width: 768px) {
  .text-diff-tool {
    .input-sections {
      grid-template-columns: 1fr;
    }

    .input-header, .result-header {
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

    .diff-display {
      .diff-legend {
        flex-wrap: wrap;
        gap: 8px;
      }

      .diff-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  }
}
</style>
