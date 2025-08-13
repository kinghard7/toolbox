<template>
  <ToolContainer title="JSON 格式化/压缩" description="JSON格式化、压缩、验证和统计分析">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="json-format-tool">
      <!-- 操作选项 -->
      <el-card class="options-card">
        <div class="options-row">
          <div class="option-group">
            <label class="option-label">操作类型：</label>
            <el-radio-group v-model="operation" @change="handleOperationChange">
              <el-radio value="format">格式化</el-radio>
              <el-radio value="minify">压缩</el-radio>
              <el-radio value="escape">转义</el-radio>
              <el-radio value="unescape">反转义</el-radio>
            </el-radio-group>
          </div>
          
          <div v-if="operation === 'format'" class="option-group">
            <label class="option-label">缩进：</label>
            <el-select v-model="indent" @change="handleIndentChange">
              <el-option :label="'2 空格'" :value="2" />
              <el-option :label="'4 空格'" :value="4" />
              <el-option :label="'制表符'" :value="'tab'" />
            </el-select>
          </div>
        </div>
      </el-card>

      <!-- 输入输出区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>JSON 输入</span>
                <div class="header-actions">
                  <el-button :size="'small'" @click="pasteFromClipboard">
                    <el-icon><DocumentCopy /></el-icon>
                    粘贴
                  </el-button>
                  <el-button :size="'small'" @click="loadSample">
                    <el-icon><Document /></el-icon>
                    示例
                  </el-button>
                </div>
              </div>
            </template>
            
            <CodeEditor
              v-model="inputText"
              :height="editorHeight"
              language="json"
              placeholder="请输入 JSON 数据..."
              @change="handleTextInput"
            />
            
            <!-- 验证状态 -->
            <div class="validation-status">
              <el-alert
                v-if="validationResult"
                :type="validationResult.valid ? 'success' : 'error'"
                :title="validationResult.valid ? 'JSON 格式正确' : 'JSON 格式错误'"
                :description="validationResult.error"
                :closable="false"
                size="small"
              />
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>处理结果</span>
                <div class="header-actions">
                  <el-button 
                    :size="'small'" 
                    :disabled="!outputText"
                    @click="copyToClipboard"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                    复制
                  </el-button>
                  <el-button 
                    :size="'small'" 
                    :disabled="!outputText"
                    @click="downloadAsFile"
                  >
                    <el-icon><Download /></el-icon>
                    下载
                  </el-button>
                </div>
              </div>
            </template>
            
            <CodeEditor
              v-model="outputText"
              :height="editorHeight"
              language="json"
              :readonly="true"
            />
            
            <!-- 输出信息 -->
            <div v-if="outputText" class="output-info">
              <el-text size="small" type="success">
                字符数：{{ outputText.length }} | 
                行数：{{ outputText.split('\n').length }} |
                大小：{{ formatFileSize(new Blob([outputText]).size) }}
              </el-text>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- JSON 统计信息 -->
      <el-card v-if="statistics" class="statistics-card">
        <template #header>
          <span>JSON 统计信息</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="数据大小" :value="statistics.size" suffix="字符" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="嵌套深度" :value="statistics.depth" suffix="层" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="键的数量" :value="statistics.keys" suffix="个" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="行数" :value="statistics.lines" suffix="行" />
          </el-col>
        </el-row>
        
        <el-divider />
        
        <el-row :gutter="20">
          <el-col :span="4">
            <el-statistic title="对象" :value="statistics.objects" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="数组" :value="statistics.arrays" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="字符串" :value="statistics.strings" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="数字" :value="statistics.numbers" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="布尔值" :value="statistics.booleans" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="空值" :value="statistics.nulls" />
          </el-col>
        </el-row>
      </el-card>

      <!-- 快捷操作 -->
      <el-card class="actions-card">
        <template #header>
          <span>快捷操作</span>
        </template>
        
        <div class="quick-actions">
          <el-button @click="validateOnly">
            <el-icon><CircleCheck /></el-icon>
            验证 JSON
          </el-button>
          <el-button @click="sortKeys">
            <el-icon><Sort /></el-icon>
            排序键名
          </el-button>
          <el-button @click="removeComments">
            <el-icon><Delete /></el-icon>
            移除注释
          </el-button>
          <el-button @click="generateSchema">
            <el-icon><Document /></el-icon>
            生成 Schema
          </el-button>
        </div>
      </el-card>

      <!-- 示例 JSON -->
      <el-card class="examples-card">
        <template #header>
          <span>JSON 示例</span>
        </template>
        
        <el-tabs v-model="activeExample" @tab-change="loadExample">
          <el-tab-pane label="用户信息" name="user">
            <pre class="example-code">{{ examples.user }}</pre>
          </el-tab-pane>
          <el-tab-pane label="产品列表" name="products">
            <pre class="example-code">{{ examples.products }}</pre>
          </el-tab-pane>
          <el-tab-pane label="嵌套对象" name="nested">
            <pre class="example-code">{{ examples.nested }}</pre>
          </el-tab-pane>
          <el-tab-pane label="API 响应" name="api">
            <pre class="example-code">{{ examples.api }}</pre>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import CodeEditor from '@/components/base/CodeEditor.vue'
