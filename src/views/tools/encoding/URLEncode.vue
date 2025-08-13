<template>
  <ToolContainer title="URL 编码/解码" description="URL编码解码工具，处理特殊字符和中文">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="url-tool">
      <!-- 操作选项 -->
      <el-card class="options-card">
        <div class="options-row">
          <div class="option-group">
            <label class="option-label">操作类型：</label>
            <el-radio-group v-model="operation" @change="handleOperationChange">
              <el-radio value="encode">编码</el-radio>
              <el-radio value="decode">解码</el-radio>
            </el-radio-group>
          </div>
          
          <div class="option-group">
            <label class="option-label">编码类型：</label>
            <el-radio-group v-model="encodeType" @change="handleEncodeTypeChange">
              <el-radio value="component">组件编码 (推荐)</el-radio>
              <el-radio value="complete">完整编码</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-card>

      <!-- 输入输出区域 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{ operation === 'encode' ? '原始文本' : 'URL 编码文本' }}</span>
                <div class="header-actions">
                  <el-button size="small" @click="pasteFromClipboard">
                    <el-icon><DocumentCopy /></el-icon>
                    粘贴
                  </el-button>
                </div>
              </div>
            </template>
            
            <CodeEditor
              v-model="inputText"
              :height="editorHeight"
              language="plaintext"
              :placeholder="operation === 'encode' ? '请输入要编码的文本...' : '请输入要解码的URL编码文本...'"
              @change="handleTextInput"
            />
            
            <div class="text-info">
              <el-text size="small" type="info">
                字符数：{{ inputText.length }} | 字节数：{{ getByteLength(inputText) }}
              </el-text>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{ operation === 'encode' ? 'URL 编码结果' : '解码结果' }}</span>
                <div class="header-actions">
                  <el-button 
                    size="small" 
                    :disabled="!outputText"
                    @click="copyToClipboard"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                    复制
                  </el-button>
                  <el-button 
                    size="small" 
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
              language="plaintext"
              :readonly="true"
            />
            
            <div class="text-info">
              <el-text size="small" type="success">
                字符数：{{ outputText.length }} | 字节数：{{ getByteLength(outputText) }}
              </el-text>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 示例区域 -->
      <el-card class="examples-card">
        <template #header>
          <span>常用示例</span>
        </template>
        
        <div class="examples-grid">
          <div 
            v-for="example in examples" 
            :key="example.name"
            class="example-item"
            @click="useExample(example)"
          >
            <div class="example-header">
              <span class="example-name">{{ example.name }}</span>
              <el-icon class="example-icon"><Right /></el-icon>
            </div>
            <div class="example-content">
              <div class="example-original">{{ example.original }}</div>
              <div class="example-encoded">{{ example.encoded }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 编码对照表 -->
      <el-card class="reference-card">
        <template #header>
          <span>常用字符编码对照表</span>
        </template>
        
        <el-table :data="referenceTable" size="small" stripe>
          <el-table-column prop="char" label="字符" width="80" align="center" />
          <el-table-column prop="description" label="描述" width="120" />
          <el-table-column prop="encoded" label="URL编码" />
          <el-table-column prop="unicode" label="Unicode" width="100" />
        </el-table>
      </el-card>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import CodeEditor from '@/components/base/CodeEditor.vue'
import { URLTool } from '@/utils/crypto'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy,
  Download,
  Right
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const operation = ref<'encode' | 'decode'>('encode')
const encodeType = ref<'component' | 'complete'>('component')
const inputText = ref('')
const outputText = ref('')

// 计算属性
const editorHeight = computed(() => '300px')

// 示例数据
const examples = ref([
  {
    name: '中文字符',
    original: '你好世界',
    encoded: '%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C'
  },
  {
    name: '空格字符',
    original: 'hello world',
    encoded: 'hello%20world'
  },
  {
    name: '特殊符号',
    original: 'a=1&b=2',
    encoded: 'a%3D1%26b%3D2'
  },
  {
    name: '邮箱地址',
    original: 'user@example.com',
    encoded: 'user%40example.com'
  },
  {
    name: '完整URL',
    original: 'https://example.com/path?query=测试',
    encoded: 'https%3A//example.com/path%3Fquery%3D%E6%B5%8B%E8%AF%95'
  }
])

// 编码对照表
const referenceTable = ref([
  { char: ' ', description: '空格', encoded: '%20', unicode: 'U+0020' },
  { char: '!', description: '感叹号', encoded: '%21', unicode: 'U+0021' },
  { char: '"', description: '双引号', encoded: '%22', unicode: 'U+0022' },
  { char: '#', description: '井号', encoded: '%23', unicode: 'U+0023' },
  { char: '$', description: '美元符', encoded: '%24', unicode: 'U+0024' },
  { char: '%', description: '百分号', encoded: '%25', unicode: 'U+0025' },
  { char: '&', description: '和号', encoded: '%26', unicode: 'U+0026' },
  { char: "'", description: '单引号', encoded: '%27', unicode: 'U+0027' },
  { char: '(', description: '左括号', encoded: '%28', unicode: 'U+0028' },
  { char: ')', description: '右括号', encoded: '%29', unicode: 'U+0029' },
  { char: '*', description: '星号', encoded: '%2A', unicode: 'U+002A' },
  { char: '+', description: '加号', encoded: '%2B', unicode: 'U+002B' },
  { char: ',', description: '逗号', encoded: '%2C', unicode: 'U+002C' },
  { char: '/', description: '斜杠', encoded: '%2F', unicode: 'U+002F' },
  { char: ':', description: '冒号', encoded: '%3A', unicode: 'U+003A' },
  { char: ';', description: '分号', encoded: '%3B', unicode: 'U+003B' },
  { char: '=', description: '等号', encoded: '%3D', unicode: 'U+003D' },
  { char: '?', description: '问号', encoded: '%3F', unicode: 'U+003F' },
  { char: '@', description: '艾特符', encoded: '%40', unicode: 'U+0040' }
])

// 方法
const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
}

