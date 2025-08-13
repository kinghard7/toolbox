<template>
  <ToolContainer title="Diff 工具" description="文件和字符串差异对比工具">
    <div class="diff-tool">
      <div class="tool-header">
        <div class="diff-type-selector">
          <el-radio-group v-model="selectedDiffType" @change="handleDiffTypeChange">
            <el-radio-button label="text">文本对比</el-radio-button>
            <el-radio-button label="file">文件对比</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="compareDiff" :disabled="!canCompare">
            <el-icon><Document /></el-icon>
            对比
          </el-button>
          <el-button @click="clearDiff">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          <el-button @click="swapContent">
            <el-icon><Refresh /></el-icon>
            交换
          </el-button>
        </div>
      </div>

      <div class="diff-editor-section">
        <div class="input-section">
          <div class="left-panel">
            <div class="panel-header">
              <h3>原始内容</h3>
              <div class="panel-actions">
                <el-button size="small" @click="pasteLeft">粘贴</el-button>
                <el-button size="small" @click="loadSampleLeft">示例</el-button>
                <el-button size="small" @click="loadFileLeft" v-if="selectedDiffType === 'file'">文件</el-button>
              </div>
            </div>
            <el-input
              v-model="leftContent"
              type="textarea"
              :rows="15"
              :placeholder="getLeftPlaceholder()"
              class="diff-input left-input"
            />
            <div class="content-info">
              <span>字符数: {{ leftContent.length }}</span>
              <span>行数: {{ leftLineCount }}</span>
            </div>
          </div>

          <div class="right-panel">
            <div class="panel-header">
              <h3>对比内容</h3>
              <div class="panel-actions">
                <el-button size="small" @click="pasteRight">粘贴</el-button>
                <el-button size="small" @click="loadSampleRight">示例</el-button>
                <el-button size="small" @click="loadFileRight" v-if="selectedDiffType === 'file'">文件</el-button>
              </div>
            </div>
            <el-input
              v-model="rightContent"
              type="textarea"
              :rows="15"
              :placeholder="getRightPlaceholder()"
              class="diff-input right-input"
            />
            <div class="content-info">
              <span>字符数: {{ rightContent.length }}</span>
              <span>行数: {{ rightLineCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="diff-options-section">
        <el-card class="options-card">
          <template #header>
            <span>对比选项</span>
          </template>
          
          <div class="options-grid">
            <div class="option-item">
              <el-checkbox v-model="options.ignoreWhitespace">忽略空白差异</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.ignoreCase">忽略大小写</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.ignoreLineEndings">忽略行尾差异</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.showContext">显示上下文</el-checkbox>
            </div>
            <div class="option-item">
              <el-input-number
                v-model="options.contextLines"
                :min="0"
                :max="10"
                size="small"
                label="上下文行数"
                :disabled="!options.showContext"
              />
              <span class="option-label">上下文行数</span>
            </div>
            <div class="option-item">
              <el-select v-model="options.diffAlgorithm" size="small" placeholder="选择算法">
                <el-option label="Myers算法" value="myers" />
                <el-option label="Patience算法" value="patience" />
                <el-option label="Histogram算法" value="histogram" />
              </el-select>
              <span class="option-label">对比算法</span>
            </div>
          </div>
        </el-card>
      </div>

      <div class="diff-result-section" v-if="diffResult">
        <el-card class="result-card">
          <template #header>
            <span>对比结果</span>
          </template>
          
          <div class="result-summary">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">总行数:</span>
                <span class="summary-value">{{ diffResult.totalLines }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">相同行:</span>
                <span class="summary-value same">{{ diffResult.sameLines }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">新增行:</span>
                <span class="summary-value added">{{ diffResult.addedLines }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">删除行:</span>
                <span class="summary-value deleted">{{ diffResult.deletedLines }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">修改行:</span>
                <span class="summary-value modified">{{ diffResult.modifiedLines }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">相似度:</span>
                <span class="summary-value">{{ diffResult.similarity }}%</span>
              </div>
            </div>
          </div>

          <div class="diff-viewer">
            <div class="diff-header">
              <div class="diff-line-numbers">
                <span class="line-label">行号</span>
              </div>
              <div class="diff-content">
                <span class="content-label">内容</span>
              </div>
            </div>
            
            <div class="diff-lines">
              <div
                v-for="(line, index) in diffResult.lines"
                :key="index"
                class="diff-line"
                :class="getLineClass(line.type)"
              >
                <div class="line-number left-number">
                  {{ line.leftNumber || '-' }}
                </div>
                <div class="line-number right-number">
                  {{ line.rightNumber || '-' }}
                </div>
                <div class="line-content">
                  <span class="line-text">{{ line.content }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <el-button @click="exportDiff">导出差异</el-button>
            <el-button @click="copyDiff">复制差异</el-button>
            <el-button @click="downloadDiff">下载差异</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete, Refresh } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// 对比类型
type DiffType = 'text' | 'file'

// 对比选项
interface DiffOptions {
  ignoreWhitespace: boolean
  ignoreCase: boolean
  ignoreLineEndings: boolean
  showContext: boolean
  contextLines: number
  diffAlgorithm: string
}

// 差异行类型
type LineType = 'same' | 'added' | 'deleted' | 'modified'

// 差异行
interface DiffLine {
  type: LineType
  content: string
  leftNumber?: number
  rightNumber?: number
}

// 对比结果
interface DiffResult {
  totalLines: number
  sameLines: number
  addedLines: number
  deletedLines: number
  modifiedLines: number
  similarity: number
  lines: DiffLine[]
}

// 响应式数据
const selectedDiffType = ref<DiffType>('text')
const leftContent = ref('')
const rightContent = ref('')
const diffResult = ref<DiffResult | null>(null)

const options = ref<DiffOptions>({
  ignoreWhitespace: true,
  ignoreCase: false,
  ignoreLineEndings: true,
  showContext: true,
  contextLines: 3,
  diffAlgorithm: 'myers'
})

// 计算属性
const canCompare = computed(() => {
  return leftContent.value.trim() || rightContent.value.trim()
})

const leftLineCount = computed(() => {
  return leftContent.value ? leftContent.value.split('\n').length : 0
})

const rightLineCount = computed(() => {
  return rightContent.value ? rightContent.value.split('\n').length : 0
})

// 方法
const handleDiffTypeChange = () => {
  clearDiff()
}

const getLeftPlaceholder = () => {
  return selectedDiffType.value === 'text' 
    ? '请输入原始文本内容...' 
    : '请选择或输入原始文件内容...'
}

const getRightPlaceholder = () => {
  return selectedDiffType.value === 'text' 
    ? '请输入对比文本内容...' 
    : '请选择或输入对比文件内容...'
}

const compareDiff = () => {
  if (!leftContent.value.trim() && !rightContent.value.trim()) {
    ElMessage.warning('请至少输入一个内容进行对比')
    return
  }

  try {
    diffResult.value = generateDiff(leftContent.value, rightContent.value, options.value)
    ElMessage.success('对比完成')
  } catch (error) {
    ElMessage.error('对比失败：' + (error as Error).message)
  }
}

const clearDiff = () => {
  leftContent.value = ''
  rightContent.value = ''
  diffResult.value = null
}

const swapContent = () => {
  const temp = leftContent.value
  leftContent.value = rightContent.value
  rightContent.value = temp
  if (diffResult.value) {
    compareDiff()
  }
}

const pasteLeft = async () => {
  try {
    const text = await navigator.clipboard.readText()
    leftContent.value = text
    ElMessage.success('内容已粘贴到左侧')
  } catch (error) {
    ElMessage.error('无法访问剪贴板')
  }
}

const pasteRight = async () => {
  try {
    const text = await navigator.clipboard.readText()
    rightContent.value = text
    ElMessage.success('内容已粘贴到右侧')
  } catch (error) {
    ElMessage.error('无法访问剪贴板')
  }
}

const loadSampleLeft = () => {
  const samples = {
    text: `这是第一段文本内容。
这里有一些变化的内容。
第三行保持不变。
第四行有一些修改。
这是最后一行。`,
    file: `function calculateSum(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("除数不能为零");
  }
  return a / b;
}`
  }
  
  leftContent.value = samples[selectedDiffType.value]
  ElMessage.success('示例内容已加载到左侧')
}

const loadSampleRight = () => {
  const samples = {
    text: `这是第一段文本内容。
这里有一些变化的内容。
第三行保持不变。
第四行有一些修改。
这是最后一行。`,
    file: `function calculateSum(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("除数不能为零");
  }
  return a / b;
}

function power(a, b) {
  return Math.pow(a, b);
}`
  }
  
  rightContent.value = samples[selectedDiffType.value]
  ElMessage.success('示例内容已加载到右侧')
}

const loadFileLeft = () => {
  loadFile('left')
}

const loadFileRight = () => {
  loadFile('right')
}

const loadFile = (side: 'left' | 'right') => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.js,.ts,.vue,.html,.css,.json,.xml,.md,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt'
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (side === 'left') {
          leftContent.value = content
          ElMessage.success('文件已加载到左侧')
        } else {
          rightContent.value = content
          ElMessage.success('文件已加载到右侧')
        }
      }
      reader.readAsText(file)
    }
  }
  
  input.click()
}

const exportDiff = () => {
  if (!diffResult.value) {
    ElMessage.warning('没有对比结果可导出')
    return
  }

  const diffText = generateDiffText(diffResult.value)
  const blob = new Blob([diffText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'diff-result.diff'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('差异结果已导出')
}

const copyDiff = async () => {
  if (!diffResult.value) {
    ElMessage.warning('没有对比结果可复制')
    return
  }

  try {
    const diffText = generateDiffText(diffResult.value)
    await navigator.clipboard.writeText(diffText)
    ElMessage.success('差异结果已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadDiff = () => {
  exportDiff()
}

const getLineClass = (type: LineType) => {
  return {
    'line-same': type === 'same',
    'line-added': type === 'added',
    'line-deleted': type === 'deleted',
    'line-modified': type === 'modified'
  }
}

// 生成差异文本
const generateDiffText = (result: DiffResult): string => {
  let diffText = `差异对比结果\n`
  diffText += `总行数: ${result.totalLines}\n`
  diffText += `相同行: ${result.sameLines}\n`
  diffText += `新增行: ${result.addedLines}\n`
  diffText += `删除行: ${result.deletedLines}\n`
  diffText += `修改行: ${result.modifiedLines}\n`
  diffText += `相似度: ${result.similarity}%\n\n`
  
  diffText += `详细差异:\n`
  result.lines.forEach((line, index) => {
    const prefix = line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ' '
    const leftNum = line.leftNumber || '-'
    const rightNum = line.rightNumber || '-'
    diffText += `${prefix} ${leftNum.padStart(4)} ${rightNum.padStart(4)} ${line.content}\n`
  })
  
  return diffText
}

// 生成差异对比
const generateDiff = (left: string, right: string, options: DiffOptions): DiffResult => {
  // 预处理内容
  let leftText = left
  let rightText = right
  
  if (options.ignoreCase) {
    leftText = left.toLowerCase()
    rightText = right.toLowerCase()
  }
  
  if (options.ignoreLineEndings) {
    leftText = leftText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    rightText = rightText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  }
  
  if (options.ignoreWhitespace) {
    leftText = leftText.replace(/\s+/g, ' ').trim()
    rightText = rightText.replace(/\s+/g, ' ').trim()
  }
  
  // 分割行
  const leftLines = leftText.split('\n')
  const rightLines = rightText.split('\n')
  
  // 使用Myers算法计算差异
  const diff = computeDiff(leftLines, rightLines, options)
  
  // 计算统计信息
  const sameLines = diff.filter(line => line.type === 'same').length
  const addedLines = diff.filter(line => line.type === 'added').length
  const deletedLines = diff.filter(line => line.type === 'deleted').length
  const modifiedLines = diff.filter(line => line.type === 'modified').length
  const totalLines = diff.length
  
  const similarity = totalLines > 0 ? Math.round((sameLines / totalLines) * 100) : 0
  
  return {
    totalLines,
    sameLines,
    addedLines,
    deletedLines,
    modifiedLines,
    similarity,
    lines: diff
  }
}

// Myers差异算法实现
const computeDiff = (leftLines: string[], rightLines: string[], options: DiffOptions): DiffLine[] => {
  const result: DiffLine[] = []
  let leftIndex = 0
  let rightIndex = 0
  
  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    if (leftIndex < leftLines.length && rightIndex < rightLines.length) {
      if (leftLines[leftIndex] === rightLines[rightIndex]) {
        // 相同行
        result.push({
          type: 'same',
          content: leftLines[leftIndex],
          leftNumber: leftIndex + 1,
          rightNumber: rightIndex + 1
        })
        leftIndex++
        rightIndex++
      } else {
        // 查找最佳匹配
        const leftMatch = findBestMatch(leftLines, rightLines, leftIndex, rightIndex)
        const rightMatch = findBestMatch(rightLines, leftLines, rightIndex, leftIndex)
        
        if (leftMatch.score > rightMatch.score && leftMatch.score > 0) {
          // 左侧有更好的匹配
          for (let i = leftIndex; i < leftMatch.leftIndex; i++) {
            result.push({
              type: 'deleted',
              content: leftLines[i],
              leftNumber: i + 1
            })
          }
          leftIndex = leftMatch.leftIndex
        } else if (rightMatch.score > 0) {
          // 右侧有更好的匹配
          for (let i = rightIndex; i < rightMatch.leftIndex; i++) {
            result.push({
              type: 'added',
              content: rightLines[i],
              rightNumber: i + 1
            })
          }
          rightIndex = rightMatch.leftIndex
        } else {
          // 没有匹配，标记为修改
          result.push({
            type: 'deleted',
            content: leftLines[leftIndex],
            leftNumber: leftIndex + 1
          })
          result.push({
            type: 'added',
            content: rightLines[rightIndex],
            rightNumber: rightIndex + 1
          })
          leftIndex++
          rightIndex++
        }
      }
    } else if (leftIndex < leftLines.length) {
      // 左侧剩余行
      result.push({
        type: 'deleted',
        content: leftLines[leftIndex],
        leftNumber: leftIndex + 1
      })
      leftIndex++
    } else {
      // 右侧剩余行
      result.push({
        type: 'added',
        content: rightLines[rightIndex],
        rightNumber: rightIndex + 1
      })
      rightIndex++
    }
  }
  
  return result
}

// 查找最佳匹配
const findBestMatch = (sourceLines: string[], targetLines: string[], sourceStart: number, targetStart: number) => {
  let bestScore = 0
  let bestIndex = sourceStart
  
  for (let i = sourceStart; i < sourceLines.length; i++) {
    for (let j = targetStart; j < targetLines.length; j++) {
      if (sourceLines[i] === targetLines[j]) {
        let score = 1
        let k = 1
        while (i + k < sourceLines.length && j + k < targetLines.length && 
               sourceLines[i + k] === targetLines[j + k]) {
          score++
          k++
        }
        if (score > bestScore) {
          bestScore = score
          bestIndex = i
        }
      }
    }
  }
  
  return { score: bestScore, leftIndex: bestIndex }
}
</script>

<style scoped lang="scss">
.diff-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .diff-type-selector {
      .el-radio-group {
        .el-radio-button__inner {
          padding: 8px 16px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;

      .el-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  .diff-editor-section {
    margin-bottom: 1.5rem;

    .input-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .left-panel,
      .right-panel {
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;

          h3 {
            margin: 0;
            color: #333;
          }

          .panel-actions {
            display: flex;
            gap: 0.5rem;
          }
        }

        .diff-input {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;

          :deep(.el-textarea__inner) {
            font-family: inherit;
            font-size: inherit;
            line-height: inherit;
            padding: 1rem;
            border-radius: 8px;
          }
        }

        .content-info {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 12px;
          color: #666;
        }
      }
    }
  }

  .diff-options-section {
    margin-bottom: 1.5rem;

    .options-card {
      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: center;

        .option-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .option-label {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }

  .diff-result-section {
    .result-card {
      .result-summary {
        margin-bottom: 1.5rem;

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;

          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background-color: #f8f9fa;
            border-radius: 4px;

            .summary-label {
              font-size: 14px;
              color: #666;
            }

            .summary-value {
              font-weight: 600;

              &.same { color: #67c23a; }
              &.added { color: #409eff; }
              &.deleted { color: #f56c6c; }
              &.modified { color: #e6a23c; }
            }
          }
        }
      }

      .diff-viewer {
        margin-bottom: 1.5rem;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        overflow: hidden;

        .diff-header {
          display: grid;
          grid-template-columns: 80px 80px 1fr;
          background-color: #f5f7fa;
          border-bottom: 1px solid #e4e7ed;
          font-weight: 600;
          color: #333;

          .diff-line-numbers,
          .diff-content {
            padding: 0.5rem;
            text-align: center;
            border-right: 1px solid #e4e7ed;

            &:last-child {
              border-right: none;
            }
          }
        }

        .diff-lines {
          max-height: 400px;
          overflow-y: auto;

          .diff-line {
            display: grid;
            grid-template-columns: 80px 80px 1fr;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .line-number {
              padding: 0.25rem 0.5rem;
              text-align: center;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 12px;
              color: #999;
              background-color: #fafafa;
              border-right: 1px solid #e4e7ed;
            }

            .line-content {
              padding: 0.25rem 0.5rem;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 14px;
              line-height: 1.4;
              word-break: break-all;

              .line-text {
                white-space: pre-wrap;
              }
            }

            &.line-same {
              background-color: #f0f9ff;
            }

            &.line-added {
              background-color: #f0f9ff;
              border-left: 4px solid #409eff;
            }

            &.line-deleted {
              background-color: #fef0f0;
              border-left: 4px solid #f56c6c;
            }

            &.line-modified {
              background-color: #fdf6ec;
              border-left: 4px solid #e6a23c;
            }
          }
        }
      }

      .result-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }
    }
  }
}
</style>
