<template>
  <ToolContainer title="JSON ↔ YAML" description="JSON与YAML格式互转">
    <div class="json-yaml-tool">
      <el-tabs v-model="activeTab" class="conversion-tabs">
        <!-- JSON转YAML -->
        <el-tab-pane label="JSON → YAML" name="jsonToYaml">
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
                @input="convertJsonToYaml"
              />
              <div v-if="jsonError" class="error">{{ jsonError }}</div>
            </div>

            <div class="output-section">
              <div class="output-header">
                <h3>YAML 输出</h3>
                <div class="output-actions">
                  <el-button size="small" @click="copyYamlOutput" :disabled="!yamlOutput">复制</el-button>
                  <el-button size="small" @click="downloadYaml" :disabled="!yamlOutput">下载</el-button>
                </div>
              </div>
              <el-input
                v-model="yamlOutput"
                type="textarea"
                :rows="8"
                readonly
                placeholder="YAML结果将显示在这里..."
              />
            </div>

            <div class="options-section">
              <h4>转换选项</h4>
              <div class="options-grid">
                <el-input-number v-model="yamlIndent" :min="2" :max="8" controls-position="right" style="width: 120px;" @change="convertJsonToYaml" />
                <span style="margin-left: 8px;">缩进空格数</span>
                <el-checkbox v-model="yamlFlowStyle" @change="convertJsonToYaml">流式风格</el-checkbox>
                <el-checkbox v-model="yamlIncludeComments" @change="convertJsonToYaml">包含注释</el-checkbox>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- YAML转JSON -->
        <el-tab-pane label="YAML → JSON" name="yamlToJson">
          <div class="conversion-section">
            <div class="input-section">
              <div class="input-header">
                <h3>YAML 输入</h3>
                <div class="input-actions">
                  <el-button size="small" @click="clearYamlInput">清空</el-button>
                </div>
              </div>
              <el-input
                v-model="yamlInput"
                type="textarea"
                :rows="8"
                placeholder="请输入YAML数据..."
                @input="convertYamlToJson"
              />
              <div v-if="yamlError" class="error">{{ yamlError }}</div>
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
                <el-checkbox v-model="jsonCompactOutput" @change="convertYamlToJson">紧凑输出</el-checkbox>
                <el-checkbox v-model="jsonSortKeys" @change="convertYamlToJson">排序键名</el-checkbox>
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

const activeTab = ref('jsonToYaml')

// JSON to YAML
const jsonInput = ref('')
const yamlOutput = ref('')
const jsonError = ref('')
const yamlIndent = ref(2)
const yamlFlowStyle = ref(false)
const yamlIncludeComments = ref(false)

// YAML to JSON
const yamlInput = ref('')
const jsonOutput = ref('')
const yamlError = ref('')
const jsonCompactOutput = ref(false)
const jsonSortKeys = ref(false)

// JSON转YAML
const convertJsonToYaml = () => {
  jsonError.value = ''
  yamlOutput.value = ''

  if (!jsonInput.value.trim()) {
    return
  }

  try {
    const jsonData = JSON.parse(jsonInput.value)
    const yaml = jsonToYaml(jsonData, 0)
    yamlOutput.value = yaml
  } catch (error) {
    jsonError.value = '无效的JSON格式'
  }
}

// 递归将JSON转换为YAML
const jsonToYaml = (obj: any, depth: number = 0): string => {
  const indent = ' '.repeat(depth * yamlIndent.value)
  
  if (obj === null || obj === undefined) {
    return 'null'
  }

  if (typeof obj === 'string') {
    // 检查是否需要引号
    if (needsQuotes(obj)) {
      return `"${escapeYamlString(obj)}"`
    }
    return obj
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj)
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]'
    }

    if (yamlFlowStyle.value) {
      const items = obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          return jsonToYaml(item, 0)
        }
        return jsonToYaml(item, 0)
      }).join(', ')
      return `[${items}]`
    }

    return obj.map(item => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const itemYaml = jsonToYaml(item, depth + 1)
        return `${indent}- ${itemYaml.replace(/^\s+/, '')}`
      }
      return `${indent}- ${jsonToYaml(item, depth + 1)}`
    }).join('\n')
  }

  if (typeof obj === 'object') {
    const keys = jsonSortKeys.value ? Object.keys(obj).sort() : Object.keys(obj)
    
    if (keys.length === 0) {
      return '{}'
    }

    if (yamlFlowStyle.value && depth > 0) {
      const items = keys.map(key => {
        return `${key}: ${jsonToYaml(obj[key], depth + 1)}`
      }).join(', ')
      return `{${items}}`
    }

    return keys.map((key, index) => {
      const value = obj[key]
      const comment = yamlIncludeComments.value && index === 0 ? ' # Generated from JSON' : ''
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const valueYaml = jsonToYaml(value, depth + 1)
        return `${indent}${key}:${comment}\n${valueYaml}`
      } else if (Array.isArray(value) && value.length > 0 && !yamlFlowStyle.value) {
        const valueYaml = jsonToYaml(value, depth + 1)
        return `${indent}${key}:${comment}\n${valueYaml}`
      } else {
        return `${indent}${key}: ${jsonToYaml(value, depth + 1)}${comment}`
      }
    }).join('\n')
  }

  return String(obj)
}