import { JSONTool } from '@/utils/format'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy,
  Download,
  Document,
  CircleCheck,
  Sort
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const operation = ref<'format' | 'minify' | 'escape' | 'unescape'>('format')
const indent = ref<number | 'tab'>(2)
const inputText = ref('')
const outputText = ref('')
const validationResult = ref<{ valid: boolean; error?: string } | null>(null)
const statistics = ref<any>(null)
const activeExample = ref('user')

// 计算属性
const editorHeight = computed(() => '400px')

// 示例数据
const examples = {
  user: `{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "age": 30,
  "active": true,
  "profile": {
    "avatar": "https://example.com/avatar.jpg",
    "bio": "这是一个用户简介"
  }
}`,
  products: `[
  {
    "id": 1,
    "name": "iPhone 15",
    "price": 5999,
    "category": "手机",
    "tags": ["苹果", "5G", "高端"]
  },
  {
    "id": 2,
    "name": "MacBook Pro",
    "price": 13999,
    "category": "笔记本",
    "tags": ["苹果", "专业", "M3"]
  }
]`,
  nested: `{
  "company": {
    "name": "科技公司",
    "departments": [
      {
        "name": "研发部",
        "employees": [
          {
            "name": "李四",
            "position": "前端工程师",
            "skills": ["Vue", "React", "TypeScript"]
          }
        ]
      }
    ]
  }
}`,
  api: `{
  "status": "success",
  "code": 200,
  "message": "请求成功",
  "data": {
    "users": [],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 0
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`
}

// 监听输入变化
watch(inputText, (newValue) => {
  if (newValue) {
    validateJSON(newValue)
  } else {
    validationResult.value = null
    statistics.value = null
  }
}, { immediate: true })

// 方法
const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  validationResult.value = null
  statistics.value = null
}

const handleOperationChange = () => {
  if (inputText.value) {
    handleTextInput(inputText.value)
  }
}

const handleIndentChange = () => {
  if (operation.value === 'format' && inputText.value) {
    handleTextInput(inputText.value)
  }
}

const validateJSON = (text: string) => {
  if (!text.trim()) {
    validationResult.value = null
    statistics.value = null
    return
  }

  validationResult.value = JSONTool.validate(text)
  
  if (validationResult.value.valid) {
    try {
      statistics.value = JSONTool.getStatistics(text)
    } catch (error) {
      statistics.value = null
    }
  } else {
    statistics.value = null
  }
}

