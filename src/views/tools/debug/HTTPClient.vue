<template>
  <ToolContainer title="HTTP 客户端" description="HTTP请求测试和调试工具">
    <div class="http-client-tool">
      <div class="tool-header">
        <div class="request-method">
          <el-select v-model="requestConfig.method" placeholder="选择请求方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
            <el-option label="HEAD" value="HEAD" />
            <el-option label="OPTIONS" value="OPTIONS" />
          </el-select>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="sendRequest" :disabled="isLoading">
            <el-icon><Position /></el-icon>
            {{ isLoading ? '发送中...' : '发送请求' }}
          </el-button>
          <el-button @click="clearRequest">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          <el-button @click="saveRequest">
            <el-icon><Document /></el-icon>
            保存
          </el-button>
        </div>
      </div>

      <div class="request-section">
        <el-card class="request-card">
          <template #header>
            <span>请求配置</span>
          </template>
          
          <div class="request-form">
            <div class="form-row">
              <div class="form-group url-group">
                <label>请求URL:</label>
                <el-input
                  v-model="requestConfig.url"
                  placeholder="https://api.example.com/endpoint"
                  class="url-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>请求头:</label>
                <div class="headers-controls">
                  <el-button @click="addHeader">添加请求头</el-button>
                  <el-button @click="addCommonHeaders">常用请求头</el-button>
                </div>
              </div>
            </div>
            
            <div class="headers-list" v-if="requestConfig.headers.length > 0">
              <div
                v-for="(header, index) in requestConfig.headers"
                :key="index"
                class="header-item"
              >
                <el-input
                  v-model="header.key"
                  placeholder="键"
                  class="header-key"
                />
                <el-input
                  v-model="header.value"
                  placeholder="值"
                  class="header-value"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeHeader(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div class="form-row" v-if="showBodySection">
              <div class="form-group">
                <label>请求体:</label>
                <div class="body-type-selector">
                  <el-radio-group v-model="requestConfig.bodyType">
                    <el-radio label="none">无</el-radio>
                    <el-radio label="form">表单数据</el-radio>
                    <el-radio label="json">JSON</el-radio>
                    <el-radio label="raw">原始数据</el-radio>
                    <el-radio label="binary">二进制</el-radio>
                  </el-radio-group>
                </div>
                
                <div class="body-content" v-if="requestConfig.bodyType !== 'none'">
                  <!-- 表单数据 -->
                  <div v-if="requestConfig.bodyType === 'form'" class="form-data">
                    <div
                      v-for="(field, index) in requestConfig.formData"
                      :key="index"
                      class="form-field"
                    >
                      <el-input
                        v-model="field.key"
                        placeholder="字段名"
                        class="field-key"
                      />
                      <el-input
                        v-model="field.value"
                        placeholder="字段值"
                        class="field-value"
                      />
                      <el-button
                        type="danger"
                        size="small"
                        @click="removeFormField(index)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button @click="addFormField">添加字段</el-button>
                  </div>
                  
                  <!-- JSON数据 -->
                  <div v-if="requestConfig.bodyType === 'json'" class="json-data">
                    <el-input
                      v-model="requestConfig.jsonData"
                      type="textarea"
                      :rows="8"
                      placeholder='{"key": "value"}'
                      class="json-input"
                    />
                  </div>
                  
                  <!-- 原始数据 -->
                  <div v-if="requestConfig.bodyType === 'raw'" class="raw-data">
                    <el-input
                      v-model="requestConfig.rawData"
                      type="textarea"
                      :rows="8"
                      placeholder="输入原始数据..."
                      class="raw-input"
                    />
                  </div>
                  
                  <!-- 二进制数据 -->
                  <div v-if="requestConfig.bodyType === 'binary'" class="binary-data">
                    <el-upload
                      class="binary-upload"
                      action="#"
                      :auto-upload="false"
                      :on-change="handleFileChange"
                      :show-file-list="false"
                    >
                      <el-button type="primary">选择文件</el-button>
                    </el-upload>
                    <div v-if="requestConfig.binaryFile" class="file-info">
                      <span>已选择: {{ requestConfig.binaryFile.name }}</span>
                      <span>大小: {{ formatFileSize(requestConfig.binaryFile.size) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="response-section">
        <el-card class="response-card">
          <template #header>
            <span>响应结果</span>
          </template>
          
          <div class="response-content" v-if="responseData">
            <div class="response-status">
              <div class="status-line">
                <span class="status-code" :class="getStatusClass(responseData.status)">
                  {{ responseData.status }}
                </span>
                <span class="status-text">{{ responseData.statusText }}</span>
              </div>
              <div class="response-time">
                响应时间: {{ responseData.responseTime }}ms
              </div>
            </div>
            
            <div class="response-tabs">
              <el-tabs v-model="activeResponseTab">
                <el-tab-pane label="响应体" name="body">
                  <div class="response-body">
                    <div class="body-controls">
                      <el-button size="small" @click="copyResponse">复制</el-button>
                      <el-button size="small" @click="downloadResponse">下载</el-button>
                      <el-button size="small" @click="formatResponse">格式化</el-button>
                    </div>
                    <div class="body-content">
                      <pre v-if="isJSONResponse">{{ formattedResponse }}</pre>
                      <div v-else class="text-content">{{ responseData.body }}</div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="响应头" name="headers">
                  <div class="response-headers">
                    <div
                      v-for="(value, key) in responseData.headers"
                      :key="key"
                      class="header-row"
                    >
                      <span class="header-name">{{ key }}:</span>
                      <span class="header-value">{{ value }}</span>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="请求信息" name="request">
                  <div class="request-info">
                    <div class="info-item">
                      <span class="info-label">请求URL:</span>
                      <span class="info-value">{{ responseData.requestUrl }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">请求方法:</span>
                      <span class="info-value">{{ responseData.requestMethod }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">请求头:</span>
                      <div class="info-headers">
                        <div
                          v-for="(value, key) in responseData.requestHeaders"
                          :key="key"
                          class="info-header"
                        >
                          <span class="header-name">{{ key }}:</span>
                          <span class="header-value">{{ value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
          
          <div v-else class="no-response">
            <el-empty description="暂无响应数据，请发送请求" />
          </div>
        </el-card>
      </div>

      <div class="history-section">
        <el-card class="history-card">
          <template #header>
            <span>请求历史</span>
          </template>
          
          <div class="history-list">
            <div
              v-for="(item, index) in requestHistory"
              :key="index"
              class="history-item"
              @click="loadHistoryItem(item)"
            >
              <div class="history-method">{{ item.method }}</div>
              <div class="history-url">{{ item.url }}</div>
              <div class="history-time">{{ formatTime(item.timestamp) }}</div>
              <div class="history-status" :class="getStatusClass(item.status)">
                {{ item.status }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Position, Delete, Document } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// 请求方法
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// 请求体类型
type BodyType = 'none' | 'form' | 'json' | 'raw' | 'binary'

// 请求配置
interface RequestConfig {
  method: RequestMethod
  url: string
  headers: Array<{ key: string; value: string }>
  bodyType: BodyType
  formData: Array<{ key: string; value: string }>
  jsonData: string
  rawData: string
  binaryFile: File | null
}

// 响应数据
interface ResponseData {
  status: number
  statusText: string
  body: string
  headers: Record<string, string>
  responseTime: number
  requestUrl: string
  requestMethod: string
  requestHeaders: Record<string, string>
}

// 历史记录项
interface HistoryItem {
  method: RequestMethod
  url: string
  status: number
  timestamp: Date
  config: RequestConfig
}

// 响应标签页
type ResponseTab = 'body' | 'headers' | 'request'

// 响应式数据
const requestConfig = ref<RequestConfig>({
  method: 'GET',
  url: '',
  headers: [],
  bodyType: 'none',
  formData: [],
  jsonData: '',
  rawData: '',
  binaryFile: null
})

const responseData = ref<ResponseData | null>(null)
const activeResponseTab = ref<ResponseTab>('body')
const isLoading = ref(false)
const requestHistory = ref<HistoryItem[]>([])

// 计算属性
const showBodySection = computed(() => {
  return ['POST', 'PUT', 'PATCH'].includes(requestConfig.value.method)
})

const isJSONResponse = computed(() => {
  if (!responseData.value) return false
  
  const contentType = responseData.value.headers['content-type'] || ''
  return contentType.includes('application/json') || contentType.includes('text/json')
})

const formattedResponse = computed(() => {
  if (!responseData.value || !isJSONResponse.value) return ''
  
  try {
    return JSON.stringify(JSON.parse(responseData.value.body), null, 2)
  } catch {
    return responseData.value.body
  }
})

// 方法
const sendRequest = async () => {
  if (!requestConfig.value.url.trim()) {
    ElMessage.warning('请输入请求URL')
    return
  }

  if (isLoading.value) return

  try {
    isLoading.value = true
    const startTime = Date.now()
    
    // 构建请求头
    const headers: Record<string, string> = {}
    requestConfig.value.headers.forEach(header => {
      if (header.key.trim() && header.value.trim()) {
        headers[header.key.trim()] = header.value.trim()
      }
    })
    
    // 构建请求体
    let body: any = null
    
    switch (requestConfig.value.bodyType) {
      case 'form':
        if (requestConfig.value.formData.length > 0) {
          const formData = new FormData()
          requestConfig.value.formData.forEach(field => {
            if (field.key.trim() && field.value.trim()) {
              formData.append(field.key.trim(), field.value.trim())
            }
          })
          body = formData
        }
        break
      case 'json':
        if (requestConfig.value.jsonData.trim()) {
          try {
            body = JSON.parse(requestConfig.value.jsonData)
            headers['Content-Type'] = 'application/json'
          } catch (error) {
            ElMessage.error('JSON格式不正确')
            return
          }
        }
        break
      case 'raw':
        if (requestConfig.value.rawData.trim()) {
          body = requestConfig.value.rawData
          headers['Content-Type'] = 'text/plain'
        }
        break
      case 'binary':
        if (requestConfig.value.binaryFile) {
          body = requestConfig.value.binaryFile
        }
        break
    }
    
    // 发送请求
    const response = await fetch(requestConfig.value.url, {
      method: requestConfig.value.method,
      headers,
      body
    })
    
    const responseTime = Date.now() - startTime
    
    // 获取响应数据
    let responseBody = ''
    try {
      if (response.headers.get('content-type')?.includes('application/json')) {
        responseBody = JSON.stringify(await response.json(), null, 2)
      } else {
        responseBody = await response.text()
      }
    } catch {
      responseBody = '[无法解析响应内容]'
    }
    
    // 构建响应数据
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    
    responseData.value = {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: responseHeaders,
      responseTime,
      requestUrl: requestConfig.value.url,
      requestMethod: requestConfig.value.method,
      requestHeaders: headers
    }
    
    // 添加到历史记录
    addToHistory()
    
    ElMessage.success('请求发送成功')
    
  } catch (error) {
    ElMessage.error('请求发送失败：' + (error as Error).message)
    
    // 记录错误响应
    responseData.value = {
      status: 0,
      statusText: '请求失败',
      body: (error as Error).message,
      headers: {},
      responseTime: 0,
      requestUrl: requestConfig.value.url,
      requestMethod: requestConfig.value.method,
      requestHeaders: {}
    }
  } finally {
    isLoading.value = false
  }
}

const clearRequest = () => {
  requestConfig.value = {
    method: 'GET',
    url: '',
    headers: [],
    bodyType: 'none',
    formData: [],
    jsonData: '',
    rawData: '',
    binaryFile: null
  }
  responseData.value = null
  ElMessage.success('请求配置已清空')
}

const saveRequest = () => {
  // 这里可以实现保存请求配置到本地存储或文件
  ElMessage.info('保存功能开发中')
}

const addHeader = () => {
  requestConfig.value.headers.push({ key: '', value: '' })
}

const removeHeader = (index: number) => {
  requestConfig.value.headers.splice(index, 1)
}

const addCommonHeaders = () => {
  const commonHeaders = [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Accept', value: 'application/json' },
    { key: 'User-Agent', value: 'HTTP-Client-Tool/1.0' },
    { key: 'Authorization', value: 'Bearer [your-token]' }
  ]
  
  commonHeaders.forEach(header => {
    if (!requestConfig.value.headers.find(h => h.key === header.key)) {
      requestConfig.value.headers.push({ ...header })
    }
  })
  
  ElMessage.success('常用请求头已添加')
}

const addFormField = () => {
  requestConfig.value.formData.push({ key: '', value: '' })
}

const removeFormField = (index: number) => {
  requestConfig.value.formData.splice(index, 1)
}

const handleFileChange = (file: any) => {
  requestConfig.value.binaryFile = file.raw
}

const copyResponse = async () => {
  if (!responseData.value) {
    ElMessage.warning('没有响应数据可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(responseData.value.body)
    ElMessage.success('响应内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadResponse = () => {
  if (!responseData.value) {
    ElMessage.warning('没有响应数据可下载')
    return
  }

  const contentType = responseData.value.headers['content-type'] || 'text/plain'
  const extension = getFileExtension(contentType)
  const filename = `response-${Date.now()}.${extension}`
  
  const blob = new Blob([responseData.value.body], { type: contentType })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('响应内容已下载')
}

const formatResponse = () => {
  if (!responseData.value || !isJSONResponse.value) {
    ElMessage.warning('只有JSON响应才能格式化')
    return
  }

  try {
    const formatted = JSON.stringify(JSON.parse(responseData.value.body), null, 2)
    responseData.value.body = formatted
    ElMessage.success('响应内容已格式化')
  } catch (error) {
    ElMessage.error('格式化失败')
  }
}

const addToHistory = () => {
  if (!responseData.value) return

  const historyItem: HistoryItem = {
    method: requestConfig.value.method,
    url: requestConfig.value.url,
    status: responseData.value.status,
    timestamp: new Date(),
    config: { ...requestConfig.value }
  }
  
  requestHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (requestHistory.value.length > 100) {
    requestHistory.value = requestHistory.value.slice(0, 100)
  }
}

const loadHistoryItem = (item: HistoryItem) => {
  requestConfig.value = { ...item.config }
  ElMessage.success('历史记录已加载')
}

const getStatusClass = (status: number): string => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'redirect'
  if (status >= 400 && status < 500) return 'client-error'
  if (status >= 500) return 'server-error'
  return 'unknown'
}

const formatTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileExtension = (contentType: string): string => {
  if (contentType.includes('application/json')) return 'json'
  if (contentType.includes('text/html')) return 'html'
  if (contentType.includes('text/xml')) return 'xml'
  if (contentType.includes('text/css')) return 'css'
  if (contentType.includes('text/javascript')) return 'js'
  if (contentType.includes('image/')) return 'img'
  return 'txt'
}

// 生命周期
onMounted(() => {
  // 加载保存的请求配置
  const savedConfig = localStorage.getItem('httpClientConfig')
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig)
      requestConfig.value = { ...requestConfig.value, ...config }
    } catch (error) {
      console.error('加载保存的配置失败:', error)
    }
  }
  
  // 加载历史记录
  const savedHistory = localStorage.getItem('httpClientHistory')
  if (savedHistory) {
    try {
      const history = JSON.parse(savedHistory)
      requestHistory.value = history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }
})

// 监听器 - 保存配置和历史记录
watch(requestConfig, (newConfig) => {
  localStorage.setItem('httpClientConfig', JSON.stringify(newConfig))
}, { deep: true })

watch(requestHistory, (newHistory) => {
  localStorage.setItem('httpClientHistory', JSON.stringify(newHistory))
}, { deep: true })
</script>

<style scoped lang="scss">
.http-client-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .request-method {
      .el-select {
        min-width: 120px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
  }

  .request-section {
    margin-bottom: 1.5rem;

    .request-card {
      .request-form {
        .form-row {
          margin-bottom: 1.5rem;

          .form-group {
            label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #333;
            }

            &.url-group {
              .url-input {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              }
            }

            .headers-controls {
              display: flex;
              gap: 0.5rem;
              margin-bottom: 1rem;
            }

            .body-type-selector {
              margin-bottom: 1rem;
            }

            .body-content {
              .form-data {
                .form-field {
                  display: grid;
                  grid-template-columns: 1fr 1fr auto;
                  gap: 0.5rem;
                  margin-bottom: 0.5rem;
                  align-items: center;

                  .field-key {
                    min-width: 150px;
                  }

                  .field-value {
                    min-width: 200px;
                  }
                }
              }

              .json-data,
              .raw-data {
                .json-input,
                .raw-input {
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  font-size: 14px;
                }
              }

              .binary-data {
                .binary-upload {
                  margin-bottom: 1rem;
                }

                .file-info {
                  display: flex;
                  gap: 1rem;
                  font-size: 14px;
                  color: #666;
                }
              }
            }
          }
        }

        .headers-list {
          .header-item {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            align-items: center;

            .header-key {
              min-width: 150px;
            }

            .header-value {
              min-width: 200px;
            }
          }
        }
      }
    }
  }

  .response-section {
    margin-bottom: 1.5rem;

    .response-card {
      .response-content {
        .response-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 6px;

          .status-line {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .status-code {
              font-size: 24px;
              font-weight: 700;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;

              &.success {
                background-color: #f0f9ff;
                color: #67c23a;
              }

              &.redirect {
                background-color: #fdf6ec;
                color: #e6a23c;
              }

              &.client-error {
                background-color: #fef0f0;
                color: #f56c6c;
              }

              &.server-error {
                background-color: #fef0f0;
                color: #f56c6c;
              }

              &.unknown {
                background-color: #f4f4f5;
                color: #909399;
              }
            }

            .status-text {
              font-size: 16px;
              color: #666;
            }
          }

          .response-time {
            font-size: 14px;
            color: #999;
          }
        }

        .response-tabs {
          .response-body {
            .body-controls {
              display: flex;
              gap: 0.5rem;
              margin-bottom: 1rem;
            }

            .body-content {
              max-height: 400px;
              overflow-y: auto;
              border: 1px solid #e4e7ed;
              border-radius: 4px;
              padding: 1rem;
              background-color: #fafafa;

              pre {
                margin: 0;
                white-space: pre-wrap;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.5;
              }

              .text-content {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.5;
                white-space: pre-wrap;
              }
            }
          }

          .response-headers {
            .header-row {
              display: flex;
              padding: 0.5rem;
              border-bottom: 1px solid #f0f0f0;

              &:last-child {
                border-bottom: none;
              }

              .header-name {
                font-weight: 600;
                color: #333;
                min-width: 200px;
                margin-right: 1rem;
              }

              .header-value {
                color: #666;
                word-break: break-all;
              }
            }
          }

          .request-info {
            .info-item {
              margin-bottom: 1rem;

              .info-label {
                display: block;
                font-weight: 600;
                color: #333;
                margin-bottom: 0.5rem;
              }

              .info-value {
                color: #666;
                word-break: break-all;
              }

              .info-headers {
                .info-header {
                  display: flex;
                  padding: 0.25rem 0;
                  border-bottom: 1px solid #f0f0f0;

                  &:last-child {
                    border-bottom: none;
                  }

                  .header-name {
                    font-weight: 600;
                    color: #333;
                    min-width: 150px;
                    margin-right: 1rem;
                  }

                  .header-value {
                    color: #666;
                    word-break: break-all;
                  }
                }
              }
            }
          }
        }
      }

      .no-response {
        padding: 2rem;
        text-align: center;
      }
    }
  }

  .history-section {
    .history-card {
      .history-list {
        max-height: 300px;
        overflow-y: auto;

        .history-item {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #f8f9fa;
          }

          &:last-child {
            border-bottom: none;
          }

          .history-method {
            font-weight: 600;
            color: #409eff;
            min-width: 60px;
          }

          .history-url {
            color: #333;
            word-break: break-all;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
          }

          .history-time {
            color: #999;
            font-size: 12px;
            min-width: 80px;
          }

          .history-status {
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 12px;
            min-width: 50px;
            text-align: center;

            &.success {
              background-color: #f0f9ff;
              color: #67c23a;
            }

            &.redirect {
              background-color: #fdf6ec;
              color: #e6a23c;
            }

            &.client-error {
              background-color: #fef0f0;
              color: #f56c6c;
            }

            &.server-error {
              background-color: #fef0f0;
              color: #f56c6c;
            }

            &.unknown {
              background-color: #f4f4f5;
              color: #909399;
            }
          }
        }
      }
    }
  }
}
</style>
