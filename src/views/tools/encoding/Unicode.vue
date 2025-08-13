<template>
  <ToolContainer 
    title="Unicode 编码转换" 
    description="Unicode 码点与字符的互相转换"
    :favorite="isFavorite"
    @toggle-favorite="toggleFavorite"
  >
    <div class="unicode-tool">
      <div class="conversion-area">
        <!-- 转换模式选择 -->
        <div class="options-row">
          <el-radio-group v-model="conversionMode" @change="handleConversion">
            <el-radio-button label="to-unicode">字符转Unicode</el-radio-button>
            <el-radio-button label="from-unicode">Unicode转字符</el-radio-button>
          </el-radio-group>
          
          <el-select v-model="unicodeFormat" @change="handleConversion" style="width: 150px;">
            <el-option :label="'\\uXXXX'" :value="'\\u'" />
            <el-option :label="'U+XXXX'" :value="'U+'" />
            <el-option :label="'&#XXXX;'" :value="'&#'" />
            <el-option :label="'0xXXXX'" :value="'0x'" />
          </el-select>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <h3>{{ conversionMode === 'to-unicode' ? '原始字符' : 'Unicode 编码' }}</h3>
            <div class="actions">
              <el-button :size="'small'" @click="clearInput">清空</el-button>
              <el-button :size="'small'" @click="copyInput">复制</el-button>
            </div>
          </div>
          <CodeEditor
            v-model="inputText"
            :language="'text'"
            :height="'200'"
            :placeholder="conversionMode === 'to-unicode' ? '请输入要转换的字符...' : '请输入Unicode编码...'"
            @input="handleConversion"
          />
          <div class="info-bar">
            <span>字符数: {{ inputText.length }}</span>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="output-section">
          <div class="section-header">
            <h3>{{ conversionMode === 'to-unicode' ? 'Unicode 编码' : '原始字符' }}</h3>
            <div class="actions">
              <el-button :size="'small'" @click="clearOutput">清空</el-button>
              <el-button :size="'small'" @click="copyOutput">复制</el-button>
            </div>
          </div>
          <CodeEditor
            v-model="outputText"
            :language="'text'"
            :height="'200'"
            :readonly="true"
            placeholder="转换结果将显示在这里..."
          />
          <div class="info-bar">
            <span>字符数: {{ outputText.length }}</span>
            <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
          </div>
        </div>
      </div>

      <!-- 字符详情 -->
      <div v-if="charDetails.length > 0" class="details-section">
        <h3>字符详情</h3>
        <div class="char-grid">
          <div v-for="detail in charDetails" :key="detail.char" class="char-item">
            <div class="char-display">{{ detail.char }}</div>
            <div class="char-info">
              <div class="info-row">
                <span class="label">字符:</span>
                <span class="value">{{ detail.char }}</span>
              </div>
              <div class="info-row">
                <span class="label">Unicode:</span>
                <span class="value font-mono">U+{{ detail.unicode }}</span>
              </div>
              <div class="info-row">
                <span class="label">十进制:</span>
                <span class="value font-mono">{{ detail.decimal }}</span>
              </div>
              <div class="info-row">
                <span class="label">名称:</span>
                <span class="value">{{ detail.name || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常用符号 -->
      <div class="symbols-section">
        <h3>常用 Unicode 符号</h3>
        <div class="symbol-categories">
          <div v-for="category in symbolCategories" :key="category.name" class="category">
            <h4>{{ category.name }}</h4>
            <div class="symbol-grid">
              <div 
                v-for="symbol in category.symbols" 
                :key="symbol.char"
                class="symbol-item"
                @click="insertSymbol(symbol.char)"
                :title="`${symbol.char} - ${symbol.name}`"
              >
                {{ symbol.char }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import CodeEditor from '@/components/base/CodeEditor.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 响应式数据
const inputText = ref('')
const outputText = ref('')
const conversionMode = ref<'to-unicode' | 'from-unicode'>('to-unicode')
const unicodeFormat = ref('\\u')
const errorMessage = ref('')

// 收藏功能
const isFavorite = computed(() => appStore.favorites.includes('unicode'))
const toggleFavorite = () => {
  appStore.toggleFavorite('unicode')
}

// 字符详情
const charDetails = ref<Array<{
  char: string
  unicode: string
  decimal: number
  name?: string
}>>([])

// 常用符号分类
const symbolCategories = [
  {
    name: '箭头符号',
    symbols: [
      { char: '→', name: '右箭头' },
      { char: '←', name: '左箭头' },
      { char: '↑', name: '上箭头' },
      { char: '↓', name: '下箭头' },
      { char: '↔', name: '左右箭头' },
      { char: '↕', name: '上下箭头' },
      { char: '⇒', name: '双线右箭头' },
      { char: '⇐', name: '双线左箭头' }
    ]
  },
  {
    name: '数学符号',
    symbols: [
      { char: '∞', name: '无穷大' },
      { char: '±', name: '正负号' },
      { char: '≠', name: '不等于' },
      { char: '≤', name: '小于等于' },
      { char: '≥', name: '大于等于' },
      { char: '∑', name: '求和' },
      { char: '∫', name: '积分' },
      { char: '√', name: '根号' }
    ]
  },
  {
    name: '货币符号',
    symbols: [
      { char: '$', name: '美元' },
      { char: '€', name: '欧元' },
      { char: '¥', name: '日元/人民币' },
      { char: '£', name: '英镑' },
      { char: '₹', name: '印度卢比' },
      { char: '₽', name: '俄罗斯卢布' },
      { char: '₩', name: '韩元' },
      { char: '¢', name: '美分' }
    ]
  },
  {
    name: '其他符号',
    symbols: [
      { char: '©', name: '版权' },
      { char: '®', name: '注册商标' },
      { char: '™', name: '商标' },
      { char: '°', name: '度' },
      { char: '†', name: '匕首' },
      { char: '‡', name: '双匕首' },
      { char: '§', name: '节' },
      { char: '¶', name: '段落' }
    ]
  }
]

// 字符转Unicode
const charToUnicode = (text: string): string => {
  const chars = Array.from(text)
  const details: typeof charDetails.value = []
  
  const result = chars.map(char => {
    const codePoint = char.codePointAt(0)!
    const unicode = codePoint.toString(16).toUpperCase().padStart(4, '0')
    
    // 收集字符详情
    details.push({
      char,
      unicode,
      decimal: codePoint,
      name: getCharacterName(codePoint)
    })
    
    // 根据格式返回不同的表示
    switch (unicodeFormat.value) {
      case '\\u':
        return `\\u${unicode}`
      case 'U+':
        return `U+${unicode}`
      case '&#':
        return `&#${codePoint};`
      case '0x':
        return `0x${unicode}`
      default:
        return `\\u${unicode}`
    }
  }).join(' ')
  
  charDetails.value = details
  return result
}

// Unicode转字符
const unicodeToChar = (text: string): string => {
  let result = text
  
  try {
    // 处理 \uXXXX 格式
    result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCodePoint(parseInt(hex, 16))
    })
    
    // 处理 U+XXXX 格式
    result = result.replace(/U\+([0-9a-fA-F]+)/g, (_, hex) => {
      return String.fromCodePoint(parseInt(hex, 16))
    })
    
    // 处理 &#XXXX; 格式
    result = result.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCodePoint(parseInt(dec, 10))
    })
    
    // 处理 0xXXXX 格式
    result = result.replace(/0x([0-9a-fA-F]+)/g, (_, hex) => {
      return String.fromCodePoint(parseInt(hex, 16))
    })
    
    return result
  } catch (error) {
    throw new Error('无效的Unicode编码格式')
  }
}