const handleTextInput = async (text: string) => {
  if (!text.trim()) {
    outputText.value = ''
    return
  }

  try {
    let result = ''
    
    switch (operation.value) {
      case 'format':
        const indentValue = indent.value === 'tab' ? '\t' : indent.value
        result = JSONTool.format(text, indentValue)
        break
      case 'minify':
        result = JSONTool.minify(text)
        break
      case 'escape':
        result = JSONTool.escape(text)
        break
      case 'unescape':
        result = JSONTool.unescape(text)
        break
    }
    
    outputText.value = result
    
    // 记录历史
    appStore.addHistory({
      toolId: 'json-format',
      timestamp: Date.now(),
      input: text,
      output: result
    })
  } catch (error) {
    ElMessage.error((error as Error).message)
    outputText.value = ''
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    ElMessage.success('已从剪贴板粘贴')
  } catch {
    ElMessage.error('粘贴失败')
  }
}

const downloadAsFile = () => {
  if (!outputText.value) return

  const blob = new Blob([outputText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `json_${operation.value}_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const loadSample = () => {
  inputText.value = examples.user
}

const loadExample = (name: string) => {
  inputText.value = examples[name as keyof typeof examples]
}

const validateOnly = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入 JSON 数据')
    return
  }
  
  const result = JSONTool.validate(inputText.value)
  if (result.valid) {
    ElMessage.success('JSON 格式正确')
  } else {
    ElMessage.error(`JSON 格式错误：${result.error}`)
  }
}

const sortKeys = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入 JSON 数据')
    return
  }
  
  try {
    const obj = JSON.parse(inputText.value)
    const sortedObj = sortObjectKeys(obj)
    inputText.value = JSON.stringify(sortedObj, null, 2)
    ElMessage.success('键名排序完成')
  } catch (error) {
    ElMessage.error('JSON 格式错误')
  }
}

const sortObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj && typeof obj === 'object') {
    const sorted: any = {}
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key])
    })
    return sorted
  }
  return obj
}

const removeComments = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入 JSON 数据')
    return
  }
  
  // 简单的注释移除（仅作示例）
  const cleaned = inputText.value
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
  
  inputText.value = cleaned
  ElMessage.success('注释移除完成')
}

const generateSchema = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入 JSON 数据')
    return
  }
  
  try {
    const obj = JSON.parse(inputText.value)
    const schema = generateJSONSchema(obj)
    outputText.value = JSON.stringify(schema, null, 2)
    ElMessage.success('Schema 生成完成')
  } catch (error) {
    ElMessage.error('JSON 格式错误')
  }
}

const generateJSONSchema = (obj: any): any => {
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      items: obj.length > 0 ? generateJSONSchema(obj[0]) : {}
    }
  } else if (obj && typeof obj === 'object') {
    const properties: any = {}
    Object.keys(obj).forEach(key => {
      properties[key] = generateJSONSchema(obj[key])
    })
    return {
      type: 'object',
      properties,
      required: Object.keys(obj)
    }
  } else if (typeof obj === 'string') {
    return { type: 'string' }
  } else if (typeof obj === 'number') {
    return { type: 'number' }
  } else if (typeof obj === 'boolean') {
    return { type: 'boolean' }
  } else if (obj === null) {
    return { type: 'null' }
  }
  
  return {}
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.json-format-tool {
  .options-card {
    margin-bottom: 20px;
    
    .options-row {
      display: flex;
      gap: 40px;
      align-items: center;
      
      .option-group {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .option-label {
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .validation-status {
    margin-top: 12px;
  }

  .output-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  .statistics-card {
    margin-top: 20px;
  }

  .actions-card {
    margin-top: 20px;
    
    .quick-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .examples-card {
    margin-top: 20px;
    
    .example-code {
      background: var(--el-fill-color-light);
      padding: 12px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
    }
  }
}

@media (max-width: 768px) {
  .json-format-tool {
    .options-card {
      .options-row {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        
        .option-group {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
    }

    :deep(.el-row) {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .card-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      
      .header-actions {
        justify-content: flex-end;
      }
    }

    .quick-actions {
      justify-content: center;
    }

    .statistics-card {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>
