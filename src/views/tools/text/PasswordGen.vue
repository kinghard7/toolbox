<template>
  <ToolContainer title="随机字符串/密码生成器" description="生成安全的随机密码和字符串">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="password-gen-tool">
      <!-- 配置选项 -->
      <el-card class="options-card">
        <template #header>
          <span>生成配置</span>
        </template>
        
        <div class="options-grid">
          <div class="option-group">
            <label class="option-label">密码长度：</label>
            <el-input-number 
              v-model="passwordLength" 
              :min="4" 
              :max="128" 
              :step="1"
              size="small"
              style="width: 120px"
            />
          </div>
          
          <div class="option-group">
            <label class="option-label">生成数量：</label>
            <el-input-number 
              v-model="generateCount" 
              :min="1" 
              :max="100" 
              :step="1"
              size="small"
              style="width: 120px"
            />
          </div>
        </div>
        
        <el-divider />
        
        <div class="character-options">
          <div class="options-row">
            <el-checkbox v-model="includeUppercase">大写字母 (A-Z)</el-checkbox>
            <el-checkbox v-model="includeLowercase">小写字母 (a-z)</el-checkbox>
            <el-checkbox v-model="includeNumbers">数字 (0-9)</el-checkbox>
            <el-checkbox v-model="includeSymbols">特殊符号</el-checkbox>
          </div>
          
          <div class="options-row">
            <el-checkbox v-model="excludeSimilar">排除相似字符 (0oO1lI)</el-checkbox>
            <el-checkbox v-model="excludeAmbiguous">排除歧义字符</el-checkbox>
          </div>
        </div>
        
        <div v-if="customCharsEnabled" class="custom-chars">
          <label class="option-label">自定义字符集：</label>
          <el-input 
            v-model="customChars" 
            placeholder="输入自定义字符..."
            clearable
          />
        </div>
        
        <div class="actions-row">
          <el-button type="primary" @click="generatePasswords">
            <el-icon><Refresh /></el-icon>
            生成密码
          </el-button>
          <el-button @click="toggleCustomChars">
            <el-icon><Setting /></el-icon>
            {{ customCharsEnabled ? '关闭' : '开启' }}自定义字符
          </el-button>
        </div>
      </el-card>

      <!-- 生成结果 -->
      <el-card class="results-card">
        <template #header>
          <div class="card-header">
            <span>生成结果</span>
            <div class="header-actions">
              <el-button 
                size="small" 
                :disabled="!generatedPasswords.length"
                @click="copyAllPasswords"
              >
                <el-icon><DocumentCopy /></el-icon>
                复制全部
              </el-button>
              <el-button 
                size="small" 
                :disabled="!generatedPasswords.length"
                @click="downloadPasswords"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-if="!generatedPasswords.length" class="empty-state">
          <el-icon class="empty-icon"><Key /></el-icon>
          <p>点击"生成密码"按钮开始生成</p>
        </div>
        
        <div v-else class="passwords-list">
          <div 
            v-for="(password, index) in generatedPasswords" 
            :key="index"
            class="password-item"
          >
            <div class="password-content">
              <el-input 
                :model-value="password.value" 
                readonly 
                class="password-input"
              >
                <template #append>
                  <el-button @click="copyPassword(password.value)">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
            
            <div class="password-info">
              <el-tag size="small" type="info">长度: {{ password.value.length }}</el-tag>
              <el-tag 
                size="small" 
                :type="getStrengthTagType(password.strength.level)"
              >
                强度: {{ getStrengthText(password.strength.level) }}
              </el-tag>
              <el-tag size="small">评分: {{ password.strength.score }}/8</el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 密码强度分析 -->
      <el-card v-if="selectedPassword" class="analysis-card">
        <template #header>
          <span>密码强度分析</span>
        </template>
        
        <div class="strength-analysis">
          <el-progress 
            :percentage="(selectedPassword.strength.score / 8) * 100"
            :color="getProgressColor(selectedPassword.strength.level)"
            :status="getProgressStatus(selectedPassword.strength.level)"
          />
          
          <div class="strength-details">
            <h4>安全建议：</h4>
            <ul v-if="selectedPassword.strength.suggestions.length">
              <li v-for="suggestion in selectedPassword.strength.suggestions" :key="suggestion">
                {{ suggestion }}
              </li>
            </ul>
            <p v-else class="success-text">
              <el-icon><CircleCheck /></el-icon>
              密码强度很好！
            </p>
          </div>
        </div>
      </el-card>

      <!-- 预设模板 -->
      <el-card class="templates-card">
        <template #header>
          <span>常用模板</span>
        </template>
        
        <div class="templates-grid">
          <el-button 
            v-for="template in templates" 
            :key="template.name"
            @click="applyTemplate(template)"
            class="template-button"
          >
            <div class="template-content">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
          </el-button>
        </div>
      </el-card>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { RandomTool } from '@/utils/format'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy,
  Download,
  Refresh,
  Setting,
  Key,
  CircleCheck
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const passwordLength = ref(12)
const generateCount = ref(5)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(false)
const excludeSimilar = ref(true)
const excludeAmbiguous = ref(false)
const customCharsEnabled = ref(false)
const customChars = ref('')

const generatedPasswords = ref<Array<{
  value: string
  strength: ReturnType<typeof RandomTool.checkPasswordStrength>
}>>([])

// 计算属性
const selectedPassword = computed(() => {
  return generatedPasswords.value.length > 0 ? generatedPasswords.value[0] : null
})

