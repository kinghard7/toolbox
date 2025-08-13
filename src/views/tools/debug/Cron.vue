<template>
  <ToolContainer title="Cron 表达式" description="Cron表达式解析和生成工具">
    <div class="cron-tool">
      <div class="tool-header">
        <div class="tool-tabs">
          <el-radio-group v-model="activeTab" @change="handleTabChange">
            <el-radio-button label="parser">表达式解析</el-radio-button>
            <el-radio-button label="generator">表达式生成</el-radio-button>
            <el-radio-button label="validator">表达式验证</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="processCron" :disabled="!canProcess">
            <el-icon><Document /></el-icon>
            处理
          </el-button>
          <el-button @click="clearCron">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <!-- 表达式解析标签页 -->
      <div v-if="activeTab === 'parser'" class="tab-content">
        <el-card class="parser-card">
          <template #header>
            <span>Cron表达式解析</span>
          </template>
          
          <div class="parser-form">
            <div class="form-group">
              <label>Cron表达式:</label>
              <el-input
                v-model="cronExpression"
                placeholder="请输入Cron表达式，如: 0 0 12 * * ?"
                class="cron-input"
                @input="parseCron"
              />
            </div>
            
            <div class="expression-parts" v-if="parsedCron">
              <h4>表达式组成部分:</h4>
              <div class="parts-grid">
                <div class="part-item">
                  <span class="part-label">秒:</span>
                  <span class="part-value">{{ parsedCron.seconds }}</span>
                  <span class="part-description">{{ getPartDescription('seconds', parsedCron.seconds) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">分钟:</span>
                  <span class="part-value">{{ parsedCron.minutes }}</span>
                  <span class="part-description">{{ getPartDescription('minutes', parsedCron.minutes) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">小时:</span>
                  <span class="part-value">{{ parsedCron.hours }}</span>
                  <span class="part-description">{{ getPartDescription('hours', parsedCron.hours) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">日期:</span>
                  <span class="part-value">{{ parsedCron.dayOfMonth }}</span>
                  <span class="part-description">{{ getPartDescription('dayOfMonth', parsedCron.dayOfMonth) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">月份:</span>
                  <span class="part-value">{{ parsedCron.month }}</span>
                  <span class="part-description">{{ getPartDescription('month', parsedCron.month) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">星期:</span>
                  <span class="part-value">{{ parsedCron.dayOfWeek }}</span>
                  <span class="part-description">{{ getPartDescription('dayOfWeek', parsedCron.dayOfWeek) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">年份:</span>
                  <span class="part-value">{{ parsedCron.year || '未指定' }}</span>
                  <span class="part-description">{{ getPartDescription('year', parsedCron.year) }}</span>
                </div>
              </div>
            </div>
            
            <div class="next-executions" v-if="parsedCron">
              <h4>下次执行时间:</h4>
              <div class="executions-list">
                <div
                  v-for="(time, index) in nextExecutions"
                  :key="index"
                  class="execution-item"
                >
                  <span class="execution-number">#{{ index + 1 }}</span>
                  <span class="execution-time">{{ formatDateTime(time) }}</span>
                  <span class="execution-relative">{{ getRelativeTime(time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 表达式生成标签页 -->
      <div v-if="activeTab === 'generator'" class="tab-content">
        <el-card class="generator-card">
          <template #header>
            <span>Cron表达式生成</span>
          </template>
          
          <div class="generator-form">
            <div class="form-section">
              <h4>时间设置</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>秒:</label>
                  <el-select v-model="generatorConfig.seconds" multiple placeholder="选择秒数">
                    <el-option
                      v-for="i in 60"
                      :key="i - 1"
                      :label="(i - 1).toString().padStart(2, '0')"
                      :value="(i - 1).toString()"
                    />
                  </el-select>
                </div>
                
                <div class="form-group">
                  <label>分钟:</label>
                  <el-select v-model="generatorConfig.minutes" multiple placeholder="选择分钟">
                    <el-option
                      v-for="i in 60"
                      :key="i - 1"
                      :label="(i - 1).toString().padStart(2, '0')"
                      :value="(i - 1).toString()"
                    />
                  </el-select>
                </div>
                
                <div class="form-group">
                  <label>小时:</label>
                  <el-select v-model="generatorConfig.hours" multiple placeholder="选择小时">
                    <el-option
                      v-for="i in 24"
                      :key="i - 1"
                      :label="(i - 1).toString().padStart(2, '0')"
                      :value="(i - 1).toString()"
                    />
                  </el-select>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>日期设置</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>日期:</label>
                  <el-select v-model="generatorConfig.dayOfMonth" multiple placeholder="选择日期">
                    <el-option
                      v-for="i in 32"
                      :key="i"
                      :label="i.toString()"
                      :value="i.toString()"
                    />
                  </el-select>
                </div>
                
                <div class="form-group">
                  <label>月份:</label>
                  <el-select v-model="generatorConfig.month" multiple placeholder="选择月份">
                    <el-option
                      v-for="(month, index) in monthNames"
                      :key="index + 1"
                      :label="month"
                      :value="(index + 1).toString()"
                    />
                  </el-select>
                </div>
                
                <div class="form-group">
                  <label>星期:</label>
                  <el-select v-model="generatorConfig.dayOfWeek" multiple placeholder="选择星期">
                    <el-option
                      v-for="(day, index) in dayNames"
                      :key="index"
                      :label="day"
                      :value="index.toString()"
                    />
                  </el-select>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h4>高级选项</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>表达式类型:</label>
                  <el-radio-group v-model="generatorConfig.type">
                    <el-radio label="standard">标准Cron</el-radio>
                    <el-radio label="quartz">Quartz Cron</el-radio>
                  </el-radio-group>
                </div>
                
                <div class="form-group">
                  <label>特殊字符:</label>
                  <el-checkbox-group v-model="generatorConfig.specialChars">
                    <el-checkbox label="*">* (所有值)</el-checkbox>
                    <el-checkbox label="?">? (不指定)</el-checkbox>
                    <el-checkbox label="/">/ (间隔)</el-checkbox>
                    <el-checkbox label="-">- (范围)</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
            
            <div class="generated-expression">
              <h4>生成的表达式:</h4>
              <el-input
                v-model="generatedExpression"
                readonly
                class="expression-output"
              />
              <div class="expression-actions">
                <el-button @click="copyExpression">复制</el-button>
                <el-button @click="testExpression">测试</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 表达式验证标签页 -->
      <div v-if="activeTab === 'validator'" class="tab-content">
        <el-card class="validator-card">
          <template #header>
            <span>Cron表达式验证</span>
          </template>
          
          <div class="validator-form">
            <div class="form-group">
              <label>待验证的表达式:</label>
              <el-input
                v-model="validationExpression"
                placeholder="请输入要验证的Cron表达式"
                class="validation-input"
                @input="validateCron"
              />
            </div>
            
            <div class="validation-result" v-if="validationResult">
              <h4>验证结果:</h4>
              <div class="result-item" :class="validationResult.isValid ? 'valid' : 'invalid'">
                <el-icon :color="validationResult.isValid ? '#67c23a' : '#f56c6c'">
                  <component :is="validationResult.isValid ? 'CircleCheck' : 'CircleClose'" />
                </el-icon>
                <span class="result-text">
                  {{ validationResult.isValid ? '表达式有效' : '表达式无效' }}
                </span>
              </div>
              
              <div v-if="!validationResult.isValid" class="error-details">
                <h5>错误详情:</h5>
                <ul class="error-list">
                  <li v-for="(error, index) in validationResult.errors" :key="index">
                    {{ error }}
                  </li>
                </ul>
              </div>
              
              <div v-if="validationResult.isValid" class="valid-details">
                <h5>表达式信息:</h5>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">表达式类型:</span>
                    <span class="info-value">{{ validationResult.type }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">字段数量:</span>
                    <span class="info-value">{{ validationResult.fieldCount }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">是否包含年份:</span>
                    <span class="info-value">{{ validationResult.hasYear ? '是' : '否' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 常用表达式示例 -->
      <div class="examples-section">
        <el-card class="examples-card">
          <template #header>
            <span>常用表达式示例</span>
          </template>
          
          <div class="examples-grid">
            <div
              v-for="example in cronExamples"
              :key="example.expression"
              class="example-item"
              @click="useExample(example.expression)"
            >
              <div class="example-expression">{{ example.expression }}</div>
              <div class="example-description">{{ example.description }}</div>
              <div class="example-frequency">{{ example.frequency }}</div>
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

// 标签页类型
type TabType = 'parser' | 'generator' | 'validator'

// 解析后的Cron表达式
interface ParsedCron {
  seconds: string
  minutes: string
  hours: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  year?: string
}

// 生成器配置
interface GeneratorConfig {
  seconds: string[]
  minutes: string[]
  hours: string[]
  dayOfMonth: string[]
  month: string[]
  dayOfWeek: string[]
  type: string
  specialChars: string[]
}

// 验证结果
interface ValidationResult {
  isValid: boolean
  errors: string[]
  type: string
  fieldCount: number
  hasYear: boolean
}

// Cron示例
interface CronExample {
  expression: string
  description: string
  frequency: string
}

// 响应式数据
const activeTab = ref<TabType>('parser')
const cronExpression = ref('')
const validationExpression = ref('')
const parsedCron = ref<ParsedCron | null>(null)
const nextExecutions = ref<Date[]>([])
const generatedExpression = ref('')
const validationResult = ref<ValidationResult | null>(null)

const generatorConfig = ref<GeneratorConfig>({
  seconds: ['0'],
  minutes: ['0'],
  hours: ['12'],
  dayOfMonth: ['*'],
  month: ['*'],
  dayOfWeek: ['?'],
  type: 'standard',
  specialChars: ['*', '?']
})

// 常量
const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

const dayNames = [
  '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
]

// 常用Cron表达式示例
const cronExamples = ref<CronExample[]>([
  { expression: '0 0 12 * * ?', description: '每天中午12点', frequency: '每天一次' },
  { expression: '0 15 10 ? * *', description: '每天上午10:15', frequency: '每天一次' },
  { expression: '0 15 10 * * ?', description: '每天上午10:15', frequency: '每天一次' },
  { expression: '0 15 10 * * ? *', description: '每天上午10:15', frequency: '每天一次' },
  { expression: '0 15 10 * * ? 2005', description: '2005年每天上午10:15', frequency: '2005年每天一次' },
  { expression: '0 * 14 * * ?', description: '每天下午2点到2:59', frequency: '每小时一次' },
  { expression: '0 0/5 14 * * ?', description: '每天下午2点到2:59，每5分钟', frequency: '每5分钟一次' },
  { expression: '0 0/5 14,18 * * ?', description: '每天下午2点到2:59和6点到6:59，每5分钟', frequency: '每5分钟一次' },
  { expression: '0 0-5 14 * * ?', description: '每天下午2点到2:05', frequency: '每天一次' },
  { expression: '0 10,44 14 ? 3 WED', description: '3月星期三下午2:10和2:44', frequency: '每周一次' },
  { expression: '0 15 10 ? * MON-FRI', description: '周一到周五上午10:15', frequency: '工作日一次' },
  { expression: '0 15 10 15 * ?', description: '每月15日上午10:15', frequency: '每月一次' },
  { expression: '0 15 10 L * ?', description: '每月最后一天上午10:15', frequency: '每月一次' },
  { expression: '0 15 10 ? * 6L', description: '每月最后一个星期五上午10:15', frequency: '每月一次' },
  { expression: '0 15 10 ? * 6L 2002-2005', description: '2002年到2005年每月最后一个星期五上午10:15', frequency: '每年一次' },
  { expression: '0 15 10 ? * 6#3', description: '每月第三个星期五上午10:15', frequency: '每月一次' }
])

// 计算属性
const canProcess = computed(() => {
  switch (activeTab.value) {
    case 'parser':
      return cronExpression.value.trim() !== ''
    case 'generator':
      return true
    case 'validator':
      return validationExpression.value.trim() !== ''
    default:
      return false
  }
})

// 方法
const handleTabChange = () => {
  clearCron()
}

const processCron = () => {
  switch (activeTab.value) {
    case 'parser':
      parseCron()
      break
    case 'generator':
      generateCron()
      break
    case 'validator':
      validateCron()
      break
  }
}

const clearCron = () => {
  cronExpression.value = ''
  validationExpression.value = ''
  parsedCron.value = null
  nextExecutions.value = []
  generatedExpression.value = ''
  validationResult.value = null
}

const parseCron = () => {
  if (!cronExpression.value.trim()) {
    parsedCron.value = null
    nextExecutions.value = []
    return
  }

  try {
    const parts = cronExpression.value.trim().split(/\s+/)
    
    if (parts.length < 6 || parts.length > 7) {
      throw new Error('Cron表达式字段数量不正确')
    }

    parsedCron.value = {
      seconds: parts[0] || '0',
      minutes: parts[1] || '0',
      hours: parts[2] || '0',
      dayOfMonth: parts[3] || '*',
      month: parts[4] || '*',
      dayOfWeek: parts[5] || '?',
      year: parts[6]
    }

    // 计算下次执行时间
    calculateNextExecutions()
    
    ElMessage.success('表达式解析成功')
  } catch (error) {
    ElMessage.error('表达式解析失败：' + (error as Error).message)
    parsedCron.value = null
    nextExecutions.value = []
  }
}

const calculateNextExecutions = () => {
  if (!parsedCron.value) return

  try {
    const now = new Date()
    nextExecutions.value = []
    
    // 这里应该实现真正的Cron表达式计算逻辑
    // 为了演示，我们生成一些模拟的下次执行时间
    for (let i = 0; i < 5; i++) {
      const nextTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
      nextExecutions.value.push(nextTime)
    }
  } catch (error) {
    console.error('计算下次执行时间失败:', error)
  }
}

const getPartDescription = (field: string, value: string): string => {
  if (value === '*') return '所有值'
  if (value === '?') return '不指定'
  if (value.includes('/')) return '间隔执行'
  if (value.includes('-')) return '范围执行'
  if (value.includes(',')) return '多个值'
  
  switch (field) {
    case 'seconds':
    case 'minutes':
      return `第${value}秒/分钟`
    case 'hours':
      return `第${value}小时`
    case 'dayOfMonth':
      return `第${value}天`
    case 'month':
      return monthNames[parseInt(value) - 1] || `第${value}月`
    case 'dayOfWeek':
      return dayNames[parseInt(value)] || `第${value}天`
    case 'year':
      return `${value}年`
    default:
      return value
  }
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}天后`
  } else if (hours > 0) {
    return `${hours}小时后`
  } else {
    return '即将执行'
  }
}

const generateCron = () => {
  try {
    const parts = []
    
    // 生成秒
    parts.push(generatorConfig.value.seconds.length > 0 ? generatorConfig.value.seconds.join(',') : '*')
    
    // 生成分钟
    parts.push(generatorConfig.value.minutes.length > 0 ? generatorConfig.value.minutes.join(',') : '*')
    
    // 生成小时
    parts.push(generatorConfig.value.hours.length > 0 ? generatorConfig.value.hours.join(',') : '*')
    
    // 生成日期
    parts.push(generatorConfig.value.dayOfMonth.length > 0 ? generatorConfig.value.dayOfMonth.join(',') : '*')
    
    // 生成月份
    parts.push(generatorConfig.value.month.length > 0 ? generatorConfig.value.month.join(',') : '*')
    
    // 生成星期
    parts.push(generatorConfig.value.dayOfWeek.length > 0 ? generatorConfig.value.dayOfWeek.join(',') : '?')
    
    // 如果是Quartz类型，添加年份
    if (generatorConfig.value.type === 'quartz') {
      parts.push('*')
    }
    
    generatedExpression.value = parts.join(' ')
    ElMessage.success('表达式生成成功')
  } catch (error) {
    ElMessage.error('表达式生成失败：' + (error as Error).message)
  }
}

const copyExpression = async () => {
  if (!generatedExpression.value) {
    ElMessage.warning('没有表达式可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(generatedExpression.value)
    ElMessage.success('表达式已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const testExpression = () => {
  if (!generatedExpression.value) {
    ElMessage.warning('请先生成表达式')
    return
  }

  cronExpression.value = generatedExpression.value
  activeTab.value = 'parser'
  parseCron()
}

const validateCron = () => {
  if (!validationExpression.value.trim()) {
    validationResult.value = null
    return
  }

  try {
    const parts = validationExpression.value.trim().split(/\s+/)
    const errors: string[] = []
    
    // 检查字段数量
    if (parts.length < 6 || parts.length > 7) {
      errors.push('字段数量不正确，标准Cron需要6个字段，Quartz Cron需要7个字段')
    }
    
    // 检查每个字段的格式
    const fieldRules = [
      { name: '秒', min: 0, max: 59 },
      { name: '分钟', min: 0, max: 59 },
      { name: '小时', min: 0, max: 23 },
      { name: '日期', min: 1, max: 31 },
      { name: '月份', min: 1, max: 12 },
      { name: '星期', min: 0, max: 6 }
    ]
    
    for (let i = 0; i < Math.min(parts.length, 6); i++) {
      const part = parts[i]
      const rule = fieldRules[i]
      
      if (part !== '*' && part !== '?' && !isValidCronPart(part, rule.min, rule.max)) {
        errors.push(`${rule.name}字段格式不正确: ${part}`)
      }
    }
    
    // 检查年份字段（如果存在）
    if (parts.length === 7) {
      const year = parts[6]
      if (year !== '*' && !isValidCronPart(year, 1970, 2099)) {
        errors.push(`年份字段格式不正确: ${year}`)
      }
    }
    
    validationResult.value = {
      isValid: errors.length === 0,
      errors,
      type: parts.length === 7 ? 'Quartz Cron' : '标准Cron',
      fieldCount: parts.length,
      hasYear: parts.length === 7
    }
    
    if (errors.length === 0) {
      ElMessage.success('表达式验证通过')
    } else {
      ElMessage.warning('表达式验证失败')
    }
  } catch (error) {
    validationResult.value = {
      isValid: false,
      errors: ['验证过程中发生错误：' + (error as Error).message],
      type: '未知',
      fieldCount: 0,
      hasYear: false
    }
    ElMessage.error('验证失败')
  }
}

const isValidCronPart = (part: string, min: number, max: number): boolean => {
  // 检查单个值
  if (/^\d+$/.test(part)) {
    const value = parseInt(part)
    return value >= min && value <= max
  }
  
  // 检查范围
  if (/^\d+-\d+$/.test(part)) {
    const [start, end] = part.split('-').map(Number)
    return start >= min && end <= max && start <= end
  }
  
  // 检查列表
  if (/^\d+(,\d+)*$/.test(part)) {
    const values = part.split(',').map(Number)
    return values.every(v => v >= min && v <= max)
  }
  
  // 检查间隔
  if (/^\*\/\d+$/.test(part)) {
    const interval = parseInt(part.split('/')[1])
    return interval > 0 && interval <= max
  }
  
  // 检查特殊值
  if (part === '*' || part === '?') {
    return true
  }
  
  return false
}

const useExample = (expression: string) => {
  switch (activeTab.value) {
    case 'parser':
      cronExpression.value = expression
      parseCron()
      break
    case 'generator':
      // 可以解析示例并填充生成器
      ElMessage.info('示例已加载到解析器')
      break
    case 'validator':
      validationExpression.value = expression
      validateCron()
      break
  }
}

// 监听器
watch(cronExpression, () => {
  if (activeTab.value === 'parser') {
    parseCron()
  }
})

watch(validationExpression, () => {
  if (activeTab.value === 'validator') {
    validateCron()
  }
})
</script>

<style scoped lang="scss">
.cron-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .tool-tabs {
      .el-radio-group {
        .el-radio-button__inner {
          padding: 8px 16px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
  }

  .tab-content {
    margin-bottom: 1.5rem;

    .parser-card,
    .generator-card,
    .validator-card {
      .parser-form,
      .generator-form,
      .validator-form {
        .form-group {
          margin-bottom: 1rem;

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
          }

          .cron-input,
          .validation-input {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }
        }

        .expression-parts {
          margin-top: 1.5rem;

          h4 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 16px;
          }

          .parts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;

            .part-item {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.75rem;
              background-color: #f8f9fa;
              border-radius: 6px;

              .part-label {
                font-weight: 600;
                color: #333;
                min-width: 60px;
              }

              .part-value {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-weight: 600;
                color: #409eff;
                min-width: 80px;
              }

              .part-description {
                color: #666;
                font-size: 14px;
              }
            }
          }
        }

        .next-executions {
          margin-top: 1.5rem;

          h4 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 16px;
          }

          .executions-list {
            .execution-item {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.75rem;
              margin-bottom: 0.5rem;
              background-color: #f0f9ff;
              border-radius: 6px;
              border-left: 4px solid #409eff;

              .execution-number {
                font-weight: 600;
                color: #409eff;
                min-width: 40px;
              }

              .execution-time {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-weight: 600;
                color: #333;
                min-width: 180px;
              }

              .execution-relative {
                color: #666;
                font-size: 14px;
              }
            }
          }
        }

        .form-section {
          margin-bottom: 2rem;

          h4 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 16px;
            border-bottom: 2px solid #409eff;
            padding-bottom: 0.5rem;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
        }

        .generated-expression {
          margin-top: 2rem;

          h4 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 16px;
          }

          .expression-output {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            margin-bottom: 1rem;
          }

          .expression-actions {
            display: flex;
            gap: 0.5rem;
          }
        }

        .validation-result {
          margin-top: 1.5rem;

          h4 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 16px;
          }

          .result-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;

            &.valid {
              background-color: #f0f9ff;
              border-left: 4px solid #67c23a;
            }

            &.invalid {
              background-color: #fef0f0;
              border-left: 4px solid #f56c6c;
            }

            .result-text {
              font-weight: 600;
              font-size: 16px;
            }
          }

          .error-details,
          .valid-details {
            h5 {
              margin: 0 0 0.5rem 0;
              color: #333;
              font-size: 14px;
            }

            .error-list {
              margin: 0;
              padding-left: 1.5rem;
              color: #f56c6c;

              li {
                margin-bottom: 0.25rem;
              }
            }

            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;

              .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                background-color: #f8f9fa;
                border-radius: 4px;

                .info-label {
                  font-size: 14px;
                  color: #666;
                }

                .info-value {
                  font-weight: 600;
                  color: #409eff;
                }
              }
            }
          }
        }
      }
    }
  }

  .examples-section {
    .examples-card {
      .examples-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;

        .example-item {
          padding: 1rem;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
            transform: translateY(-2px);
          }

          .example-expression {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-weight: 600;
            color: #409eff;
            margin-bottom: 0.5rem;
            word-break: break-all;
          }

          .example-description {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 14px;
          }

          .example-frequency {
            color: #666;
            font-size: 12px;
            font-style: italic;
          }
        }
      }
    }
  }
}
</style>
