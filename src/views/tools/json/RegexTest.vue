<template>
  <ToolContainer title="正则表达式测试器" description="正则匹配测试和高亮显示">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="regex-test-tool">
      <!-- 正则表达式输入 -->
      <el-card class="regex-card">
        <template #header>
          <span>正则表达式</span>
        </template>
        
        <div class="regex-input-section">
          <div class="regex-input-row">
            <el-input
              v-model="regexPattern"
              placeholder="请输入正则表达式..."
              class="regex-input"
              @input="handleRegexChange"
            >
              <template #prepend>/</template>
              <template #append>/{{ regexFlags }}</template>
            </el-input>
          </div>
          
          <div class="flags-section">
            <label class="flags-label">修饰符：</label>
            <div class="flags-checkboxes">
              <el-checkbox v-model="flags.global" @change="updateFlags">全局匹配 (g)</el-checkbox>
              <el-checkbox v-model="flags.ignoreCase" @change="updateFlags">忽略大小写 (i)</el-checkbox>
              <el-checkbox v-model="flags.multiline" @change="updateFlags">多行模式 (m)</el-checkbox>
            </div>
          </div>
          
          <!-- 正则表达式状态 -->
          <div class="regex-status">
            <el-alert
              v-if="regexError"
              type="error"
              :title="regexError"
              :closable="false"
              size="small"
            />
            <el-alert
              v-else-if="regexPattern"
              type="success"
              title="正则表达式语法正确"
              :closable="false"
              size="small"
            />
          </div>
        </div>
      </el-card>

      <!-- 测试文本和结果 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>测试文本</span>
                <div class="header-actions">
                  <el-button size="small" @click="pasteTestText">
                    <el-icon><DocumentCopy /></el-icon>
                    粘贴
                  </el-button>
                  <el-button size="small" @click="loadSampleText">
                    <el-icon><Document /></el-icon>
                    示例
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-input
              v-model="testText"
              type="textarea"
              :rows="12"
              placeholder="请输入要测试的文本..."
              @input="handleTextChange"
            />
            
            <div class="text-info">
              <el-text size="small" type="info">
                字符数：{{ testText.length }} | 行数：{{ testText.split('\n').length }}
              </el-text>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>匹配结果 ({{ matches.length }}个)</span>
                <div class="header-actions">
                  <el-button 
                    size="small" 
                    :disabled="!matches.length"
                    @click="copyMatches"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                    复制结果
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="!testText || !regexPattern" class="empty-state">
              <el-icon class="empty-icon"><Search /></el-icon>
              <p>请输入正则表达式和测试文本</p>
            </div>
            
            <div v-else-if="regexError" class="error-state">
              <el-icon class="error-icon"><Warning /></el-icon>
              <p>正则表达式有误</p>
            </div>
            
            <div v-else-if="!matches.length" class="no-match-state">
              <el-icon class="no-match-icon"><Close /></el-icon>
              <p>没有找到匹配项</p>
            </div>
            
            <div v-else class="matches-list">
              <div 
                v-for="(match, index) in matches" 
                :key="index"
                class="match-item"
              >
                <div class="match-header">
                  <span class="match-index">匹配 {{ index + 1 }}</span>
                  <span class="match-position">位置: {{ match.index }}</span>
                </div>
                
                <div class="match-content">
                  <el-input 
                    :model-value="match[0]" 
                    readonly 
                    size="small"
                  />
                </div>
                
                <div v-if="match.length > 1" class="match-groups">
                  <div 
                    v-for="(group, groupIndex) in match.slice(1)" 
                    :key="groupIndex"
                    class="group-item"
                  >
                    <span class="group-label">分组{{ groupIndex + 1 }}:</span>
                    <span class="group-value">{{ group || '(无匹配)' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 常用正则表达式 -->
      <el-card class="patterns-card">
        <template #header>
          <span>常用正则表达式</span>
        </template>
        
        <div class="patterns-grid">
          <div 
            v-for="pattern in commonPatterns" 
            :key="pattern.name"
            class="pattern-item"
            @click="applyPattern(pattern)"
          >
            <div class="pattern-name">{{ pattern.name }}</div>
            <div class="pattern-regex">{{ pattern.regex }}</div>
            <div class="pattern-desc">{{ pattern.description }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy,
  Document,
  Search,
  Warning,
  Close
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const regexPattern = ref('')
const testText = ref('')
const regexError = ref('')
const matches = ref<RegExpMatchArray[]>([])

const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false
})

// 计算属性
const regexFlags = computed(() => {
  let flagStr = ''
  if (flags.value.global) flagStr += 'g'
  if (flags.value.ignoreCase) flagStr += 'i'
  if (flags.value.multiline) flagStr += 'm'
  return flagStr
})

// 常用正则表达式
const commonPatterns = [
  { name: '数字', regex: '\\d+', description: '匹配一个或多个数字' },
  { name: '邮箱地址', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '匹配邮箱地址' },
  { name: '手机号码', regex: '1[3-9]\\d{9}', description: '匹配中国大陆手机号' },
  { name: 'IP地址', regex: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)', description: '匹配IPv4地址' },
  { name: 'URL链接', regex: 'https?:\\/\\/[^\\s]+', description: '匹配HTTP/HTTPS链接' },
  { name: '中文字符', regex: '[\\u4e00-\\u9fa5]+', description: '匹配中文字符' },
  { name: '单词', regex: '\\w+', description: '匹配单词字符' },
  { name: '空白字符', regex: '\\s+', description: '匹配空白字符' }
]

// 方法
const clearAll = () => {
  regexPattern.value = ''
  testText.value = ''
  matches.value = []
  regexError.value = ''
}

const updateFlags = () => {
  handleRegexChange()
}

const handleRegexChange = () => {
  if (!regexPattern.value) {
    regexError.value = ''
    matches.value = []
    return
  }

  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value)
    regexError.value = ''
    performMatch()
  } catch (error) {
    regexError.value = (error as Error).message
    matches.value = []
  }
}

