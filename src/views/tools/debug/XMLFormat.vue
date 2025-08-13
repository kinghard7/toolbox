<template>
  <ToolContainer title="XML 格式化" description="XML格式化和压缩工具">
    <div class="xml-format-tool">
      <div class="tool-header">
        <div class="format-options">
          <el-radio-group v-model="selectedFormatType" @change="handleFormatTypeChange">
            <el-radio-button label="format">格式化</el-radio-button>
            <el-radio-button label="minify">压缩</el-radio-button>
            <el-radio-button label="validate">验证</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="processXML" :disabled="!inputXML.trim()">
            <el-icon><Document /></el-icon>
            处理
          </el-button>
          <el-button @click="clearXML">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <div class="xml-editor-section">
        <div class="input-section">
          <div class="section-header">
            <h3>输入XML</h3>
            <div class="input-actions">
              <el-button size="small" @click="pasteXML">粘贴</el-button>
              <el-button size="small" @click="loadSampleXML">加载示例</el-button>
              <el-button size="small" @click="loadFileXML">加载文件</el-button>
            </div>
          </div>
          <el-input
            v-model="inputXML"
            type="textarea"
            :rows="12"
            placeholder="请输入要处理的XML内容..."
            class="xml-input"
          />
        </div>

        <div class="output-section">
          <div class="section-header">
            <h3>处理结果</h3>
            <div class="output-actions">
              <el-button size="small" @click="copyOutput">复制</el-button>
              <el-button size="small" @click="downloadOutput">下载</el-button>
            </div>
          </div>
          <el-input
            v-model="outputXML"
            type="textarea"
            :rows="12"
            readonly
            class="xml-output"
          />
        </div>
      </div>

      <div class="options-section">
        <el-card class="options-card">
          <template #header>
            <span>格式化选项</span>
          </template>
          
          <div class="options-grid">
            <div class="option-item">
              <el-checkbox v-model="options.indentWithSpaces">使用空格缩进</el-checkbox>
            </div>
            <div class="option-item">
              <el-input-number
                v-model="options.indentSize"
                :min="2"
                :max="8"
                size="small"
                label="缩进大小"
              />
              <span class="option-label">缩进大小</span>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.collapseContent">折叠内容</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.removeComments">移除注释</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.removeEmptyElements">移除空元素</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.normalizeWhitespace">标准化空白</el-checkbox>
            </div>
          </div>
        </el-card>
      </div>

      <div class="validation-section" v-if="selectedFormatType === 'validate'">
        <el-card class="validation-card">
          <template #header>
            <span>验证结果</span>
          </template>
          
          <div class="validation-content">
            <div v-if="validationResult.isValid" class="validation-success">
              <el-icon color="#67c23a"><CircleCheck /></el-icon>
              <span>XML格式正确</span>
            </div>
            <div v-else class="validation-error">
              <el-icon color="#f56c6c"><CircleClose /></el-icon>
              <span>XML格式错误</span>
            </div>
            
            <div v-if="validationResult.errors.length > 0" class="error-list">
              <h4>错误详情:</h4>
              <div class="error-item" v-for="(error, index) in validationResult.errors" :key="index">
                <span class="error-line">第{{ error.line }}行:</span>
                <span class="error-message">{{ error.message }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="analysis-section">
        <el-card class="analysis-card">
          <template #header>
            <span>XML分析</span>
          </template>
          
          <div class="analysis-content">
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="analysis-label">根元素:</span>
                <span class="analysis-value">{{ xmlAnalysis.rootElement }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">元素总数:</span>
                <span class="analysis-value">{{ xmlAnalysis.elementCount }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">属性总数:</span>
                <span class="analysis-value">{{ xmlAnalysis.attributeCount }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">嵌套层级:</span>
                <span class="analysis-value">{{ xmlAnalysis.nestingLevel }}</span>
              </div>
            </div>
            
            <div class="elements-info" v-if="xmlAnalysis.elements.length > 0">
              <h4>主要元素:</h4>
              <div class="element-list">
                <el-tag
                  v-for="element in xmlAnalysis.elements.slice(0, 10)"
                  :key="element.name"
                  size="small"
                  type="info"
                  class="element-tag"
                >
                  {{ element.name }} ({{ element.count }})
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="stats-section">
        <el-card class="stats-card">
          <template #header>
            <span>统计信息</span>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">原始大小:</span>
              <span class="stat-value">{{ formatFileSize(inputXML.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">处理后大小:</span>
              <span class="stat-value">{{ formatFileSize(outputXML.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">压缩率:</span>
              <span class="stat-value">{{ compressionRatio }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">行数:</span>
              <span class="stat-value">{{ lineCount }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// 格式化类型
type FormatType = 'format' | 'minify' | 'validate'

// 格式化选项
interface FormatOptions {
  indentWithSpaces: boolean
  indentSize: number
  collapseContent: boolean
  removeComments: boolean
  removeEmptyElements: boolean
  normalizeWhitespace: boolean
}

// 验证结果
interface ValidationResult {
  isValid: boolean
  errors: Array<{
    line: number
    message: string
  }>
}

// XML分析结果
interface XMLAnalysis {
  rootElement: string
  elementCount: number
  attributeCount: number
  nestingLevel: number
  elements: Array<{
    name: string
    count: number
  }>
}

// 响应式数据
const selectedFormatType = ref<FormatType>('format')
const inputXML = ref('')
const outputXML = ref('')

const options = ref<FormatOptions>({
  indentWithSpaces: true,
  indentSize: 2,
  collapseContent: false,
  removeComments: false,
  removeEmptyElements: false,
  normalizeWhitespace: true
})

const validationResult = ref<ValidationResult>({
  isValid: true,
  errors: []
})

// 计算属性
const compressionRatio = computed(() => {
  if (!inputXML.value || !outputXML.value) return 0
  const ratio = ((inputXML.value.length - outputXML.value.length) / inputXML.value.length) * 100
  return Math.round(ratio)
})

const lineCount = computed(() => {
  return outputXML.value ? outputXML.value.split('\n').length : 0
})

const xmlAnalysis = computed<XMLAnalysis>(() => {
  return analyzeXML(inputXML.value)
})

// 方法
const handleFormatTypeChange = () => {
  // 切换类型时清空输出
  outputXML.value = ''
  if (selectedFormatType.value === 'validate') {
    validateXML()
  }
}

const processXML = () => {
  if (!inputXML.value.trim()) {
    ElMessage.warning('请先输入XML内容')
    return
  }

  try {
    switch (selectedFormatType.value) {
      case 'format':
        outputXML.value = formatXML(inputXML.value, options.value)
        ElMessage.success('XML格式化完成')
        break
      case 'minify':
        outputXML.value = minifyXML(inputXML.value, options.value)
        ElMessage.success('XML压缩完成')
        break
      case 'validate':
        validateXML()
        break
    }
  } catch (error) {
    ElMessage.error('XML处理失败：' + (error as Error).message)
  }
}

const clearXML = () => {
  inputXML.value = ''
  outputXML.value = ''
  validationResult.value = { isValid: true, errors: [] }
}

const pasteXML = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputXML.value = text
    ElMessage.success('XML已粘贴')
  } catch (error) {
    ElMessage.error('无法访问剪贴板')
  }
}

const loadSampleXML = () => {
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>15.99</price>
    <description>
      <summary>A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.</summary>
      <reviews>
        <review rating="5">Excellent classic novel</review>
        <review rating="4">Great American literature</review>
      </reviews>
    </description>
  </book>
  
  <book category="non-fiction">
    <title lang="en">Programming Fundamentals</title>
    <author>John Doe</author>
    <year>2023</year>
    <price>29.99</price>
    <description>
      <summary>Comprehensive guide to programming basics</summary>
      <topics>
        <topic>Variables and Data Types</topic>
        <topic>Control Structures</topic>
        <topic>Functions and Methods</topic>
        <topic>Object-Oriented Programming</topic>
      </topics>
    </description>
  </book>
  
  <book category="fiction">
    <title lang="en">1984</title>
    <author>George Orwell</author>
    <year>1949</year>
    <price>12.99</price>
    <description>
      <summary>A dystopian social science fiction novel</summary>
      <themes>
        <theme>Totalitarianism</theme>
        <theme>Surveillance</theme>
        <theme>Thought Control</theme>
      </themes>
    </description>
  </book>
</bookstore>`
  
  inputXML.value = sampleXML
  ElMessage.success('示例XML已加载')
}

const loadFileXML = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xml,.txt'
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        inputXML.value = e.target?.result as string
        ElMessage.success('XML文件已加载')
      }
      reader.readAsText(file)
    }
  }
  
  input.click()
}

const copyOutput = async () => {
  if (!outputXML.value) {
    ElMessage.warning('没有输出内容可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(outputXML.value)
    ElMessage.success('XML已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadOutput = () => {
  if (!outputXML.value) {
    ElMessage.warning('没有输出内容可下载')
    return
  }

  const filename = 'formatted-xml.xml'
  const blob = new Blob([outputXML.value], { type: 'text/xml' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// XML验证函数
const validateXML = () => {
  try {
    // 创建DOMParser
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(inputXML.value, 'text/xml')
    
    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName('parsererror')
    if (parseError.length > 0) {
      validationResult.value = {
        isValid: false,
        errors: [{
          line: 1,
          message: 'XML解析错误：' + parseError[0].textContent
        }]
      }
      outputXML.value = 'XML格式错误，无法格式化'
    } else {
      validationResult.value = {
        isValid: true,
        errors: []
      }
      // 如果验证成功且是格式化模式，则格式化
      if (selectedFormatType.value === 'validate') {
        outputXML.value = formatXML(inputXML.value, options.value)
      }
      ElMessage.success('XML验证通过')
    }
  } catch (error) {
    validationResult.value = {
      isValid: false,
      errors: [{
        line: 1,
        message: 'XML验证失败：' + (error as Error).message
      }]
    }
    outputXML.value = 'XML验证失败'
  }
}

// XML分析函数
const analyzeXML = (xml: string): XMLAnalysis => {
  if (!xml.trim()) {
    return {
      rootElement: '未知',
      elementCount: 0,
      attributeCount: 0,
      nestingLevel: 0,
      elements: []
    }
  }

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    
    // 获取根元素
    const rootElement = xmlDoc.documentElement?.tagName || '未知'
    
    // 统计元素和属性
    const allElements = xmlDoc.getElementsByTagName('*')
    const elementCount = allElements.length
    
    let attributeCount = 0
    for (let i = 0; i < allElements.length; i++) {
      attributeCount += allElements[i].attributes.length
    }
    
    // 计算嵌套层级
    const nestingLevel = calculateNestingLevel(xmlDoc.documentElement)
    
    // 统计主要元素
    const elementMap = new Map<string, number>()
    for (let i = 0; i < allElements.length; i++) {
      const tagName = allElements[i].tagName
      elementMap.set(tagName, (elementMap.get(tagName) || 0) + 1)
    }
    
    const elements = Array.from(elementMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
    
    return {
      rootElement,
      elementCount,
      attributeCount,
      nestingLevel,
      elements
    }
  } catch (error) {
    return {
      rootElement: '解析失败',
      elementCount: 0,
      attributeCount: 0,
      nestingLevel: 0,
      elements: []
    }
  }
}

// 计算嵌套层级
const calculateNestingLevel = (element: Element | null, currentLevel = 0): number => {
  if (!element) return currentLevel
  
  let maxLevel = currentLevel
  const children = element.children
  
  for (let i = 0; i < children.length; i++) {
    const childLevel = calculateNestingLevel(children[i], currentLevel + 1)
    maxLevel = Math.max(maxLevel, childLevel)
  }
  
  return maxLevel
}

// XML格式化函数
const formatXML = (xml: string, options: FormatOptions): string => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    
    // 移除注释
    if (options.removeComments) {
      const comments = xmlDoc.evaluate('//comment()', xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      for (let i = comments.snapshotLength - 1; i >= 0; i--) {
        const comment = comments.snapshotItem(i)
        comment?.parentNode?.removeChild(comment)
      }
    }
    
    // 移除空元素
    if (options.removeEmptyElements) {
      const emptyElements = xmlDoc.evaluate('//*[not(text()) and not(*) and not(@*)]', xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      for (let i = emptyElements.snapshotLength - 1; i >= 0; i--) {
        const emptyElement = emptyElements.snapshotItem(i)
        emptyElement?.parentNode?.removeChild(emptyElement)
      }
    }
    
    // 标准化空白
    if (options.normalizeWhitespace) {
      normalizeWhitespace(xmlDoc.documentElement)
    }
    
    // 格式化输出
    const serializer = new XMLSerializer()
    let formatted = serializer.serializeToString(xmlDoc)
    
    // 添加换行和缩进
    formatted = addIndentation(formatted, options)
    
    return formatted
  } catch (error) {
    throw new Error('XML格式化失败：' + (error as Error).message)
  }
}

// 标准化空白
const normalizeWhitespace = (element: Element) => {
  if (!element) return
  
  // 处理文本节点
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i]
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      const normalized = text.replace(/\s+/g, ' ').trim()
      if (normalized !== text) {
        node.textContent = normalized
      }
    }
  }
  
  // 递归处理子元素
  for (let i = 0; i < element.children.length; i++) {
    normalizeWhitespace(element.children[i])
  }
}

// 添加缩进
const addIndentation = (xml: string, options: FormatOptions): string => {
  const indent = options.indentWithSpaces ? ' '.repeat(options.indentSize) : '\t'
  
  // 简单的缩进处理
  let formatted = xml
    .replace(/>\s*</g, '>\n<')
    .replace(/\n\s*\n/g, '\n')
  
  const lines = formatted.split('\n')
  let indentLevel = 0
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    // 调整缩进级别
    if (trimmed.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    const currentIndent = indent.repeat(indentLevel)
    const result = currentIndent + trimmed
    
    if (!trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indentLevel++
    }
    
    return result
  })
  
  return formattedLines.filter(line => line !== '').join('\n')
}

// XML压缩函数
const minifyXML = (xml: string, options: FormatOptions): string => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    
    // 移除注释
    if (options.removeComments) {
      const comments = xmlDoc.evaluate('//comment()', xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      for (let i = comments.snapshotLength - 1; i >= 0; i--) {
        const comment = comments.snapshotItem(i)
        comment?.parentNode?.removeChild(comment)
      }
    }
    
    // 移除空元素
    if (options.removeEmptyElements) {
      const emptyElements = xmlDoc.evaluate('//*[not(text()) and not(*) and not(@*)]', xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      for (let i = emptyElements.snapshotLength - 1; i >= 0; i--) {
        const emptyElement = emptyElements.snapshotItem(i)
        emptyElement?.parentNode?.removeChild(emptyElement)
      }
    }
    
    // 标准化空白
    if (options.normalizeWhitespace) {
      normalizeWhitespace(xmlDoc.documentElement)
    }
    
    // 序列化并压缩
    const serializer = new XMLSerializer()
    let minified = serializer.serializeToString(xmlDoc)
    
    // 压缩空白字符
    minified = minified
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
    
    return minified
  } catch (error) {
    throw new Error('XML压缩失败：' + (error as Error).message)
  }
}

// 监听输入变化，自动验证
watch(inputXML, (newValue) => {
  if (newValue.trim() && selectedFormatType.value === 'validate') {
    validateXML()
  }
})
</script>

<style scoped lang="scss">
.xml-format-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .format-options {
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

  .xml-editor-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .input-section,
    .output-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        h3 {
          margin: 0;
          color: #333;
        }

        .input-actions,
        .output-actions {
          display: flex;
          gap: 0.5rem;
        }
      }

      .xml-input,
      .xml-output {
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

      .xml-output {
        :deep(.el-textarea__inner) {
          background-color: #f8f9fa;
          color: #666;
        }
      }
    }
  }

  .options-section {
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

  .validation-section {
    margin-bottom: 1.5rem;

    .validation-card {
      .validation-content {
        .validation-success,
        .validation-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: 4px;

          .el-icon {
            font-size: 20px;
          }
        }

        .validation-success {
          background-color: #f0f9ff;
          color: #67c23a;
        }

        .validation-error {
          background-color: #fef0f0;
          color: #f56c6c;
        }

        .error-list {
          h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 16px;
          }

          .error-item {
            display: flex;
            gap: 0.5rem;
            padding: 0.25rem 0;
            font-size: 14px;

            .error-line {
              color: #f56c6c;
              font-weight: 600;
              min-width: 80px;
            }

            .error-message {
              color: #666;
            }
          }
        }
      }
    }
  }

  .analysis-section {
    margin-bottom: 1.5rem;

    .analysis-card {
      .analysis-content {
        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;

          .analysis-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background-color: #f8f9fa;
            border-radius: 4px;

            .analysis-label {
              font-size: 14px;
              color: #666;
            }

            .analysis-value {
              font-weight: 600;
              color: #67c23a;
            }
          }
        }

        .elements-info {
          h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 16px;
          }

          .element-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;

            .element-tag {
              margin: 0;
            }
          }
        }
      }
    }
  }

  .stats-section {
    .stats-card {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 4px;

          .stat-label {
            font-size: 14px;
            color: #666;
          }

          .stat-value {
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