const handleOperationChange = () => {
  if (inputText.value) {
    handleTextInput(inputText.value)
  }
}

const handleEncodeTypeChange = () => {
  if (operation.value === 'encode' && inputText.value) {
    handleTextInput(inputText.value)
  }
}

const handleTextInput = async (text: string) => {
  if (!text) {
    outputText.value = ''
    return
  }

  try {
    if (operation.value === 'encode') {
      outputText.value = encodeType.value === 'complete' 
        ? URLTool.encodeComplete(text)
        : URLTool.encode(text)
    } else {
      outputText.value = URLTool.decode(text)
    }
    
    // 记录历史
    appStore.addHistory({
      toolId: 'url-encode',
      timestamp: Date.now(),
      input: text,
      output: outputText.value
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
    handleTextInput(text)
    ElMessage.success('已从剪贴板粘贴')
  } catch {
    ElMessage.error('粘贴失败')
  }
}

const downloadAsFile = () => {
  if (!outputText.value) return

  const blob = new Blob([outputText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `url_${operation.value}_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const useExample = (example: any) => {
  inputText.value = operation.value === 'encode' ? example.original : example.encoded
  handleTextInput(inputText.value)
}

const getByteLength = (str: string): number => {
  return new Blob([str]).size
}
</script>

<style lang="scss" scoped>
.url-tool {
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

  .text-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  .examples-card {
    margin-top: 20px;
    
    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      
      .example-item {
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
        
        .example-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .example-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
          
          .example-icon {
            color: var(--el-text-color-placeholder);
          }
        }
        
        .example-content {
          .example-original,
          .example-encoded {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 4px;
            margin-bottom: 4px;
            word-break: break-all;
          }
          
          .example-original {
            background: var(--el-fill-color-light);
            color: var(--el-text-color-regular);
          }
          
          .example-encoded {
            background: var(--el-color-primary-light-8);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .reference-card {
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .url-tool {
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

    .examples-grid {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>