// 检查字符串是否需要引号
const needsQuotes = (str: string): boolean => {
  // YAML特殊字符和关键字检查
  const yamlKeywords = ['true', 'false', 'null', 'yes', 'no', 'on', 'off']
  if (yamlKeywords.includes(str.toLowerCase())) return true
  
  // 数字检查
  if (/^-?\d+(\.\d+)?$/.test(str)) return true
  
  // 特殊字符检查
  if (/[:\[\]{}|>@`"']/.test(str)) return true
  
  // 以空格开始或结束
  if (str !== str.trim()) return true
  
  return false
}

// YAML字符串转义
const escapeYamlString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

// YAML转JSON
const convertYamlToJson = () => {
  yamlError.value = ''
  jsonOutput.value = ''

  if (!yamlInput.value.trim()) {
    return
  }

  try {
    const jsonData = parseYaml(yamlInput.value)
    if (jsonCompactOutput.value) {
      jsonOutput.value = JSON.stringify(jsonData)
    } else {
      jsonOutput.value = JSON.stringify(jsonData, null, 2)
    }
  } catch (error) {
    yamlError.value = 'YAML格式错误'
  }
}

// 简化的YAML解析器
const parseYaml = (yamlStr: string): any => {
  const lines = yamlStr.split('\n').map(line => line.replace(/\r$/, ''))
  let result: any = {}
  let stack: Array<{obj: any, key?: string, indent: number}> = [{obj: result, indent: -1}]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#')) continue
    
    const indent = line.length - line.trimStart().length
    
    // 处理缩进变化
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }
    
    const current = stack[stack.length - 1]
    
    // 数组项
    if (trimmed.startsWith('- ')) {
      const value = trimmed.substring(2).trim()
      
      if (!Array.isArray(current.obj)) {
        if (current.key) {
          current.obj[current.key] = []
          current.obj = current.obj[current.key]
        } else {
          result = []
          current.obj = result
        }
      }
      
      const parsedValue = parseYamlValue(value)
      current.obj.push(parsedValue)
      
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        stack.push({obj: parsedValue, indent})
      }
    }
    // 键值对
    else if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':')
      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()
      
      if (!current.obj || typeof current.obj !== 'object' || Array.isArray(current.obj)) {
        current.obj = {}
        if (current.key && stack.length > 1) {
          stack[stack.length - 2].obj[current.key] = current.obj
        } else {
          result = current.obj
        }
      }
      
      if (value) {
        current.obj[key] = parseYamlValue(value)
      } else {
        // 嵌套对象或数组
        current.obj[key] = {}
        stack.push({obj: current.obj[key], key, indent})
      }
    }
  }
  
  return result
}

// 解析YAML值
const parseYamlValue = (value: string): any => {
  if (!value) return null
  
  // 布尔值
  if (['true', 'yes', 'on'].includes(value.toLowerCase())) return true
  if (['false', 'no', 'off'].includes(value.toLowerCase())) return false
  
  // null
  if (['null', '~'].includes(value.toLowerCase())) return null
  
  // 数字
  if (/^-?\d+$/.test(value)) return parseInt(value, 10)
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value)
  
  // 字符串
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  
  return value
}

// 清空输入
const clearJsonInput = () => {
  jsonInput.value = ''
  yamlOutput.value = ''
  jsonError.value = ''
}

const clearYamlInput = () => {
  yamlInput.value = ''
  jsonOutput.value = ''
  yamlError.value = ''
}

// 格式化JSON
const formatJsonInput = () => {
  if (!jsonInput.value.trim()) return

  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, 2)
    convertJsonToYaml()
  } catch (error) {
    ElMessage.error('JSON格式错误，无法格式化')
  }
}

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
const copyYamlOutput = async () => {
  try {
    await navigator.clipboard.writeText(yamlOutput.value)
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
const downloadYaml = () => {
  if (!yamlOutput.value) return

  const blob = new Blob([yamlOutput.value], { type: 'application/x-yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.yaml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('YAML文件已下载')
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
.json-yaml-tool {
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
  .json-yaml-tool {
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
