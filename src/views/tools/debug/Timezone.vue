<template>
  <ToolContainer title="时区转换" description="世界时区时间查询和转换工具">
    <div class="timezone-tool">
      <div class="tool-header">
        <div class="time-display">
          <div class="current-time">
            <span class="time-label">当前时间:</span>
            <span class="time-value">{{ currentTime }}</span>
          </div>
          <div class="current-timezone">
            <span class="timezone-label">本地时区:</span>
            <span class="timezone-value">{{ localTimezone }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="refreshTime">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="addCustomTimezone">
            <el-icon><Plus /></el-icon>
            添加时区
          </el-button>
        </div>
      </div>

      <div class="timezone-converter-section">
        <el-card class="converter-card">
          <template #header>
            <span>时区转换器</span>
          </template>
          
          <div class="converter-form">
            <div class="form-row">
              <div class="form-group">
                <label>源时区:</label>
                <el-select v-model="sourceTimezone" placeholder="选择源时区" @change="convertTime">
                  <el-option
                    v-for="tz in timezoneList"
                    :key="tz.value"
                    :label="tz.label"
                    :value="tz.value"
                  />
                </el-select>
              </div>
              
              <div class="form-group">
                <label>源时间:</label>
                <el-date-picker
                  v-model="sourceTime"
                  type="datetime"
                  placeholder="选择时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  @change="convertTime"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>目标时区:</label>
                <el-select v-model="targetTimezone" placeholder="选择目标时区" @change="convertTime">
                  <el-option
                    v-for="tz in timezoneList"
                    :key="tz.value"
                    :label="tz.label"
                    :value="tz.value"
                  />
                </el-select>
              </div>
              
              <div class="form-group">
                <label>转换结果:</label>
                <el-input
                  v-model="convertedTime"
                  readonly
                  placeholder="转换结果将显示在这里"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>时间差:</label>
                <el-input
                  v-model="timeDifference"
                  readonly
                  placeholder="时区差异"
                />
              </div>
              
              <div class="form-group">
                <label>操作:</label>
                <div class="form-actions">
                  <el-button @click="swapTimezones">交换时区</el-button>
                  <el-button @click="setCurrentTime">设为当前时间</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="world-clock-section">
        <el-card class="world-clock-card">
          <template #header>
            <span>世界时钟</span>
          </template>
          
          <div class="clock-grid">
            <div
              v-for="clock in worldClocks"
              :key="clock.timezone"
              class="clock-item"
              :class="{ 'is-local': clock.isLocal }"
            >
              <div class="clock-header">
                <span class="city-name">{{ clock.city }}</span>
                <div class="clock-actions">
                  <el-button
                    size="small"
                    type="danger"
                    @click="removeClock(clock.timezone)"
                    v-if="!clock.isLocal"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="clock-time">
                {{ clock.time }}
              </div>
              
              <div class="clock-date">
                {{ clock.date }}
              </div>
              
              <div class="clock-timezone">
                {{ clock.timezone }}
              </div>
              
              <div class="clock-offset">
                {{ clock.offset }}
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="timezone-info-section">
        <el-card class="info-card">
          <template #header>
            <span>时区信息</span>
          </template>
          
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">UTC时间:</span>
                <span class="info-value">{{ utcTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">GMT时间:</span>
                <span class="info-value">{{ gmtTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Unix时间戳:</span>
                <span class="info-value">{{ unixTimestamp }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ISO时间:</span>
                <span class="info-value">{{ isoTime }}</span>
              </div>
            </div>
            
            <div class="timezone-map">
              <h4>常用时区对照表</h4>
              <div class="map-grid">
                <div class="map-item" v-for="region in timezoneRegions" :key="region.name">
                  <h5>{{ region.name }}</h5>
                  <div class="region-timezones">
                    <div
                      v-for="tz in region.timezones"
                      :key="tz.value"
                      class="region-timezone"
                      @click="selectTimezone(tz.value)"
                    >
                      <span class="tz-name">{{ tz.name }}</span>
                      <span class="tz-offset">{{ tz.offset }}</span>
                    </div>
                  </div>
                </div>
              </div>
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
import { Refresh, Plus, Delete } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// 时区信息
interface TimezoneInfo {
  value: string
  label: string
  offset: string
  city: string
}

// 世界时钟
interface WorldClock {
  timezone: string
  city: string
  time: string
  date: string
  offset: string
  isLocal: boolean
}

// 时区区域
interface TimezoneRegion {
  name: string
  timezones: TimezoneInfo[]
}

// 响应式数据
const currentTime = ref('')
const localTimezone = ref('')
const sourceTimezone = ref('')
const targetTimezone = ref('')
const sourceTime = ref('')
const convertedTime = ref('')
const timeDifference = ref('')

const worldClocks = ref<WorldClock[]>([])
const timezoneList = ref<TimezoneInfo[]>([])

const options = ref({
  refreshInterval: 1000
})

let timeInterval: NodeJS.Timeout | null = null

// 时区区域数据
const timezoneRegions = ref<TimezoneRegion[]>([
  {
    name: '亚洲',
    timezones: [
      { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)', offset: 'UTC+8', city: '北京' },
      { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)', offset: 'UTC+9', city: '东京' },
      { value: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)', offset: 'UTC+9', city: '首尔' },
      { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)', offset: 'UTC+8', city: '新加坡' },
      { value: 'Asia/Dubai', label: '海湾标准时间 (UTC+4)', offset: 'UTC+4', city: '迪拜' },
      { value: 'Asia/Kolkata', label: '印度标准时间 (UTC+5:30)', offset: 'UTC+5:30', city: '孟买' }
    ]
  },
  {
    name: '欧洲',
    timezones: [
      { value: 'Europe/London', label: '格林威治标准时间 (UTC+0)', offset: 'UTC+0', city: '伦敦' },
      { value: 'Europe/Paris', label: '中欧时间 (UTC+1)', offset: 'UTC+1', city: '巴黎' },
      { value: 'Europe/Berlin', label: '中欧时间 (UTC+1)', offset: 'UTC+1', city: '柏林' },
      { value: 'Europe/Moscow', label: '莫斯科时间 (UTC+3)', offset: 'UTC+3', city: '莫斯科' },
      { value: 'Europe/Rome', label: '中欧时间 (UTC+1)', offset: 'UTC+1', city: '罗马' }
    ]
  },
  {
    name: '北美洲',
    timezones: [
      { value: 'America/New_York', label: '东部时间 (UTC-5)', offset: 'UTC-5', city: '纽约' },
      { value: 'America/Chicago', label: '中部时间 (UTC-6)', offset: 'UTC-6', city: '芝加哥' },
      { value: 'America/Denver', label: '山地时间 (UTC-7)', offset: 'UTC-7', city: '丹佛' },
      { value: 'America/Los_Angeles', label: '太平洋时间 (UTC-8)', offset: 'UTC-8', city: '洛杉矶' },
      { value: 'America/Toronto', label: '东部时间 (UTC-5)', offset: 'UTC-5', city: '多伦多' }
    ]
  },
  {
    name: '大洋洲',
    timezones: [
      { value: 'Australia/Sydney', label: '澳大利亚东部时间 (UTC+10)', offset: 'UTC+10', city: '悉尼' },
      { value: 'Australia/Melbourne', label: '澳大利亚东部时间 (UTC+10)', offset: 'UTC+10', city: '墨尔本' },
      { value: 'Pacific/Auckland', label: '新西兰标准时间 (UTC+12)', offset: 'UTC+12', city: '奥克兰' }
    ]
  }
])

// 计算属性
const utcTime = computed(() => {
  return new Date().toUTCString()
})

const gmtTime = computed(() => {
  return new Date().toGMTString()
})

const unixTimestamp = computed(() => {
  return Math.floor(Date.now() / 1000)
})

const isoTime = computed(() => {
  return new Date().toISOString()
})

// 方法
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  
  localTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // 更新世界时钟
  updateWorldClocks()
}

const updateWorldClocks = () => {
  worldClocks.value = worldClocks.value.map(clock => {
    try {
      const time = new Date().toLocaleTimeString('zh-CN', {
        hour12: false,
        timeZone: clock.timezone
      })
      
      const date = new Date().toLocaleDateString('zh-CN', {
        timeZone: clock.timezone
      })
      
      return { ...clock, time, date }
    } catch (error) {
      return clock
    }
  })
}

const refreshTime = () => {
  updateTime()
  ElMessage.success('时间已刷新')
}

const convertTime = () => {
  if (!sourceTime.value || !sourceTimezone.value || !targetTimezone.value) {
    return
  }

  try {
    // 创建源时区的时间
    const sourceDate = new Date(sourceTime.value)
    
    // 获取源时区的偏移量
    const sourceOffset = getTimezoneOffset(sourceTimezone.value)
    const targetOffset = getTimezoneOffset(targetTimezone.value)
    
    // 计算时区差异（分钟）
    const offsetDiff = (targetOffset - sourceOffset) * 60
    
    // 转换时间
    const convertedDate = new Date(sourceDate.getTime() + offsetDiff * 60 * 1000)
    
    convertedTime.value = convertedDate.toLocaleString('zh-CN', {
      timeZone: targetTimezone.value,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    // 计算时间差
    const hours = Math.floor(offsetDiff / 60)
    const minutes = offsetDiff % 60
    const sign = offsetDiff >= 0 ? '+' : ''
    timeDifference.value = `${sign}${hours}:${minutes.toString().padStart(2, '0')}`
    
  } catch (error) {
    ElMessage.error('时区转换失败')
  }
}

const getTimezoneOffset = (timezone: string): number => {
  try {
    const date = new Date()
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    const targetTime = new Date(utcTime).toLocaleString('en-US', { timeZone: timezone })
    const targetDate = new Date(targetTime)
    return (targetDate.getTime() - utcTime) / (1000 * 60 * 60)
  } catch {
    return 0
  }
}

const swapTimezones = () => {
  const temp = sourceTimezone.value
  sourceTimezone.value = targetTimezone.value
  targetTimezone.value = temp
  convertTime()
}

const setCurrentTime = () => {
  sourceTime.value = new Date().toISOString().slice(0, 19).replace('T', ' ')
  convertTime()
}

const addCustomTimezone = () => {
  // 这里可以添加自定义时区的逻辑
  ElMessage.info('自定义时区功能开发中')
}

const removeClock = (timezone: string) => {
  worldClocks.value = worldClocks.value.filter(clock => clock.timezone !== timezone)
  ElMessage.success('时钟已移除')
}

const selectTimezone = (timezone: string) => {
  if (!sourceTimezone.value) {
    sourceTimezone.value = timezone
  } else if (!targetTimezone.value) {
    targetTimezone.value = timezone
  } else {
    sourceTimezone.value = timezone
  }
  convertTime()
}

const initializeTimezones = () => {
  // 构建时区列表
  timezoneList.value = timezoneRegions.value.flatMap(region => region.timezones)
  
  // 添加本地时区
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (!timezoneList.value.find(tz => tz.value === localTz)) {
    timezoneList.value.unshift({
      value: localTz,
      label: `本地时区 (${localTz})`,
      offset: '本地',
      city: '本地'
    })
  }
  
  // 设置默认值
  sourceTimezone.value = localTz
  targetTimezone.value = 'UTC'
  
  // 初始化世界时钟
  worldClocks.value = [
    {
      timezone: localTz,
      city: '本地',
      time: '',
      date: '',
      offset: '本地',
      isLocal: true
    },
    {
      timezone: 'UTC',
      city: 'UTC',
      time: '',
      date: '',
      offset: 'UTC+0',
      isLocal: false
    },
    {
      timezone: 'America/New_York',
      city: '纽约',
      time: '',
      date: '',
      offset: 'UTC-5',
      isLocal: false
    },
    {
      timezone: 'Europe/London',
      city: '伦敦',
      time: '',
      date: '',
      offset: 'UTC+0',
      isLocal: false
    },
    {
      timezone: 'Asia/Tokyo',
      city: '东京',
      time: '',
      date: '',
      offset: 'UTC+9',
      isLocal: false
    }
  ]
  
  // 设置当前时间
  setCurrentTime()
}

// 生命周期
onMounted(() => {
  initializeTimezones()
  updateTime()
  
  // 启动定时器
  timeInterval = setInterval(updateTime, options.value.refreshInterval)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped lang="scss">
.timezone-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .time-display {
      .current-time,
      .current-timezone {
        margin-bottom: 0.5rem;

        .time-label,
        .timezone-label {
          font-weight: 600;
          color: #333;
          margin-right: 0.5rem;
        }

        .time-value {
          font-size: 18px;
          font-weight: 600;
          color: #409eff;
        }

        .timezone-value {
          font-size: 14px;
          color: #67c23a;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
  }

  .timezone-converter-section {
    margin-bottom: 1.5rem;

    .converter-card {
      .converter-form {
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;

          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }

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

  .world-clock-section {
    margin-bottom: 1.5rem;

    .world-clock-card {
      .clock-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;

        .clock-item {
          padding: 1rem;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          text-align: center;
          transition: all 0.3s ease;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          &.is-local {
            border-color: #409eff;
            background-color: #f0f9ff;
          }

          .clock-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;

            .city-name {
              font-weight: 600;
              color: #333;
              font-size: 16px;
            }
          }

          .clock-time {
            font-size: 24px;
            font-weight: 700;
            color: #409eff;
            margin-bottom: 0.5rem;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }

          .clock-date {
            font-size: 14px;
            color: #666;
            margin-bottom: 0.5rem;
          }

          .clock-timezone {
            font-size: 12px;
            color: #999;
            margin-bottom: 0.25rem;
          }

          .clock-offset {
            font-size: 12px;
            color: #67c23a;
            font-weight: 600;
          }
        }
      }
    }
  }

  .timezone-info-section {
    .info-card {
      .info-content {
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;

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
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
          }
        }

        .timezone-map {
          h4 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 18px;
          }

          .map-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;

            .map-item {
              h5 {
                margin: 0 0 1rem 0;
                color: #333;
                font-size: 16px;
                border-bottom: 2px solid #409eff;
                padding-bottom: 0.5rem;
              }

              .region-timezones {
                .region-timezone {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 0.5rem;
                  margin-bottom: 0.25rem;
                  border-radius: 4px;
                  cursor: pointer;
                  transition: background-color 0.2s ease;

                  &:hover {
                    background-color: #f0f9ff;
                  }

                  .tz-name {
                    font-size: 14px;
                    color: #333;
                  }

                  .tz-offset {
                    font-size: 12px;
                    color: #67c23a;
                    font-weight: 600;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
