<template>
  <ToolContainer title="Base64 编码/解码" description="支持文本和文件的Base64编码解码，安全可靠">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="base64-tool">
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
            <label class="option-label">输入类型：</label>
            <el-radio-group v-model="inputType" @change="handleInputTypeChange">
              <el-radio value="text">文本</el-radio>
              <el-radio value="file">文件</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-card>

      <!-- 文本输入模式 -->
      <div v-if="inputType === 'text'" class="text-mode">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>{{ operation === 'encode' ? '原文' : 'Base64 文本' }}</span>
                  <div class="header-actions">
                    <el-button size="small" @click="pasteFromClipboard('input')">
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
                placeholder="请输入要处理的文本..."
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
                  <span>{{ operation === 'encode' ? 'Base64 结果' : '解码结果' }}</span>
                  <div class="header-actions">
                    <el-button 
                      size="small" 
                      :disabled="!outputText"
                      @click="copyToClipboard(outputText)"
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
      </div>

      <!-- 文件输入模式 -->
      <div v-else class="file-mode">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>{{ operation === 'encode' ? '文件上传' : 'Base64 文件内容' }}</span>
              </template>
              
              <div v-if="operation === 'encode'" class="file-upload-area">
                <el-upload
                  ref="uploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  drag
                >
                  <div class="upload-content">
                    <el-icon class="upload-icon"><UploadFilled /></el-icon>
                    <div class="upload-text">
                      <p>点击或拖拽文件到此处上传</p>
                      <p class="upload-hint">支持任意格式文件</p>
                    </div>
                  </div>
                </el-upload>
                
                <div v-if="selectedFile" class="file-info">
                  <el-descriptions :column="1" size="small" border>
                    <el-descriptions-item label="文件名">{{ selectedFile.name }}</el-descriptions-item>
                    <el-descriptions-item label="文件大小">{{ formatFileSize(selectedFile.size) }}</el-descriptions-item>
                    <el-descriptions-item label="文件类型">{{ selectedFile.type || '未知' }}</el-descriptions-item>
                  </el-descriptions>
                  
                  <div class="file-actions">
                    <el-button type="primary" @click="processFile">
                      <el-icon><Upload /></el-icon>
                      编码文件
                    </el-button>
                    <el-button @click="clearFile">
                      <el-icon><Delete /></el-icon>
                      清除
                    </el-button>
                  </div>
                </div>
              </div>
              
              <div v-else class="base64-input">
                <CodeEditor
                  v-model="fileBase64Input"
                  :height="editorHeight"
                  language="plaintext"
                  placeholder="请输入 Base64 编码的文件内容..."
                  @change="handleBase64Input"
                />
                
                <div class="input-actions">
                  <el-button type="primary" @click="decodeBase64File">
                    <el-icon><Download /></el-icon>
                    解码并下载
                  </el-button>
                  <el-button @click="pasteFromClipboard('fileBase64')">
                    <el-icon><DocumentCopy /></el-icon>
                    粘贴
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>{{ operation === 'encode' ? 'Base64 编码结果' : '文件信息' }}</span>
                  <div class="header-actions">
                    <el-button 
                      v-if="operation === 'encode'" 
                      size="small" 
                      :disabled="!fileBase64Output"
                      @click="copyToClipboard(fileBase64Output)"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                      复制
                    </el-button>
                  </div>
                </div>
              </template>
              
              <div v-if="operation === 'encode'" class="base64-output">
                <CodeEditor
                  v-model="fileBase64Output"
                  :height="editorHeight"
                  language="plaintext"
                  :readonly="true"
                />
                
                <div v-if="fileBase64Output" class="output-info">
                  <el-text size="small" type="success">
                    Base64 长度：{{ fileBase64Output.length }} 字符
                  </el-text>
                </div>
              </div>
              
              <div v-else class="decode-info">
                <div v-if="!decodedFileInfo" class="empty-state">
                  <el-icon class="empty-icon"><Document /></el-icon>
                  <p>请输入 Base64 内容并解码</p>
                </div>
                
                <div v-else class="file-preview">
                  <el-descriptions :column="1" size="small" border>
                    <el-descriptions-item label="文件大小">{{ formatFileSize(decodedFileInfo.size) }}</el-descriptions-item>
                    <el-descriptions-item label="文件类型">{{ decodedFileInfo.mimeType }}</el-descriptions-item>
                  </el-descriptions>
                  
                  <div class="preview-actions">
                    <el-button type="primary" @click="downloadDecodedFile">
                      <el-icon><Download /></el-icon>
                      下载文件
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 处理状态 -->
      <div v-if="processing" class="processing-overlay">
        <div class="loading-text">正在处理文件...</div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import CodeEditor from '@/components/base/CodeEditor.vue'
