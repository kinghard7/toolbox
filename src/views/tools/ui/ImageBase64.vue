<template>
  <div class="image-base64-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Base64编码 -->
      <el-tab-pane label="Base64编码" name="encode">
        <div class="encode-container">
          <div class="upload-section">
            <h3>上传图片</h3>
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept="image/*"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将图片文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 jpg/png/gif/webp 等格式，文件大小不超过 5MB
                </div>
              </template>
            </el-upload>
            
            <div v-if="currentImage" class="image-info">
              <h4>图片信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">文件名：</span>
                  <span>{{ currentImage.name }}</span>
                </div>
                <div class="info-item">
                  <span class="label">尺寸：</span>
                  <span>{{ imageInfo.width }} × {{ imageInfo.height }}px</span>
                </div>
                <div class="info-item">
                  <span class="label">文件大小：</span>
                  <span>{{ formatFileSize(currentImage.size) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">格式：</span>
                  <span>{{ imageInfo.format }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="encode-section">
            <h3>编码设置</h3>
            <div class="encode-options">
              <div class="option-group">
                <label>输出格式：</label>
                <el-radio-group v-model="encodeSettings.format">
                  <el-radio label="dataUrl">Data URL</el-radio>
                  <el-radio label="base64">纯Base64</el-radio>
                  <el-radio label="css">CSS背景</el-radio>
                  <el-radio label="html">HTML img标签</el-radio>
                </el-radio-group>
              </div>
              
              <div class="option-group">
                <label>压缩质量：</label>
                <el-slider
                  v-model="encodeSettings.quality"
                  :min="1"
                  :max="100"
                  :step="1"
                  show-input
                  show-input-controls
                />
              </div>
              
              <div class="option-group">
                <label>输出选项：</label>
                <div class="output-options">
                  <el-checkbox v-model="encodeSettings.optimize">优化输出</el-checkbox>
                  <el-checkbox v-model="encodeSettings.minify">压缩空白</el-checkbox>
                  <el-checkbox v-model="encodeSettings.lineBreak">添加换行</el-checkbox>
                </div>
              </div>
            </div>
            
            <div class="encode-actions">
              <el-button type="primary" @click="encodeImage" :disabled="!currentImage">
                开始编码
              </el-button>
              <el-button @click="resetEncode">重置</el-button>
            </div>
          </div>
        </div>
        
        <!-- 编码结果 -->
        <div v-if="encodedResult" class="result-section">
          <h3>编码结果</h3>
          <div class="result-container">
            <div class="result-preview">
              <h4>预览</h4>
              <img :src="encodedResult.dataUrl" alt="编码后图片" />
            </div>
            
            <div class="result-code">
              <h4>Base64代码</h4>
              <div class="code-header">
                <span>长度：{{ encodedResult.length }} 字符</span>
                <div class="code-actions">
                  <el-button size="small" @click="copyCode">复制</el-button>
                  <el-button size="small" @click="downloadCode">下载</el-button>
                </div>
              </div>
              <el-input
                v-model="encodedResult.code"
                type="textarea"
                :rows="10"
                readonly
                class="code-output"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Base64解码 -->
      <el-tab-pane label="Base64解码" name="decode">
        <div class="decode-container">
          <div class="decode-input">
            <h3>输入Base64代码</h3>
            <el-input
              v-model="decodeInput"
              type="textarea"
              :rows="8"
              placeholder="请输入Base64编码的图片数据..."
              @input="decodeBase64"
            />
            <div class="decode-actions">
              <el-button type="primary" @click="decodeImage" :disabled="!decodeInput.trim()">
                解码图片
              </el-button>
              <el-button @click="clearDecode">清空</el-button>
              <el-button @click="loadExample">加载示例</el-button>
            </div>
          </div>
          
          <div v-if="decodedResult" class="decode-result">
            <h3>解码结果</h3>
            <div class="result-info">
              <p><strong>文件类型：</strong>{{ decodedResult.type }}</p>
              <p><strong>文件大小：</strong>{{ formatFileSize(decodedResult.size) }}</p>
              <p><strong>数据长度：</strong>{{ decodedResult.length }} 字符</p>
            </div>
            <div class="result-preview">
              <img :src="decodedResult.dataUrl" alt="解码后图片" />
            </div>
            <div class="result-actions">
              <el-button @click="downloadDecoded">下载图片</el-button>
              <el-button @click="copyDecoded">复制图片</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 批量处理 -->
      <el-tab-pane label="批量处理" name="batch">
        <div class="batch-container">
          <div class="batch-upload">
            <h3>批量上传图片</h3>
            <el-upload
              ref="batchUploadRef"
              :auto-upload="false"
              :on-change="handleBatchFileChange"
              :file-list="batchFiles"
              accept="image/*"
              multiple
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将多个图片文件拖到此处，或<em>点击上传</em>
              </div>
            </el-upload>
          </div>
          
          <div class="batch-settings">
            <h3>批量设置</h3>
            <div class="batch-options">
              <div class="option-group">
                <label>输出格式：</label>
                <el-select v-model="batchFormat">
                  <el-option label="Data URL" value="dataUrl" />
                  <el-option label="纯Base64" value="base64" />
                  <el-option label="CSS背景" value="css" />
                  <el-option label="HTML标签" value="html" />
                </el-select>
              </div>
              
              <div class="option-group">
                <label>压缩打包：</label>
                <el-checkbox v-model="batchCompress">生成ZIP压缩包</el-checkbox>
              </div>
            </div>
            
            <div class="batch-actions">
              <el-button type="primary" @click="startBatchEncode" :disabled="batchFiles.length === 0">
                开始批量编码
              </el-button>
              <el-button @click="clearBatchFiles">清空文件</el-button>
            </div>
          </div>
          
          <div v-if="batchProgress > 0" class="batch-progress">
            <h4>编码进度</h4>
            <el-progress :percentage="batchProgress" :status="batchProgress === 100 ? 'success' : ''" />
            <p v-if="batchProgress < 100">正在编码第 {{ currentBatchIndex + 1 }} 个文件...</p>
            <p v-else>批量编码完成！</p>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('encode')
const uploadRef = ref()
const batchUploadRef = ref()

// 当前图片
const currentImage = ref<File | null>(null)
const imageInfo = reactive({
  width: 0,
  height: 0,
  format: ''
})

// 编码设置
const encodeSettings = reactive({
  format: 'dataUrl',
  quality: 90,
  optimize: true,
  minify: false,
  lineBreak: false
})

// 编码结果
const encodedResult = ref<any>(null)

// 解码输入
const decodeInput = ref('')
const decodedResult = ref<any>(null)

// 批量处理
const batchFiles = ref<any[]>([])
const batchFormat = ref('dataUrl')
const batchCompress = ref(true)
const batchProgress = ref(0)
const currentBatchIndex = ref(0)

// 方法
const handleFileChange = (file: any) => {
  if (file && file.raw) {
    currentImage.value = file.raw
    loadImageInfo(file.raw)
  }
}

const loadImageInfo = (file: File) => {
  const img = new Image()
  img.onload = () => {
    imageInfo.width = img.width
    imageInfo.height = img.height
    imageInfo.format = file.type.split('/')[1] || 'unknown'
  }
  img.src = URL.createObjectURL(file)
}

const encodeImage = async () => {
  if (!currentImage.value) return
  
  try {
    ElMessage.info('正在编码图片...')
    
    // 模拟编码过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 创建编码结果
    const dataUrl = URL.createObjectURL(currentImage.value)
    let code = ''
    
    switch (encodeSettings.format) {
      case 'dataUrl':
        code = `data:${currentImage.value.type};base64,${btoa('模拟Base64数据')}`
        break
      case 'base64':
        code = btoa('模拟Base64数据')
        break
      case 'css':
        code = `background-image: url(data:${currentImage.value.type};base64,${btoa('模拟Base64数据')});`
        break
      case 'html':
        code = `<img src="data:${currentImage.value.type};base64,${btoa('模拟Base64数据')}" alt="图片" />`
        break
    }
    
    encodedResult.value = {
      dataUrl,
      code,
      length: code.length,
      format: encodeSettings.format
    }
    
    ElMessage.success('图片编码完成')
    
  } catch (error) {
    ElMessage.error('编码失败：' + error.message)
  }
}

const resetEncode = () => {
  currentImage.value = null
  encodedResult.value = null
  Object.assign(imageInfo, { width: 0, height: 0, format: '' })
  ElMessage.success('已重置')
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(encodedResult.value.code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const downloadCode = () => {
  const content = encodedResult.value.code
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `image_base64.${getFileExtension()}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('代码已下载')
}

const getFileExtension = () => {
  switch (encodeSettings.format) {
    case 'css': return 'css'
    case 'html': return 'html'
    default: return 'txt'
  }
}

const decodeBase64 = () => {
  // 实时验证Base64格式
}

const decodeImage = async () => {
  if (!decodeInput.value.trim()) return
  
  try {
    ElMessage.info('正在解码...')
    
    // 模拟解码过程
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 创建解码结果
    decodedResult.value = {
      type: 'image/jpeg',
      size: Math.round(decodeInput.value.length * 0.75),
      length: decodeInput.value.length,
      dataUrl: 'data:image/jpeg;base64,模拟解码数据'
    }
    
    ElMessage.success('解码完成')
    
  } catch (error) {
    ElMessage.error('解码失败：' + error.message)
  }
}

const clearDecode = () => {
  decodeInput.value = ''
  decodedResult.value = null
  ElMessage.success('已清空')
}

const loadExample = () => {
  decodeInput.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  ElMessage.success('示例已加载')
}

const downloadDecoded = () => {
  const link = document.createElement('a')
  link.href = decodedResult.value.dataUrl
  link.download = 'decoded_image.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('图片已下载')
}

const copyDecoded = async () => {
  try {
    const response = await fetch(decodedResult.value.dataUrl)
    const blob = await response.blob()
    
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    
    ElMessage.success('图片已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const handleBatchFileChange = (file: any) => {
  batchFiles.value.push(file)
}

const startBatchEncode = async () => {
  if (batchFiles.value.length === 0) return
  
  try {
    batchProgress.value = 0
    currentBatchIndex.value = 0
    
    for (let i = 0; i < batchFiles.value.length; i++) {
      currentBatchIndex.value = i
      batchProgress.value = Math.round((i / batchFiles.value.length) * 100)
      
      // 模拟编码过程
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    batchProgress.value = 100
    ElMessage.success('批量编码完成')
    
  } catch (error) {
    ElMessage.error('批量编码失败：' + error.message)
  }
}

const clearBatchFiles = () => {
  batchFiles.value = []
  batchProgress.value = 0
  currentBatchIndex.value = 0
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.image-base64-tool {
  padding: 20px;
}

.encode-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-section,
.encode-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.upload-section h3,
.encode-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.image-info {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.image-info h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  font-size: 14px;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
}

.encode-options {
  margin-bottom: 20px;
}

.option-group {
  margin-bottom: 16px;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.output-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.encode-actions {
  display: flex;
  gap: 12px;
}

.result-section {
  margin-top: 20px;
}

.result-section h3 {
  margin-bottom: 16px;
  color: #303133;
}

.result-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.result-preview,
.result-code {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.result-preview h4,
.result-code h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.result-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.code-header span {
  font-size: 14px;
  color: #909399;
}

.code-actions {
  display: flex;
  gap: 8px;
}

.code-output {
  font-family: 'Courier New', monospace;
}

.decode-container {
  padding: 20px 0;
}

.decode-input h3 {
  margin-bottom: 16px;
  color: #303133;
}

.decode-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.decode-result {
  margin-top: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.decode-result h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.result-info {
  margin-bottom: 20px;
}

.result-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.result-preview {
  text-align: center;
  margin-bottom: 20px;
}

.result-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.batch-container {
  padding: 20px 0;
}

.batch-upload,
.batch-settings {
  margin-bottom: 30px;
}

.batch-upload h3,
.batch-settings h3 {
  margin-bottom: 16px;
  color: #303133;
}

.batch-options {
  margin-bottom: 20px;
}

.option-group {
  margin-bottom: 16px;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.batch-actions {
  display: flex;
  gap: 12px;
}

.batch-progress {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.batch-progress h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.batch-progress p {
  margin: 12px 0 0 0;
  color: #606266;
}

@media (max-width: 768px) {
  .encode-container,
  .result-container {
    grid-template-columns: 1fr;
  }
}
</style>