// 获取字符名称（简化版）
const getCharacterName = (codePoint: number): string => {
  if (codePoint >= 0x0020 && codePoint <= 0x007F) {
    return 'ASCII字符'
  } else if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) {
    return 'CJK统一汉字'
  } else if (codePoint >= 0x3040 && codePoint <= 0x309F) {
    return '平假名'
  } else if (codePoint >= 0x30A0 && codePoint <= 0x30FF) {
    return '片假名'
  } else if (codePoint >= 0xAC00 && codePoint <= 0xD7AF) {
    return '韩文音节'
  } else if (codePoint >= 0x1F600 && codePoint <= 0x1F64F) {
    return 'Emoji表情'
  } else if (codePoint >= 0x2190 && codePoint <= 0x21FF) {
    return '箭头'
  } else if (codePoint >= 0x2200 && codePoint <= 0x22FF) {
    return '数学运算符'
  } else if (codePoint >= 0x20A0 && codePoint <= 0x20CF) {
    return '货币符号'
  }
  return '特殊字符'
}

// 处理转换
const handleConversion = () => {
  errorMessage.value = ''
  charDetails.value = []
  
  try {
    if (conversionMode.value === 'to-unicode') {
      outputText.value = charToUnicode(inputText.value)
    } else {
      outputText.value = unicodeToChar(inputText.value)
    }
  } catch (error) {
    errorMessage.value = `转换失败: ${error instanceof Error ? error.message : '未知错误'}`
    outputText.value = ''
  }
}