import { Base64Tool } from '@/utils/crypto'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy,
  Download,
  Upload,
  UploadFilled,
  Document
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const operation = ref<'encode' | 'decode'>('encode')
const inputType = ref<'text' | 'file'>('text')
const inputText = ref('')
const outputText = ref('')
const selectedFile = ref<File | null>(null)
const fileBase64Input = ref('')
const fileBase64Output = ref('')
const decodedFileInfo = ref<{ size: number; mimeType: string; blob: Blob } | null>(null)
const processing = ref(false)

const uploadRef = ref()

// 计算属性
const editorHeight = computed(() => '300px')

// 方法
const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  selectedFile.value = null
  fileBase64Input.value = ''
  fileBase64Output.value = ''
  decodedFileInfo.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleOperationChange = () => {
  outputText.value = ''
  fileBase64Output.value = ''
  decodedFileInfo.value = null
  
  if (inputType.value === 'text' && inputText.value) {
    handleTextInput(inputText.value)
  }
}

const handleInputTypeChange = () => {
  clearAll()
}

const handleTextInput = async (text: string) => {
  if (!text.trim()) {
    outputText.value = ''
    return
  }

  try {
    if (operation.value === 'encode') {
      outputText.value = Base64Tool.encodeText(text)
    } else {
      outputText.value = Base64Tool.decodeText(text)
    }
    
    // 记录历史
    appStore.addHistory({
      toolId: 'base64',
      timestamp: Date.now(),
      input: text,
      output: outputText.value
    })
  } catch (error) {
    ElMessage.error((error as Error).message)
    outputText.value = ''
  }
}

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const processFile = async () => {
  if (!selectedFile.value) return

  processing.value = true
  try {
    fileBase64Output.value = await Base64Tool.encodeFile(selectedFile.value)
    ElMessage.success('文件编码完成')
  } catch (error) {
    ElMessage.error((error as Error).message)
  } finally {
    processing.value = false
  }
}

const clearFile = () => {
  selectedFile.value = null
  fileBase64Output.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleBase64Input = async (text: string) => {
  if (!text.trim()) {
    decodedFileInfo.value = null
    return
  }

  try {
    const blob = Base64Tool.decodeToBlob(text.trim())
    decodedFileInfo.value = {
      size: blob.size,
      mimeType: blob.type || 'application/octet-stream',
      blob
    }
  } catch (error) {
    decodedFileInfo.value = null
  }
}

const decodeBase64File = () => {
  if (!decodedFileInfo.value) {
    ElMessage.warning('请先输入有效的 Base64 内容')
    return
  }

  const url = URL.createObjectURL(decodedFileInfo.value.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `decoded_file_${Date.now()}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const downloadDecodedFile = () => {
  decodeBase64File()
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const pasteFromClipboard = async (target: 'input' | 'fileBase64') => {
  try {
    const text = await navigator.clipboard.readText()
    if (target === 'input') {
      inputText.value = text
      await nextTick()
      handleTextInput(text)
    } else {
      fileBase64Input.value = text
      await nextTick()
      handleBase64Input(text)
    }
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
  a.download = `base64_${operation.value}_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const getByteLength = (str: string): number => {
  return new Blob([str]).size
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.base64-tool {
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

  .file-upload-area {
    .upload-content {
      padding: 40px;
      text-align: center;
      
      .upload-icon {
        font-size: 48px;
        color: var(--el-color-primary);
        margin-bottom: 16px;
      }
      
      .upload-text {
        p {
          margin: 0;
          
          &:first-child {
            font-size: 16px;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          }
          
          &.upload-hint {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
    
    .file-info {
      margin-top: 20px;
      
      .file-actions {
        margin-top: 16px;
        display: flex;
        gap: 12px;
      }
    }
  }

  .base64-input {
    .input-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }
  }

  .base64-output {
    .output-info {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--el-border-color-extra-light);
    }
  }

  .decode-info {
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
    
    .file-preview {
      .preview-actions {
        margin-top: 16px;
      }
    }
  }

  .processing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .loading-text {
      color: white;
      font-size: 16px;
      font-weight: 500;
      background: var(--el-color-primary);
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .base64-tool {
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

    .text-mode,
    .file-mode {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 16px;
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
  }
}
</style>
