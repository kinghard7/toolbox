<template>
  <ToolContainer 
    title="HTML 实体编码/解码" 
    description="HTML 实体字符与普通字符互相转换"
    :favorite="isFavorite"
    @toggle-favorite="toggleFavorite"
  >
    <div class="html-entity-tool">
      <div class="conversion-area">
        <!-- 编码选项 -->
        <div class="options-row">
          <el-radio-group v-model="conversionMode" @change="handleConversion">
            <el-radio-button label="encode">编码</el-radio-button>
            <el-radio-button label="decode">解码</el-radio-button>
          </el-radio-group>
          
          <el-checkbox v-model="includeSpecialChars" @change="handleConversion">
            包含特殊字符 (&lt; &gt; &amp; &quot; &#39;)
          </el-checkbox>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <h3>{{ conversionMode === 'encode' ? '原始文本' : 'HTML 实体文本' }}</h3>
            <div class="actions">
              <el-button size="small" @click="clearInput">清空</el-button>
              <el-button size="small" @click="copyInput">复制</el-button>
            </div>
          </div>
          <CodeEditor
            v-model="inputText"
            :language="'text'"
            :height="200"
            placeholder="请输入要转换的文本..."
            @input="handleConversion"
          />
          <div class="info-bar">
            <span>字符数: {{ inputText.length }}</span>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="output-section">
          <div class="section-header">
            <h3>{{ conversionMode === 'encode' ? 'HTML 实体文本' : '原始文本' }}</h3>
            <div class="actions">
              <el-button size="small" @click="clearOutput">清空</el-button>
              <el-button size="small" @click="copyOutput">复制</el-button>
            </div>
          </div>
          <CodeEditor
            v-model="outputText"
            :language="'html'"
            :height="200"
            :readonly="true"
            placeholder="转换结果将显示在这里..."
          />
          <div class="info-bar">
            <span>字符数: {{ outputText.length }}</span>
            <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
          </div>
        </div>
      </div>

      <!-- 常用实体参考 -->
      <div class="reference-section">
        <h3>常用 HTML 实体参考</h3>
        <div class="entity-grid">
          <div 
            v-for="entity in commonEntities" 
            :key="entity.char"
            class="entity-item"
            @click="insertEntity(entity)"
          >
            <div class="char">{{ entity.char }}</div>
            <div class="code">{{ entity.entity }}</div>
            <div class="name">{{ entity.name }}</div>
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
const conversionMode = ref<'encode' | 'decode'>('encode')
const includeSpecialChars = ref(true)
const errorMessage = ref('')

// 收藏功能
const isFavorite = computed(() => appStore.favoriteTools.includes('html-entity'))
const toggleFavorite = () => {
  appStore.toggleFavorite('html-entity')
}

// HTML 实体映射表
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  ' ': '&nbsp;',
  '¡': '&iexcl;',
  '¢': '&cent;',
  '£': '&pound;',
  '¤': '&curren;',
  '¥': '&yen;',
  '¦': '&brvbar;',
  '§': '&sect;',
  '¨': '&uml;',
  '©': '&copy;',
  'ª': '&ordf;',
  '«': '&laquo;',
  '¬': '&not;',
  '®': '&reg;',
  '¯': '&macr;',
  '°': '&deg;',
  '±': '&plusmn;',
  '²': '&sup2;',
  '³': '&sup3;',
  '´': '&acute;',
  'µ': '&micro;',
  '¶': '&para;',
  '·': '&middot;',
  '¸': '&cedil;',
  '¹': '&sup1;',
  'º': '&ordm;',
  '»': '&raquo;',
  '¼': '&frac14;',
  '½': '&frac12;',
  '¾': '&frac34;',
  '¿': '&iquest;'
}

// 常用实体参考
const commonEntities = [
  { char: '&', entity: '&amp;', name: '与号' },
  { char: '<', entity: '&lt;', name: '小于号' },
  { char: '>', entity: '&gt;', name: '大于号' },
  { char: '"', entity: '&quot;', name: '双引号' },
  { char: "'", entity: '&#39;', name: '单引号' },
  { char: ' ', entity: '&nbsp;', name: '不间断空格' },
  { char: '©', entity: '&copy;', name: '版权符号' },
  { char: '®', entity: '&reg;', name: '注册商标' },
  { char: '™', entity: '&trade;', name: '商标符号' },
  { char: '°', entity: '&deg;', name: '度符号' },
  { char: '±', entity: '&plusmn;', name: '正负号' },
  { char: '×', entity: '&times;', name: '乘号' },
  { char: '÷', entity: '&divide;', name: '除号' },
  { char: '€', entity: '&euro;', name: '欧元符号' },
  { char: '¥', entity: '&yen;', name: '日元符号' },
  { char: '£', entity: '&pound;', name: '英镑符号' }
]

// HTML 实体编码
const encodeHtmlEntities = (text: string): string => {
  let result = text
  
  if (includeSpecialChars.value) {
    // 编码基本的 HTML 特殊字符
    result = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  
  // 编码其他字符
  for (const [char, entity] of Object.entries(htmlEntities)) {
    if (includeSpecialChars.value || !'&<>"\''.includes(char)) {
      result = result.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), entity)
    }
  }
  
  return result
}

// HTML 实体解码
const decodeHtmlEntities = (text: string): string => {
  let result = text
  
  // 创建反向映射
  const reverseEntities: Record<string, string> = {}
  for (const [char, entity] of Object.entries(htmlEntities)) {
    reverseEntities[entity] = char
  }
  
  // 解码命名实体
  for (const [entity, char] of Object.entries(reverseEntities)) {
    result = result.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char)
  }
  
  // 解码数字实体 &#数字;
  result = result.replace(/&#(\d+);/g, (match, code) => {
    return String.fromCharCode(parseInt(code, 10))
  })
  
  // 解码十六进制实体 &#x十六进制;
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, code) => {
    return String.fromCharCode(parseInt(code, 16))
  })
  
  return result
}

// 处理转换
const handleConversion = () => {
  errorMessage.value = ''
  
  try {
    if (conversionMode.value === 'encode') {
      outputText.value = encodeHtmlEntities(inputText.value)
    } else {
      outputText.value = decodeHtmlEntities(inputText.value)
    }
  } catch (error) {
    errorMessage.value = `转换失败: ${error instanceof Error ? error.message : '未知错误'}`
    outputText.value = ''
  }
}

// 插入实体
const insertEntity = (entity: { char: string, entity: string, name: string }) => {
  if (conversionMode.value === 'encode') {
    inputText.value += entity.char
  } else {
    inputText.value += entity.entity
  }
  handleConversion()
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
}

// 清空输出
const clearOutput = () => {
  outputText.value = ''
  errorMessage.value = ''
}

// 复制输入
const copyInput = async () => {
  if (!inputText.value) {
    ElMessage.warning('输入内容为空')
    return
  }
  
  try {
    await navigator.clipboard.writeText(inputText.value)
    ElMessage.success('输入内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 复制输出
const copyOutput = async () => {
  if (!outputText.value) {
    ElMessage.warning('输出内容为空')
    return
  }
  
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('输出内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.html-entity-tool {
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

  .reference-section {
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

    .entity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;

      .entity-item {
        padding: 12px;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        .char {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
          color: var(--el-color-primary);
        }

        .code {
          font-family: var(--el-font-family-mono);
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-bottom: 2px;
        }

        .name {
          font-size: 11px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .html-entity-tool {
    .conversion-area {
      .options-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    .reference-section {
      .entity-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  }
}
</style>