// 插入符号
const insertSymbol = (symbol: string) => {
  inputText.value += symbol
  handleConversion()
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
  charDetails.value = []
}

// 清空输出
const clearOutput = () => {
  outputText.value = ''
  errorMessage.value = ''
  charDetails.value = []
}

// 复制功能
const copyInput = async () => {
  if (!inputText.value) {
    ElMessage.warning({ message: '输入内容为空' })
    return
  }
  
  try {
    await navigator.clipboard.writeText(inputText.value)
    ElMessage.success({ message: '输入内容已复制到剪贴板' })
  } catch (error) {
    ElMessage.error({ message: '复制失败' })
  }
}

const copyOutput = async () => {
  if (!outputText.value) {
    ElMessage.warning({ message: '输出内容为空' })
    return
  }
  
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success({ message: '输出内容已复制到剪贴板' })
  } catch (error) {
    ElMessage.error({ message: '复制失败' })
  }
}
</script>

<style scoped lang="scss">
.unicode-tool {
  .conversion-area {
    .options-row {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
      padding: 16px;
      background: var(--el-bg-color-page);
      border-radius: 8px;
    }

    .input-section,
    .output-section {
      margin-bottom: 24px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .actions {
          display: flex;
          gap: 8px;
        }
      }

      .info-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        .error {
          color: var(--el-color-danger);
        }
      }
    }
  }

  .details-section {
    margin-top: 32px;
    padding: 24px;
    background: var(--el-bg-color-page);
    border-radius: 8px;

    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .char-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;

      .char-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 8px;

        .char-display {
          font-size: 32px;
          font-weight: bold;
          color: var(--el-color-primary);
          min-width: 40px;
          text-align: center;
        }

        .char-info {
          flex: 1;

          .info-row {
            display: flex;
            margin-bottom: 4px;

            .label {
              width: 60px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }

            .value {
              font-size: 12px;
              color: var(--el-text-color-primary);

              &.font-mono {
                font-family: var(--el-font-family-mono);
              }
            }
          }
        }
      }
    }
  }

  .symbols-section {
    margin-top: 32px;
    padding: 24px;
    background: var(--el-bg-color-page);
    border-radius: 8px;

    h3 {
      margin: 0 0 24px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .symbol-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;

      .category {
        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-regular);
        }

        .symbol-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;

          .symbol-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: var(--el-bg-color);
            border: 1px solid var(--el-border-color);
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              border-color: var(--el-color-primary);
              background: var(--el-color-primary-light-9);
              transform: scale(1.1);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .unicode-tool {
    .conversion-area {
      .options-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    .details-section {
      .char-grid {
        grid-template-columns: 1fr;
      }
    }

    .symbols-section {
      .symbol-categories {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
