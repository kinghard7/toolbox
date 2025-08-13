<template>
  <ToolContainer title="JSON ↔ XML" description="JSON与XML格式互转">
    <div class="json-xml-tool">
      <el-tabs v-model="activeTab" class="conversion-tabs">
        <!-- JSON转XML -->
        <el-tab-pane label="JSON → XML" name="jsonToXml">
          <div class="conversion-section">
            <div class="input-section">
              <div class="input-header">
                <h3>JSON 输入</h3>
                <div class="input-actions">
                  <el-button size="small" @click="clearJsonInput">清空</el-button>
                  <el-button size="small" @click="formatJsonInput">格式化</el-button>
                </div>
              </div>
              <el-input
                v-model="jsonInput"
                type="textarea"
                :rows="8"
                placeholder="请输入JSON数据..."
                @input="convertJsonToXml"
              />
              <div v-if="jsonError" class="error">{{ jsonError }}</div>
            </div>

            <div class="output-section">
              <div class="output-header">
                <h3>XML 输出</h3>
                <div class="output-actions">
                  <el-button size="small" @click="copyXmlOutput" :disabled="!xmlOutput">复制</el-button>
                  <el-button size="small" @click="downloadXml" :disabled="!xmlOutput">下载</el-button>
                </div>
              </div>
              <el-input
                v-model="xmlOutput"
                type="textarea"
                :rows="8"
                readonly
                placeholder="XML结果将显示在这里..."
              />
            </div>

            <div class="options-section">
              <h4>转换选项</h4>
              <div class="options-grid">
                <el-input v-model="xmlRootName" placeholder="根元素名称" prefix-icon="Document" style="width: 200px;" @input="convertJsonToXml" />
                <el-input v-model="xmlArrayItemName" placeholder="数组项元素名称" prefix-icon="List" style="width: 200px;" @input="convertJsonToXml" />
                <el-checkbox v-model="xmlPrettyPrint" @change="convertJsonToXml">格式化输出</el-checkbox>
                <el-checkbox v-model="xmlIncludeDeclaration" @change="convertJsonToXml">包含XML声明</el-checkbox>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- XML转JSON -->
        <el-tab-pane label="XML → JSON" name="xmlToJson">
          <div class="conversion-section">
            <div class="input-section">
              <div class="input-header">
                <h3>XML 输入</h3>
                <div class="input-actions">
                  <el-button size="small" @click="clearXmlInput">清空</el-button>
                </div>
              </div>
              <el-input
                v-model="xmlInput"
                type="textarea"
                :rows="8"
                placeholder="请输入XML数据..."
                @input="convertXmlToJson"
              />
              <div v-if="xmlError" class="error">{{ xmlError }}</div>
            </div>

            <div class="output-section">
              <div class="output-header">
                <h3>JSON 输出</h3>
                <div class="output-actions">
                  <el-button size="small" @click="copyJsonOutput" :disabled="!jsonOutput">复制</el-button>
                  <el-button size="small" @click="formatJsonOutput" :disabled="!jsonOutput">格式化</el-button>
                  <el-button size="small" @click="downloadJson" :disabled="!jsonOutput">下载</el-button>
                </div>
              </div>
              <el-input
                v-model="jsonOutput"
                type="textarea"
                :rows="8"
                readonly
                placeholder="JSON结果将显示在这里..."
              />
            </div>

            <div class="options-section">
              <h4>转换选项</h4>
              <div class="options-grid">
                <el-checkbox v-model="jsonIgnoreAttributes" @change="convertXmlToJson">忽略属性</el-checkbox>
                <el-checkbox v-model="jsonMergeTextNodes" @change="convertXmlToJson">合并文本节点</el-checkbox>
                <el-checkbox v-model="jsonTrimValues" @change="convertXmlToJson">去除空白字符</el-checkbox>
                <el-checkbox v-model="jsonCompactOutput" @change="convertXmlToJson">紧凑输出</el-checkbox>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

const activeTab = ref('jsonToXml')

// JSON to XML
const jsonInput = ref('')
const xmlOutput = ref('')
const jsonError = ref('')
const xmlRootName = ref('root')
const xmlArrayItemName = ref('item')
const xmlPrettyPrint = ref(true)
const xmlIncludeDeclaration = ref(true)

// XML to JSON
const xmlInput = ref('')
const jsonOutput = ref('')
const xmlError = ref('')
const jsonIgnoreAttributes = ref(false)
const jsonMergeTextNodes = ref(true)
const jsonTrimValues = ref(true)
const jsonCompactOutput = ref(false)

// JSON转XML
const convertJsonToXml = () => {
  jsonError.value = ''
  xmlOutput.value = ''

  if (!jsonInput.value.trim()) {
    return
  }

  try {
    const jsonData = JSON.parse(jsonInput.value)
    const xml = jsonToXml(jsonData, xmlRootName.value)
    xmlOutput.value = xml
  } catch (error) {
    jsonError.value = '无效的JSON格式'
  }
}

