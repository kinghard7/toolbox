<template>
  <ToolContainer title="时间戳转换" description="时间戳与日期时间的相互转换">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="timestamp-tool">
      <!-- 当前时间 -->
      <el-card class="current-time-card">
        <template #header>
          <div class="card-header">
            <span>当前时间</span>
            <div class="header-actions">
              <el-button size="small" @click="refreshCurrentTime">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="current-time-display">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="time-item">
                <label class="time-label">当前日期时间：</label>
                <div class="time-value">{{ currentDateTime }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="time-item">
                <label class="time-label">当前时间戳：</label>
                <div class="time-value">
                  {{ currentTimestamp }}
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(currentTimestamp.toString())"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 时间戳转日期 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>时间戳 → 日期时间</span>
            </template>
            
            <div class="conversion-section">
              <div class="input-section">
                <label class="input-label">时间戳：</label>
                <el-input
                  v-model="timestampInput"
                  placeholder="输入时间戳（秒或毫秒）"
                  @input="handleTimestampInput"
                >
                  <template #append>
                    <el-select v-model="timestampUnit" @change="handleTimestampInput" style="width: 80px">
                      <el-option label="秒" value="seconds" />
                      <el-option label="毫秒" value="milliseconds" />
                    </el-select>
                  </template>
                </el-input>
              </div>
              
              <div class="quick-actions">
                <el-button size="small" @click="useCurrentTimestamp">使用当前时间</el-button>
                <el-button size="small" @click="pasteTimestamp">粘贴</el-button>
              </div>
              
              <div v-if="timestampResult" class="result-section">
                <div class="result-item">
                  <label>本地时间：</label>
                  <div class="result-value">
                    {{ timestampResult.local }}
                    <el-button 
                      size="small" 
                      text 
                      @click="copyToClipboard(timestampResult.local)"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </div>
                </div>
                
                <div class="result-item">
                  <label>UTC时间：</label>
                  <div class="result-value">
                    {{ timestampResult.utc }}
                    <el-button 
                      size="small" 
                      text 
                      @click="copyToClipboard(timestampResult.utc)"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </div>
                </div>
                
                <div class="result-item">
                  <label>ISO 8601：</label>
                  <div class="result-value">
                    {{ timestampResult.iso }}
                    <el-button 
                      size="small" 
                      text 
                      @click="copyToClipboard(timestampResult.iso)"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </div>
                </div>
                
                <div class="result-item">
                  <label>相对时间：</label>
                  <div class="result-value">{{ timestampResult.relative }}</div>
                </div>
              </div>
              
              <div v-if="timestampError" class="error-message">
                <el-alert type="error" :title="timestampError" :closable="false" size="small" />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>日期时间 → 时间戳</span>
            </template>
            
            <div class="conversion-section">
              <div class="input-section">
                <label class="input-label">选择日期时间：</label>
                <el-date-picker
                  v-model="datetimeInput"
                  type="datetime"
                  placeholder="选择日期时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  @change="handleDatetimeInput"
                  style="width: 100%"
                />
              </div>
              
              <div class="input-section">
                <label class="input-label">或输入日期字符串：</label>
                <el-input
                  v-model="dateStringInput"
                  placeholder="如: 2024-01-15 12:30:00"
                  @input="handleDateStringInput"
                />
              </div>
              
              <div class="quick-actions">
                <el-button size="small" @click="useCurrentDatetime">使用当前时间</el-button>
                <el-button size="small" @click="pasteDatetime">粘贴</el-button>
              </div>
              
              <div v-if="datetimeResult" class="result-section">
                <div class="result-item">
                  <label>时间戳（秒）：</label>
                  <div class="result-value">
                    {{ datetimeResult.seconds }}
                    <el-button 
                      size="small" 
                      text 
                      @click="copyToClipboard(datetimeResult.seconds.toString())"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </div>
                </div>
                
                <div class="result-item">
                  <label>时间戳（毫秒）：</label>
                  <div class="result-value">
                    {{ datetimeResult.milliseconds }}
                    <el-button 
                      size="small" 
                      text 
                      @click="copyToClipboard(datetimeResult.milliseconds.toString())"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </div>
                </div>
                
                <div class="result-item">
                  <label>Unix时间戳：</label>
                  <div class="result-value">{{ datetimeResult.unix }}</div>
                </div>
                
                <div class="result-item">
                  <label>星期：</label>
                  <div class="result-value">{{ datetimeResult.weekday }}</div>
                </div>
              </div>
              
              <div v-if="datetimeError" class="error-message">
                <el-alert type="error" :title="datetimeError" :closable="false" size="small" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 时间计算 -->
      <el-card class="calculation-card">
        <template #header>
          <span>时间计算</span>
        </template>
        
        <div class="calculation-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="calc-input">
                <label>基准时间：</label>
                <el-date-picker
                  v-model="calcBaseTime"
                  type="datetime"
                  placeholder="选择基准时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  @change="handleCalculation"
                  style="width: 100%"
                />
              </div>
            </el-col>
            
            <el-col :span="4">
              <div class="calc-input">
                <label>操作：</label>
                <el-select v-model="calcOperation" @change="handleCalculation" style="width: 100%">
                  <el-option label="加" value="add" />
                  <el-option label="减" value="subtract" />
                </el-select>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="calc-input">
                <label>数值：</label>
                <el-input-number 
                  v-model="calcValue" 
                  :min="0"
                  @change="handleCalculation"
                  style="width: 100%"
                />
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="calc-input">
                <label>单位：</label>
                <el-select v-model="calcUnit" @change="handleCalculation" style="width: 100%">
                  <el-option label="秒" value="seconds" />
                  <el-option label="分钟" value="minutes" />
                  <el-option label="小时" value="hours" />
                  <el-option label="天" value="days" />
                  <el-option label="周" value="weeks" />
                  <el-option label="月" value="months" />
                  <el-option label="年" value="years" />
                </el-select>
              </div>
            </el-col>
          </el-row>
          
          <div v-if="calcResult" class="calc-result">
            <div class="result-item">
              <label>计算结果：</label>
              <div class="result-value">
                {{ calcResult.datetime }}
                <el-button 
                  size="small" 
                  text 
                  @click="copyToClipboard(calcResult.datetime)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div class="result-item">
              <label>时间戳：</label>
              <div class="result-value">
                {{ calcResult.timestamp }}
                <el-button 
                  size="small" 
                  text 
                  @click="copyToClipboard(calcResult.timestamp.toString())"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 批量转换 -->
      <el-card class="batch-card">
        <template #header>
          <span>批量转换</span>
        </template>
        
        <div class="batch-section">
          <div class="batch-input">
            <label>批量时间戳（每行一个）：</label>
            <el-input
              v-model="batchInput"
              type="textarea"
              :rows="6"
              placeholder="输入多个时间戳，每行一个..."
              @input="handleBatchConversion"
            />
          </div>
          
          <div v-if="batchResults.length" class="batch-results">
            <div class="batch-actions">
              <el-button @click="copyBatchResults">
                <el-icon><DocumentCopy /></el-icon>
                复制所有结果
              </el-button>
              <el-button @click="downloadBatchResults">
                <el-icon><Download /></el-icon>
                下载结果
              </el-button>
            </div>
            
            <el-table :data="batchResults" stripe style="width: 100%">
              <el-table-column prop="timestamp" label="时间戳" width="150" />
              <el-table-column prop="datetime" label="日期时间" />
              <el-table-column prop="relative" label="相对时间" width="120" />
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(scope.row.datetime)"
                  >
                    复制
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy,
  Download,
  Refresh
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const currentTimestamp = ref(Date.now())
const timestampInput = ref('')
const timestampUnit = ref('seconds')
const timestampResult = ref(null)
const timestampError = ref('')

const datetimeInput = ref('')
const dateStringInput = ref('')
const datetimeResult = ref(null)
const datetimeError = ref('')

const calcBaseTime = ref('')
const calcOperation = ref('add')
const calcValue = ref(1)
const calcUnit = ref('days')
const calcResult = ref(null)

const batchInput = ref('')
const batchResults = ref([])

let timer: number | null = null

// 计算属性
const currentDateTime = computed(() => {
  return new Date(currentTimestamp.value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

// 方法
const clearAll = () => {
  timestampInput.value = ''
  timestampResult.value = null
  timestampError.value = ''
  datetimeInput.value = ''
  dateStringInput.value = ''
  datetimeResult.value = null
  datetimeError.value = ''
  calcBaseTime.value = ''
  calcResult.value = null
  batchInput.value = ''
  batchResults.value = []
}

const refreshCurrentTime = () => {
  currentTimestamp.value = Date.now()
}

const handleTimestampInput = () => {
  if (!timestampInput.value.trim()) {
    timestampResult.value = null
    timestampError.value = ''
    return
  }

  try {
    let timestamp = parseInt(timestampInput.value.trim())
    
    if (isNaN(timestamp)) {
      throw new Error('请输入有效的数字')
    }

    // 转换为毫秒
    if (timestampUnit.value === 'seconds') {
      timestamp = timestamp * 1000
    }

    // 验证时间戳范围
    if (timestamp < 0 || timestamp > 8640000000000000) {
      throw new Error('时间戳超出有效范围')
    }

    const date = new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      throw new Error('无效的时间戳')
    }

    timestampResult.value = {
      local: date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      utc: date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      iso: date.toISOString(),
      relative: getRelativeTime(date)
    }
    
    timestampError.value = ''
    
    // 记录历史
    appStore.addHistory({
      toolId: 'timestamp',
      timestamp: Date.now(),
      input: timestampInput.value,
      output: timestampResult.value.local
    })
  } catch (error) {
    timestampError.value = (error as Error).message
    timestampResult.value = null
  }
}

const handleDatetimeInput = () => {
  if (!datetimeInput.value) {
    datetimeResult.value = null
    datetimeError.value = ''
    return
  }

  try {
    const date = new Date(datetimeInput.value)
    
    if (isNaN(date.getTime())) {
      throw new Error('无效的日期时间')
    }

    const timestamp = date.getTime()
    
    datetimeResult.value = {
      seconds: Math.floor(timestamp / 1000),
      milliseconds: timestamp,
      unix: Math.floor(timestamp / 1000),
      weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' })
    }
    
    datetimeError.value = ''
  } catch (error) {
    datetimeError.value = (error as Error).message
    datetimeResult.value = null
  }
}

const handleDateStringInput = () => {
  if (!dateStringInput.value.trim()) {
    datetimeResult.value = null
    datetimeError.value = ''
    return
  }

  try {
    const date = new Date(dateStringInput.value.trim())
    
    if (isNaN(date.getTime())) {
      throw new Error('无法解析的日期格式')
    }

    const timestamp = date.getTime()
    
    datetimeResult.value = {
      seconds: Math.floor(timestamp / 1000),
      milliseconds: timestamp,
      unix: Math.floor(timestamp / 1000),
      weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' })
    }
    
    datetimeInput.value = date.toISOString().slice(0, 19).replace('T', ' ')
    datetimeError.value = ''
  } catch (error) {
    datetimeError.value = (error as Error).message
    datetimeResult.value = null
  }
}

const handleCalculation = () => {
  if (!calcBaseTime.value || calcValue.value === null) {
    calcResult.value = null
    return
  }

  try {
    const baseDate = new Date(calcBaseTime.value)
    if (isNaN(baseDate.getTime())) {
      return
    }

    let resultDate = new Date(baseDate)
    const value = calcOperation.value === 'add' ? calcValue.value : -calcValue.value

    switch (calcUnit.value) {
      case 'seconds':
        resultDate.setSeconds(resultDate.getSeconds() + value)
        break
      case 'minutes':
        resultDate.setMinutes(resultDate.getMinutes() + value)
        break
      case 'hours':
        resultDate.setHours(resultDate.getHours() + value)
        break
      case 'days':
        resultDate.setDate(resultDate.getDate() + value)
        break
      case 'weeks':
        resultDate.setDate(resultDate.getDate() + value * 7)
        break
      case 'months':
        resultDate.setMonth(resultDate.getMonth() + value)
        break
      case 'years':
        resultDate.setFullYear(resultDate.getFullYear() + value)
        break
    }

    calcResult.value = {
      datetime: resultDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: Math.floor(resultDate.getTime() / 1000)
    }
  } catch (error) {
    calcResult.value = null
  }
}

const handleBatchConversion = () => {
  if (!batchInput.value.trim()) {
    batchResults.value = []
    return
  }

  const lines = batchInput.value.trim().split('\n')
  const results = []

  for (const line of lines) {
    const timestamp = line.trim()
    if (!timestamp) continue

    try {
      let ts = parseInt(timestamp)
      if (isNaN(ts)) continue

      // 假设小于13位的是秒，否则是毫秒
      if (timestamp.length <= 10) {
        ts = ts * 1000
      }

      const date = new Date(ts)
      if (isNaN(date.getTime())) continue

      results.push({
        timestamp: timestamp,
        datetime: date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relative: getRelativeTime(date)
      })
    } catch (error) {
      // 忽略错误的行
    }
  }

  batchResults.value = results
}

const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else if (seconds > 0) {
    return `${seconds}秒前`
  } else {
    return '刚刚'
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const useCurrentTimestamp = () => {
  timestampInput.value = Math.floor(Date.now() / 1000).toString()
  timestampUnit.value = 'seconds'
  handleTimestampInput()
}

const pasteTimestamp = async () => {
  try {
    const text = await navigator.clipboard.readText()
    timestampInput.value = text.trim()
    handleTimestampInput()
    ElMessage.success('已粘贴并转换')
  } catch {
    ElMessage.error('粘贴失败')
  }
}

const useCurrentDatetime = () => {
  const now = new Date()
  datetimeInput.value = now.toISOString().slice(0, 19).replace('T', ' ')
  handleDatetimeInput()
}

const pasteDatetime = async () => {
  try {
    const text = await navigator.clipboard.readText()
    dateStringInput.value = text.trim()
    handleDateStringInput()
    ElMessage.success('已粘贴并转换')
  } catch {
    ElMessage.error('粘贴失败')
  }
}

const copyBatchResults = async () => {
  try {
    const text = batchResults.value
      .map(result => `${result.timestamp} -> ${result.datetime}`)
      .join('\n')
    
    await navigator.clipboard.writeText(text)
    ElMessage.success('批量结果已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadBatchResults = () => {
  if (!batchResults.value.length) return

  const content = 'timestamp,datetime,relative\n' + 
    batchResults.value
      .map(result => `${result.timestamp},"${result.datetime}","${result.relative}"`)
      .join('\n')
  
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timestamp_batch_${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('批量结果下载完成')
}

// 生命周期
onMounted(() => {
  timer = setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.timestamp-tool {
  .current-time-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .current-time-display {
      .time-item {
        .time-label {
          display: block;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }
        
        .time-value {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 16px;
          color: var(--el-color-primary);
          background: var(--el-fill-color-extra-light);
          padding: 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }
    }
  }

  .conversion-section {
    .input-section {
      margin-bottom: 16px;
      
      .input-label {
        display: block;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }
    }
    
    .quick-actions {
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
    }
    
    .result-section {
      .result-item {
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        label {
          display: block;
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }
        
        .result-value {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          background: var(--el-fill-color-extra-light);
          padding: 8px 12px;
          border-radius: 4px;
          color: var(--el-text-color-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }
    }
    
    .error-message {
      margin-top: 16px;
    }
  }

  .calculation-card {
    margin-top: 20px;
    
    .calculation-section {
      .calc-input {
        label {
          display: block;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }
      }
      
      .calc-result {
        margin-top: 20px;
        padding: 16px;
        background: var(--el-fill-color-extra-light);
        border-radius: 8px;
        
        .result-item {
          margin-bottom: 12px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          label {
            display: block;
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin-bottom: 4px;
          }
          
          .result-value {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            color: var(--el-text-color-primary);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        }
      }
    }
  }

  .batch-card {
    margin-top: 20px;
    
    .batch-section {
      .batch-input {
        margin-bottom: 20px;
        
        label {
          display: block;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }
      }
      
      .batch-results {
        .batch-actions {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .timestamp-tool {
    .current-time-display {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }

    .calculation-section {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }

    .quick-actions {
      flex-direction: column;
    }

    .batch-actions {
      flex-direction: column;
    }
  }
}
</style>