const handleTextChange = () => {
  if (regexPattern.value && !regexError.value) {
    performMatch()
  }
}

const performMatch = () => {
  if (!testText.value || !regexPattern.value || regexError.value) {
    matches.value = []
    return
  }

  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value)
    const allMatches: RegExpMatchArray[] = []
    
    if (flags.value.global) {
      let match
      while ((match = regex.exec(testText.value)) !== null) {
        allMatches.push(match)
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testText.value)
      if (match) {
        allMatches.push(match)
      }
    }
    
    matches.value = allMatches
    
    // 记录历史
    if (allMatches.length > 0) {
      appStore.addHistory({
        toolId: 'regex-test',
        timestamp: Date.now(),
        input: { regex: regexPattern.value, text: testText.value },
        output: allMatches.map(m => m[0])
      })
    }
  } catch (error) {
    matches.value = []
  }
}

const copyMatches = async () => {
  try {
    const matchTexts = matches.value.map((match, index) => 
      `匹配 ${index + 1}: ${match[0]} (位置: ${match.index})`
    ).join('\n')
    
    await navigator.clipboard.writeText(matchTexts)
    ElMessage.success('匹配结果已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const pasteTestText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    testText.value = text
    ElMessage.success('已从剪贴板粘贴文本')
  } catch {
    ElMessage.error('粘贴失败')
  }
}

const loadSampleText = () => {
  testText.value = `Hello World! 123
联系方式：
邮箱：example@test.com, sample@demo.org
手机：13800000000, 15900000000
网站：https://www.example.com, http://demo.org
日期：2024-01-15, 2023-12-31
IP地址：192.168.1.1, 10.0.0.1`
  ElMessage.success('已加载示例文本')
}

const applyPattern = (pattern: any) => {
  regexPattern.value = pattern.regex
  ElMessage.success(`已应用正则表达式：${pattern.name}`)
}

// 监听变化
watch([regexPattern, testText], () => {
  handleRegexChange()
}, { immediate: true })
</script>

<style lang="scss" scoped>
.regex-test-tool {
  .regex-card {
    margin-bottom: 20px;
    
    .regex-input-section {
      .regex-input-row {
        margin-bottom: 16px;
        
        .regex-input {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
      }
      
      .flags-section {
        margin-bottom: 16px;
        
        .flags-label {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-right: 12px;
        }
        
        .flags-checkboxes {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
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

  .text-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  .empty-state,
  .error-state,
  .no-match-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--el-text-color-secondary);
    
    .empty-icon,
    .error-icon,
    .no-match-icon {
      font-size: 48px;
      color: var(--el-text-color-placeholder);
      margin-bottom: 16px;
    }
    
    .error-icon {
      color: var(--el-color-danger);
    }
  }

  .matches-list {
    max-height: 400px;
    overflow-y: auto;
    
    .match-item {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .match-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .match-index {
          font-weight: 500;
          color: var(--el-color-primary);
        }
        
        .match-position {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
      
      .match-content {
        margin-bottom: 12px;
        
        :deep(.el-input__inner) {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
      }
      
      .match-groups {
        .group-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .group-label {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            min-width: 50px;
          }
          
          .group-value {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 12px;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }

  .patterns-card {
    margin-top: 20px;
    
    .patterns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
      
      .pattern-item {
        padding: 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
        
        .pattern-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }
        
        .pattern-regex {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          background: var(--el-fill-color-extra-light);
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          color: var(--el-color-primary);
          margin-bottom: 8px;
          word-break: break-all;
        }
        
        .pattern-desc {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          line-height: 1.4;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .regex-test-tool {
    .regex-card {
      .flags-section {
        .flags-checkboxes {
          flex-direction: column;
          gap: 8px;
        }
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

    .patterns-card {
      .patterns-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