// 递归将JSON对象转换为XML
const jsonToXml = (obj: any, tagName: string = 'root'): string => {
  let xml = ''
  
  if (xmlIncludeDeclaration.value && tagName === xmlRootName.value) {
    xml += '<?xml version="1.0" encoding="UTF-8"?>\n'
  }

  const convertValue = (value: any, tag: string, depth: number = 0): string => {
    const indent = xmlPrettyPrint.value ? '  '.repeat(depth) : ''
    const newline = xmlPrettyPrint.value ? '\n' : ''

    if (value === null || value === undefined) {
      return `${indent}<${tag}></${tag}>${newline}`
    }

    if (Array.isArray(value)) {
      let result = ''
      value.forEach(item => {
        result += convertValue(item, xmlArrayItemName.value, depth)
      })
      return result
    }

    if (typeof value === 'object') {
      let result = `${indent}<${tag}>${newline}`
      
      for (const [key, val] of Object.entries(value)) {
        result += convertValue(val, key, depth + 1)
      }
      
      result += `${indent}</${tag}>${newline}`
      return result
    }

    // 基本类型
    const escapedValue = escapeXml(String(value))
    return `${indent}<${tag}>${escapedValue}</${tag}>${newline}`
  }

  xml += convertValue(obj, tagName)
  return xml
}

// XML转JSON
const convertXmlToJson = () => {
  xmlError.value = ''
  jsonOutput.value = ''

  if (!xmlInput.value.trim()) {
    return
  }

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlInput.value, 'text/xml')
    
    // 检查解析错误
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      xmlError.value = 'XML格式错误'
      return
    }

    const jsonData = xmlToJson(xmlDoc.documentElement)
    jsonOutput.value = JSON.stringify(jsonData, null, jsonCompactOutput.value ? 0 : 2)
  } catch (error) {
    xmlError.value = 'XML解析失败'
  }
}

// 递归将XML节点转换为JSON
const xmlToJson = (element: Element): any => {
  const result: any = {}

  // 处理属性
  if (!jsonIgnoreAttributes.value && element.attributes.length > 0) {
    result['@attributes'] = {}
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i]
      result['@attributes'][attr.name] = attr.value
    }
  }

  // 处理子节点
  const children = Array.from(element.childNodes)
  const textNodes = children.filter(node => node.nodeType === Node.TEXT_NODE)
  const elementNodes = children.filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[]

  // 处理文本内容
  let textContent = textNodes.map(node => node.textContent || '').join('')
  if (jsonTrimValues.value) {
    textContent = textContent.trim()
  }

  if (elementNodes.length === 0) {
    // 叶子节点
    if (textContent || !jsonMergeTextNodes.value) {
      return parseValue(textContent)
    }
    return null
  }

  // 处理子元素
  const elementGroups: { [key: string]: Element[] } = {}
  elementNodes.forEach(child => {
    const tagName = child.tagName
    if (!elementGroups[tagName]) {
      elementGroups[tagName] = []
    }
    elementGroups[tagName].push(child)
  })

  for (const [tagName, elements] of Object.entries(elementGroups)) {
    if (elements.length === 1) {
      result[tagName] = xmlToJson(elements[0])
    } else {
      result[tagName] = elements.map(el => xmlToJson(el))
    }
  }

  // 如果有文本内容且需要合并
  if (textContent && jsonMergeTextNodes.value && Object.keys(result).length > 0) {
    result['#text'] = parseValue(textContent)
  } else if (textContent && Object.keys(result).length === 0) {
    return parseValue(textContent)
  }

  return result
}

// 解析值类型
const parseValue = (value: string): any => {
  if (!value) return value

  // 尝试解析为数字
  if (/^-?\d+$/.test(value)) {
    return parseInt(value, 10)
  }
  if (/^-?\d*\.\d+$/.test(value)) {
    return parseFloat(value)
  }

  // 尝试解析为布尔值
  if (value === 'true') return true
  if (value === 'false') return false

  return value
}

// XML转义
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 清空输入
const clearJsonInput = () => {
  jsonInput.value = ''
  xmlOutput.value = ''
  jsonError.value = ''
}

const clearXmlInput = () => {
  xmlInput.value = ''
  jsonOutput.value = ''
  xmlError.value = ''
}

// 格式化JSON输入
const formatJsonInput = () => {
  if (!jsonInput.value.trim()) return

  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
    convertJsonToXml()
  } catch (error) {
    ElMessage.error('JSON格式错误，无法格式化')
  }
}

// 格式化JSON输出
const formatJsonOutput = () => {
  if (!jsonOutput.value.trim()) return

  try {
    const parsed = JSON.parse(jsonOutput.value)
    jsonOutput.value = JSON.stringify(parsed, null, 2)
  } catch (error) {
    ElMessage.error('格式化失败')
  }
}

// 复制功能
const copyXmlOutput = async () => {
  try {
    await navigator.clipboard.writeText(xmlOutput.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyJsonOutput = async () => {
  try {
    await navigator.clipboard.writeText(jsonOutput.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载功能
const downloadXml = () => {
  if (!xmlOutput.value) return

  const blob = new Blob([xmlOutput.value], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.xml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('XML文件已下载')
}

const downloadJson = () => {
  if (!jsonOutput.value) return

  const blob = new Blob([jsonOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('JSON文件已下载')
}
</script>

<style scoped lang="scss">
.json-xml-tool {
  .conversion-tabs {
    .conversion-section {
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

        .error {
          color: var(--el-color-danger);
          margin-top: 8px;
          font-size: 14px;
        }
      }

      .options-section {
        margin-top: 24px;
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
    }
  }
}

@media (max-width: 768px) {
  .json-xml-tool {
    .conversion-section {
      .input-header, .output-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .options-section .options-grid {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}
</style>
