<template>
  <ToolContainer title="WebSocket 测试" description="WebSocket连接测试和消息收发工具">
    <div class="websocket-tool">
      <div class="tool-header">
        <div class="connection-status">
          <div class="status-indicator" :class="connectionStatus">
            <el-icon>
              <component :is="getStatusIcon()" />
            </el-icon>
            <span class="status-text">{{ getStatusText() }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <el-button 
            type="primary" 
            @click="connectWebSocket" 
            :disabled="isConnected"
            v-if="!isConnected"
          >
            <el-icon><Connection /></el-icon>
            连接
          </el-button>
          <el-button 
            type="danger" 
            @click="disconnectWebSocket" 
            :disabled="!isConnected"
            v-if="isConnected"
          >
            <el-icon><Close /></el-icon>
            断开
          </el-button>
          <el-button @click="clearMessages">
            <el-icon><Delete /></el-icon>
            清空消息
          </el-button>
        </div>
      </div>

      <div class="connection-section">
        <el-card class="connection-card">
          <template #header>
            <span>连接配置</span>
          </template>
          
          <div class="connection-form">
            <div class="form-row">
              <div class="form-group">
                <label>WebSocket URL:</label>
                <el-input
                  v-model="connectionConfig.url"
                  placeholder="ws://localhost:8080/websocket"
                  :disabled="isConnected"
                />
              </div>
              
              <div class="form-group">
                <label>协议:</label>
                <el-select v-model="connectionConfig.protocols" multiple placeholder="选择协议" :disabled="isConnected">
                  <el-option label="无" value="" />
                  <el-option label="wss" value="wss" />
                  <el-option label="ws" value="ws" />
                </el-select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>连接超时 (ms):</label>
                <el-input-number
                  v-model="connectionConfig.timeout"
                  :min="1000"
                  :max="30000"
                  :step="1000"
                  :disabled="isConnected"
                />
              </div>
              
              <div class="form-group">
                <label>自动重连:</label>
                <el-switch
                  v-model="connectionConfig.autoReconnect"
                  :disabled="isConnected"
                />
              </div>
              
              <div class="form-group">
                <label>重连间隔 (ms):</label>
                <el-input-number
                  v-model="connectionConfig.reconnectInterval"
                  :min="1000"
                  :max="10000"
                  :step="1000"
                  :disabled="connectionConfig.autoReconnect === false || isConnected"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>请求头:</label>
                <el-button @click="addHeader" :disabled="isConnected">添加请求头</el-button>
              </div>
            </div>
            
            <div class="headers-list" v-if="connectionConfig.headers.length > 0">
              <div
                v-for="(header, index) in connectionConfig.headers"
                :key="index"
                class="header-item"
              >
                <el-input
                  v-model="header.key"
                  placeholder="键"
                  :disabled="isConnected"
                  class="header-key"
                />
                <el-input
                  v-model="header.value"
                  placeholder="值"
                  :disabled="isConnected"
                  class="header-value"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeHeader(index)"
                  :disabled="isConnected"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="message-section">
        <div class="message-input">
          <el-card class="input-card">
            <template #header>
              <span>发送消息</span>
            </template>
            
            <div class="message-form">
              <div class="form-row">
                <div class="form-group">
                  <label>消息类型:</label>
                  <el-radio-group v-model="messageConfig.type">
                    <el-radio label="text">文本</el-radio>
                    <el-radio label="binary">二进制</el-radio>
                    <el-radio label="json">JSON</el-radio>
                  </el-radio-group>
                </div>
                
                <div class="form-group">
                  <label>消息内容:</label>
                  <el-input
                    v-model="messageConfig.content"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入要发送的消息内容..."
                    :disabled="!isConnected"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>操作:</label>
                  <div class="form-actions">
                    <el-button 
                      type="primary" 
                      @click="sendMessage" 
                      :disabled="!isConnected || !messageConfig.content.trim()"
                    >
                      <el-icon><Send /></el-icon>
                      发送
                    </el-button>
                    <el-button @click="clearMessage">
                      <el-icon><Delete /></el-icon>
                      清空
                    </el-button>
                    <el-button @click="loadSampleMessage">
                      <el-icon><Document /></el-icon>
                      示例
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <div class="message-log">
          <el-card class="log-card">
            <template #header>
              <span>消息日志</span>
            </template>
            
            <div class="log-controls">
              <div class="log-filters">
                <el-checkbox-group v-model="logFilters">
                  <el-checkbox label="sent">发送</el-checkbox>
                  <el-checkbox label="received">接收</el-checkbox>
                  <el-checkbox label="system">系统</el-checkbox>
                  <el-checkbox label="error">错误</el-checkbox>
                </el-checkbox-group>
              </div>
              
              <div class="log-actions">
                <el-button size="small" @click="exportLog">导出日志</el-button>
                <el-button size="small" @click="clearLog">清空日志</el-button>
              </div>
            </div>
            
            <div class="log-content">
              <div
                v-for="(message, index) in filteredMessages"
                :key="index"
                class="log-item"
                :class="message.type"
              >
                <div class="log-header">
                  <span class="log-time">{{ formatTime(message.timestamp) }}</span>
                  <span class="log-type">{{ getMessageTypeText(message.type) }}</span>
                  <span class="log-size">{{ formatMessageSize(message.content) }}</span>
                </div>
                
                <div class="log-content-text">
                  <pre v-if="message.type === 'json'">{{ formatJSON(message.content) }}</pre>
                  <span v-else>{{ message.content }}</span>
                </div>
                
                <div class="log-actions-item">
                  <el-button size="small" @click="copyMessage(message.content)">复制</el-button>
                  <el-button size="small" @click="resendMessage(message)">重发</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="stats-section">
        <el-card class="stats-card">
          <template #header>
            <span>连接统计</span>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">连接状态:</span>
              <span class="stat-value" :class="connectionStatus">{{ getStatusText() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">连接时长:</span>
              <span class="stat-value">{{ connectionDuration }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">发送消息:</span>
              <span class="stat-value">{{ stats.sentCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">接收消息:</span>
              <span class="stat-value">{{ stats.receivedCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">错误次数:</span>
              <span class="stat-value">{{ stats.errorCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">重连次数:</span>
              <span class="stat-value">{{ stats.reconnectCount }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, Close, Delete, Send, Document } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// 连接状态
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// 消息类型
type MessageType = 'sent' | 'received' | 'system' | 'error'

// 连接配置
interface ConnectionConfig {
  url: string
  protocols: string[]
  timeout: number
  autoReconnect: boolean
  reconnectInterval: number
  headers: Array<{ key: string; value: string }>
}

// 消息配置
interface MessageConfig {
  type: 'text' | 'binary' | 'json'
  content: string
}

// 日志消息
interface LogMessage {
  type: MessageType
  content: string
  timestamp: Date
  size: number
}

// 统计信息
interface Stats {
  sentCount: number
  receivedCount: number
  errorCount: number
  reconnectCount: number
}

// 响应式数据
const connectionStatus = ref<ConnectionStatus>('disconnected')
const isConnected = ref(false)
const connectionStartTime = ref<Date | null>(null)
const reconnectTimer = ref<NodeJS.Timeout | null>(null)

const connectionConfig = ref<ConnectionConfig>({
  url: 'ws://localhost:8080/websocket',
  protocols: [],
  timeout: 5000,
  autoReconnect: false,
  reconnectInterval: 3000,
  headers: []
})

const messageConfig = ref<MessageConfig>({
  type: 'text',
  content: ''
})

const messages = ref<LogMessage[]>([])
const logFilters = ref<MessageType[]>(['sent', 'received', 'system', 'error'])

const stats = ref<Stats>({
  sentCount: 0,
  receivedCount: 0,
  errorCount: 0,
  reconnectCount: 0
})

let websocket: WebSocket | null = null
let connectionTimer: NodeJS.Timeout | null = null

// 计算属性
const connectionDuration = computed(() => {
  if (!connectionStartTime.value) return '未连接'
  
  const now = new Date()
  const diff = now.getTime() - connectionStartTime.value.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
})

const filteredMessages = computed(() => {
  return messages.value.filter(message => logFilters.value.includes(message.type))
})

// 方法
const getStatusIcon = () => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'CircleCheck'
    case 'connecting':
      return 'Loading'
    case 'error':
      return 'CircleClose'
    default:
      return 'CircleClose'
  }
}

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接'
    case 'connecting':
      return '连接中'
    case 'error':
      return '连接错误'
    default:
      return '未连接'
  }
}

const connectWebSocket = () => {
  if (!connectionConfig.value.url.trim()) {
    ElMessage.warning('请输入WebSocket URL')
    return
  }

  try {
    connectionStatus.value = 'connecting'
    
    // 构建请求头
    const headers: Record<string, string> = {}
    connectionConfig.value.headers.forEach(header => {
      if (header.key.trim() && header.value.trim()) {
        headers[header.key.trim()] = header.value.trim()
      }
    })
    
    // 创建WebSocket连接
    websocket = new WebSocket(connectionConfig.value.url, connectionConfig.value.protocols)
    
    // 设置连接超时
    connectionTimer = setTimeout(() => {
      if (connectionStatus.value === 'connecting') {
        connectionStatus.value = 'error'
        ElMessage.error('连接超时')
        cleanupConnection()
      }
    }, connectionConfig.value.timeout)
    
    // 绑定事件
    websocket.onopen = onWebSocketOpen
    websocket.onmessage = onWebSocketMessage
    websocket.onclose = onWebSocketClose
    websocket.onerror = onWebSocketError
    
    addSystemMessage('正在连接...')
    
  } catch (error) {
    connectionStatus.value = 'error'
    ElMessage.error('连接失败：' + (error as Error).message)
    addSystemMessage('连接失败：' + (error as Error).message)
  }
}

const disconnectWebSocket = () => {
  if (websocket) {
    websocket.close(1000, '用户主动断开')
    cleanupConnection()
    ElMessage.success('连接已断开')
  }
}

const cleanupConnection = () => {
  if (connectionTimer) {
    clearTimeout(connectionTimer)
    connectionTimer = null
  }
  
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value)
    reconnectTimer.value = null
  }
  
  websocket = null
  isConnected.value = false
  connectionStatus.value = 'disconnected'
  connectionStartTime.value = null
}

const onWebSocketOpen = (event: Event) => {
  connectionStatus.value = 'connected'
  isConnected.value = true
  connectionStartTime.value = new Date()
  
  if (connectionTimer) {
    clearTimeout(connectionTimer)
    connectionTimer = null
  }
  
  addSystemMessage('连接已建立')
  ElMessage.success('WebSocket连接成功')
}

const onWebSocketMessage = (event: MessageEvent) => {
  let content = ''
  let size = 0
  
  if (typeof event.data === 'string') {
    content = event.data
    size = new Blob([event.data]).size
  } else if (event.data instanceof Blob) {
    content = '[二进制数据]'
    size = event.data.size
  } else if (event.data instanceof ArrayBuffer) {
    content = '[二进制数据]'
    size = event.data.byteLength
  }
  
  addMessage('received', content, size)
  stats.value.receivedCount++
}

const onWebSocketClose = (event: CloseEvent) => {
  addSystemMessage(`连接已关闭 (代码: ${event.code}, 原因: ${event.reason || '无'})`)
  
  if (connectionConfig.value.autoReconnect && event.code !== 1000) {
    // 自动重连
    stats.value.reconnectCount++
    addSystemMessage(`将在${connectionConfig.value.reconnectInterval / 1000}秒后自动重连...`)
    
    reconnectTimer.value = setTimeout(() => {
      if (connectionConfig.value.autoReconnect) {
        connectWebSocket()
      }
    }, connectionConfig.value.reconnectInterval)
  } else {
    cleanupConnection()
  }
}

const onWebSocketError = (event: Event) => {
  connectionStatus.value = 'error'
  stats.value.errorCount++
  addErrorMessage('WebSocket错误')
  ElMessage.error('WebSocket连接错误')
}

const sendMessage = () => {
  if (!websocket || !isConnected.value) {
    ElMessage.warning('WebSocket未连接')
    return
  }

  if (!messageConfig.value.content.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  try {
    let content = messageConfig.value.content
    let size = 0
    
    if (messageConfig.value.type === 'json') {
      // 验证JSON格式
      try {
        JSON.parse(content)
      } catch (error) {
        ElMessage.error('JSON格式不正确')
        return
      }
    }
    
    // 发送消息
    websocket.send(content)
    
    // 记录发送的消息
    size = new Blob([content]).size
    addMessage('sent', content, size)
    stats.value.sentCount++
    
    // 清空输入框
    messageConfig.value.content = ''
    
    ElMessage.success('消息发送成功')
  } catch (error) {
    ElMessage.error('消息发送失败：' + (error as Error).message)
    addErrorMessage('消息发送失败：' + (error as Error).message)
  }
}

const addMessage = (type: MessageType, content: string, size: number) => {
  messages.value.push({
    type,
    content,
    timestamp: new Date(),
    size
  })
  
  // 限制日志数量
  if (messages.value.length > 1000) {
    messages.value = messages.value.slice(-1000)
  }
}

const addSystemMessage = (content: string) => {
  addMessage('system', content, content.length)
}

const addErrorMessage = (content: string) => {
  addMessage('error', content, content.length)
}

const clearMessages = () => {
  messageConfig.value.content = ''
}

const clearMessage = () => {
  messageConfig.value.content = ''
}

const loadSampleMessage = () => {
  const samples = {
    text: 'Hello, WebSocket!',
    json: JSON.stringify({ message: 'Hello', timestamp: new Date().toISOString() }, null, 2),
    binary: 'Binary message example'
  }
  
  messageConfig.value.content = samples[messageConfig.value.type]
  ElMessage.success('示例消息已加载')
}

const addHeader = () => {
  connectionConfig.value.headers.push({ key: '', value: '' })
}

const removeHeader = (index: number) => {
  connectionConfig.value.headers.splice(index, 1)
}

const exportLog = () => {
  if (messages.value.length === 0) {
    ElMessage.warning('没有日志可导出')
    return
  }

  const logText = messages.value.map(msg => {
    return `[${formatTime(msg.timestamp)}] [${getMessageTypeText(msg.type)}] ${msg.content}`
  }).join('\n')
  
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `websocket-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('日志导出成功')
}

const clearLog = () => {
  messages.value = []
  ElMessage.success('日志已清空')
}

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('消息已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const resendMessage = (message: LogMessage) => {
  if (message.type === 'sent') {
    messageConfig.value.content = message.content
    ElMessage.success('消息已加载到输入框')
  }
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

const getMessageTypeText = (type: MessageType): string => {
  const typeMap = {
    sent: '发送',
    received: '接收',
    system: '系统',
    error: '错误'
  }
  return typeMap[type]
}

const formatMessageSize = (content: string): string => {
  const size = new Blob([content]).size
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
}

const formatJSON = (content: string): string => {
  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    return content
  }
}

// 生命周期
onMounted(() => {
  addSystemMessage('WebSocket测试工具已启动')
})

onUnmounted(() => {
  cleanupConnection()
})
</script>

<style scoped lang="scss">
.websocket-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .connection-status {
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 16px;
        font-weight: 600;

        &.connected {
          color: #67c23a;
        }

        &.connecting {
          color: #e6a23c;
        }

        &.error {
          color: #f56c6c;
        }

        &.disconnected {
          color: #909399;
        }

        .el-icon {
          font-size: 20px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
  }

  .connection-section {
    margin-bottom: 1.5rem;

    .connection-card {
      .connection-form {
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;

          .form-group {
            label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #333;
            }
          }
        }

        .headers-list {
          margin-top: 1rem;

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

  .message-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .message-input {
      .input-card {
        .message-form {
          .form-row {
            margin-bottom: 1rem;

            .form-group {
              label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
              }

              .form-actions {
                display: flex;
                gap: 0.5rem;
              }
            }
          }
        }
      }
    }

    .message-log {
      .log-card {
        .log-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .log-filters {
            .el-checkbox-group {
              display: flex;
              gap: 1rem;
            }
          }

          .log-actions {
            display: flex;
            gap: 0.5rem;
          }
        }

        .log-content {
          max-height: 400px;
          overflow-y: auto;

          .log-item {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid;

            &.sent {
              background-color: #f0f9ff;
              border-left-color: #409eff;
            }

            &.received {
              background-color: #f0f9ff;
              border-left-color: #67c23a;
            }

            &.system {
              background-color: #fdf6ec;
              border-left-color: #e6a23c;
            }

            &.error {
              background-color: #fef0f0;
              border-left-color: #f56c6c;
            }

            .log-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.5rem;
              font-size: 12px;
              color: #666;

              .log-time {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              }

              .log-type {
                font-weight: 600;
              }

              .log-size {
                color: #999;
              }
            }

            .log-content-text {
              margin-bottom: 0.5rem;
              word-break: break-all;

              pre {
                margin: 0;
                white-space: pre-wrap;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 12px;
                background-color: rgba(0, 0, 0, 0.05);
                padding: 0.5rem;
                border-radius: 4px;
              }
            }

            .log-actions-item {
              display: flex;
              gap: 0.5rem;
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-radius: 6px;

          .stat-label {
            font-size: 14px;
            color: #666;
          }

          .stat-value {
            font-weight: 600;
            color: #409eff;

            &.connected {
              color: #67c23a;
            }

            &.connecting {
              color: #e6a23c;
            }

            &.error {
              color: #f56c6c;
            }

            &.disconnected {
              color: #909399;
            }
          }
        }
      }
    }
  }
}
</style>