// 预设模板
const templates = [
  {
    name: '简单密码',
    description: '8位，字母+数字',
    config: {
      length: 8,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeSimilar: false
    }
  },
  {
    name: '标准密码',
    description: '12位，包含符号',
    config: {
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true
    }
  },
  {
    name: '高强度密码',
    description: '16位，全字符',
    config: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true
    }
  },
  {
    name: 'PIN码',
    description: '6位纯数字',
    config: {
      length: 6,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      excludeSimilar: false
    }
  },
  {
    name: '用户名',
    description: '8位字母',
    config: {
      length: 8,
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false,
      excludeSimilar: false
    }
  }
]

// 方法
const clearAll = () => {
  generatedPasswords.value = []
}

const toggleCustomChars = () => {
  customCharsEnabled.value = !customCharsEnabled.value
  if (!customCharsEnabled.value) {
    customChars.value = ''
  }
}

const generatePasswords = () => {
  if (!includeUppercase.value && !includeLowercase.value && 
      !includeNumbers.value && !includeSymbols.value && 
      !customChars.value) {
    ElMessage.warning('请至少选择一种字符类型')
    return
  }

  try {
    const passwords = []
    
    for (let i = 0; i < generateCount.value; i++) {
      const password = RandomTool.generateString(passwordLength.value, {
        includeUppercase: includeUppercase.value,
        includeLowercase: includeLowercase.value,
        includeNumbers: includeNumbers.value,
        includeSymbols: includeSymbols.value,
        excludeSimilar: excludeSimilar.value,
        customChars: customChars.value || undefined
      })
      
      const strength = RandomTool.checkPasswordStrength(password)
      
      passwords.push({
        value: password,
        strength
      })
    }
    
    generatedPasswords.value = passwords
    
    // 记录历史
    appStore.addHistory({
      toolId: 'password-gen',
      timestamp: Date.now(),
      input: {
        length: passwordLength.value,
        count: generateCount.value,
        options: {
          includeUppercase: includeUppercase.value,
          includeLowercase: includeLowercase.value,
          includeNumbers: includeNumbers.value,
          includeSymbols: includeSymbols.value,
          excludeSimilar: excludeSimilar.value
        }
      },
      output: passwords.map(p => p.value)
    })
    
    ElMessage.success(`成功生成 ${passwords.length} 个密码`)
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}

const copyPassword = async (password: string) => {
  try {
    await navigator.clipboard.writeText(password)
    ElMessage.success('密码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyAllPasswords = async () => {
  try {
    const allPasswords = generatedPasswords.value.map(p => p.value).join('\n')
    await navigator.clipboard.writeText(allPasswords)
    ElMessage.success('所有密码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadPasswords = () => {
  if (!generatedPasswords.value.length) return

  const content = generatedPasswords.value
    .map((p, index) => `${index + 1}. ${p.value} (强度: ${getStrengthText(p.strength.level)})`)
    .join('\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `passwords_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('密码文件下载完成')
}

const applyTemplate = (template: any) => {
  passwordLength.value = template.config.length
  includeUppercase.value = template.config.uppercase
  includeLowercase.value = template.config.lowercase
  includeNumbers.value = template.config.numbers
  includeSymbols.value = template.config.symbols
  excludeSimilar.value = template.config.excludeSimilar
  
  ElMessage.success(`已应用模板：${template.name}`)
}

const getStrengthText = (level: string): string => {
  const map = {
    weak: '弱',
    fair: '一般',
    good: '良好',
    strong: '强'
  }
  return map[level as keyof typeof map] || '未知'
}

const getStrengthTagType = (level: string): string => {
  const map = {
    weak: 'danger',
    fair: 'warning',
    good: 'success',
    strong: 'success'
  }
  return map[level as keyof typeof map] || 'info'
}

const getProgressColor = (level: string): string => {
  const map = {
    weak: '#f56c6c',
    fair: '#e6a23c',
    good: '#67c23a',
    strong: '#409eff'
  }
  return map[level as keyof typeof map] || '#909399'
}

const getProgressStatus = (level: string): string => {
  return level === 'strong' ? 'success' : undefined
}
</script>

<style lang="scss" scoped>
.password-gen-tool {
  .options-card {
    margin-bottom: 20px;
    
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
      
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
    
    .character-options {
      .options-row {
        display: flex;
        gap: 20px;
        margin-bottom: 12px;
        flex-wrap: wrap;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .custom-chars {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      
      .option-label {
        font-weight: 500;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }
    
    .actions-row {
      margin-top: 20px;
      display: flex;
      gap: 12px;
    }
  }

  .results-card {
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
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--el-text-color-secondary);
      
      .empty-icon {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }
    }
    
    .passwords-list {
      .password-item {
        margin-bottom: 16px;
        padding: 16px;
        background: var(--el-fill-color-extra-light);
        border-radius: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .password-content {
          margin-bottom: 12px;
          
          .password-input {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          }
        }
        
        .password-info {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }
    }
  }

  .analysis-card {
    margin-bottom: 20px;
    
    .strength-analysis {
      .strength-details {
        margin-top: 20px;
        
        h4 {
          margin: 0 0 12px 0;
          color: var(--el-text-color-primary);
        }
        
        ul {
          margin: 0;
          padding-left: 20px;
          color: var(--el-text-color-regular);
          
          li {
            margin-bottom: 6px;
          }
        }
        
        .success-text {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--el-color-success);
          margin: 0;
        }
      }
    }
  }

  .templates-card {
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      
      .template-button {
        height: auto;
        padding: 16px;
        text-align: left;
        
        .template-content {
          .template-name {
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .template-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .password-gen-tool {
    .options-card {
      .options-grid {
        grid-template-columns: 1fr;
      }
      
      .character-options {
        .options-row {
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }
      }
      
      .custom-chars {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      
      .actions-row {
        flex-direction: column;
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

    .templates-card {
      .templates-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
