<template>
  <div class="icon-extract-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 图标提取 -->
      <el-tab-pane label="图标提取" name="extract">
        <div class="extract-container">
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
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 jpg/png/gif/webp 等格式，文件大小不超过 10MB
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
          
          <div class="extract-section">
            <h3>提取设置</h3>
            <div class="extract-options">
              <div class="option-group">
                <label>提取模式：</label>
                <el-radio-group v-model="extractMode" @change="updateExtractOptions">
                  <el-radio label="auto">自动检测</el-radio>
                  <el-radio label="manual">手动选择</el-radio>
                  <el-radio label="grid">网格分割</el-radio>
                </el-radio-group>
              </div>
              
              <div class="option-group" v-if="extractMode === 'grid'">
                <label>网格设置：</label>
                <div class="grid-inputs">
                  <el-input-number
                    v-model="gridSettings.rows"
                    :min="1"
                    :max="10"
                    placeholder="行数"
                    @change="updateGridPreview"
                  />
                  <span>×</span>
                  <el-input-number
                    v-model="gridSettings.columns"
                    :min="1"
                    :max="10"
                    placeholder="列数"
                    @change="updateGridPreview"
                  />
                </div>
              </div>
              
              <div class="option-group">
                <label>输出格式：</label>
                <el-select v-model="outputFormat" @change="updateOutputOptions">
                  <el-option label="PNG" value="png" />
                  <el-option label="SVG" value="svg" />
                  <el-option label="ICO" value="ico" />
                  <el-option label="WebP" value="webp" />
                </el-select>
              </div>
              
              <div class="option-group" v-if="outputFormat === 'png' || outputFormat === 'webp'">
                <label>质量设置：</label>
                <el-slider
                  v-model="quality"
                  :min="1"
                  :max="100"
                  :step="1"
                  show-input
                  show-input-controls
                />
              </div>
              
              <div class="option-group">
                <label>背景处理：</label>
                <el-radio-group v-model="backgroundMode">
                  <el-radio label="transparent">透明背景</el-radio>
                  <el-radio label="white">白色背景</el-radio>
                  <el-radio label="black">黑色背景</el-radio>
                  <el-radio label="custom">自定义颜色</el-radio>
                </el-radio-group>
              </div>
              
              <div class="option-group" v-if="backgroundMode === 'custom'">
                <label>背景颜色：</label>
                <el-color-picker v-model="customBackgroundColor" />
              </div>
            </div>
            
            <div class="extract-actions">
              <el-button type="primary" @click="extractIcons" :disabled="!currentImage">
                开始提取
              </el-button>
              <el-button @click="resetExtract">重置</el-button>
            </div>
          </div>
        </div>
        
        <!-- 图片预览和选择 -->
        <div v-if="currentImage" class="preview-section">
          <h3>图片预览</h3>
          <div class="preview-container">
            <div class="image-preview">
              <img :src="imagePreviewUrl" alt="预览图片" />
              <div v-if="extractMode === 'manual'" class="selection-overlay" @mousedown="startSelection">
                <div
                  v-if="selection"
                  class="selection-box"
                  :style="selectionStyle"
                  @mousedown.stop="startResize"
                ></div>
              </div>
            </div>
            
            <div class="preview-info">
              <h4>操作说明</h4>
              <div v-if="extractMode === 'manual'">
                <p>• 在图片上拖拽选择要提取的区域</p>
                <p>• 拖拽选择框边缘可调整大小</p>
                <p>• 双击选择框可重置选择</p>
              </div>
              <div v-else-if="extractMode === 'grid'">
                <p>• 设置网格行数和列数</p>
                <p>• 系统将自动分割图片</p>
                <p>• 每个网格单元将作为独立图标</p>
              </div>
              <div v-else>
                <p>• 系统将自动检测图标区域</p>
                <p>• 基于边缘检测和颜色分析</p>
                <p>• 适合图标边界清晰的图片</p>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 提取结果 -->
      <el-tab-pane label="提取结果" name="results">
        <div class="results-container">
          <div class="results-header">
            <h3>提取结果</h3>
            <div class="results-actions">
              <el-button @click="downloadAll" type="primary" :disabled="extractedIcons.length === 0">
                下载全部
              </el-button>
              <el-button @click="clearResults" :disabled="extractedIcons.length === 0">
                清空结果
              </el-button>
            </div>
          </div>
          
          <div v-if="extractedIcons.length === 0" class="empty-results">
            <el-empty description="暂无提取结果" />
          </div>
          
          <div v-else class="icons-grid">
            <div
              v-for="(icon, index) in extractedIcons"
              :key="index"
              class="icon-item"
            >
              <div class="icon-preview">
                <img :src="icon.dataUrl" :alt="`图标 ${index + 1}`" />
              </div>
              <div class="icon-info">
                <p><strong>尺寸：</strong>{{ icon.width }} × {{ icon.height }}px</p>
                <p><strong>格式：</strong>{{ icon.format.toUpperCase() }}</p>
                <p><strong>大小：</strong>{{ formatFileSize(icon.size) }}</p>
              </div>
              <div class="icon-actions">
                <el-button size="small" @click="downloadIcon(icon, index)">下载</el-button>
                <el-button size="small" @click="copyIcon(icon, index)">复制</el-button>
                <el-button size="small" type="danger" @click="removeIcon(index)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 批量处理 -->
      <el-tab-pane label="批量处理" name="batch">
        <div class="batch-container">
          <div class="batch-upload">
            <h3>批量上传</h3>
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
                将多个文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持批量上传多个图片文件，每个文件将使用相同的提取设置
                </div>
              </template>
            </el-upload>
          </div>
          
          <div class="batch-settings">
            <h3>批量设置</h3>
            <div class="batch-options">
              <div class="option-group">
                <label>输出目录：</label>
                <el-input v-model="batchOutputDir" placeholder="输出目录名称" />
              </div>
              
              <div class="option-group">
                <label>文件命名：</label>
                <el-select v-model="batchNaming">
                  <el-option label="原文件名" value="original" />
                  <el-option label="序号命名" value="sequence" />
                  <el-option label="时间戳" value="timestamp" />
                </el-select>
              </div>
              
              <div class="option-group">
                <label>压缩打包：</label>
                <el-checkbox v-model="batchCompress">生成ZIP压缩包</el-checkbox>
              </div>
            </div>
            
            <div class="batch-actions">
              <el-button type="primary" @click="startBatchProcess" :disabled="batchFiles.length === 0">
                开始批量处理
              </el-button>
              <el-button @click="clearBatchFiles">清空文件</el-button>
            </div>
          </div>
          
          <div v-if="batchProgress > 0" class="batch-progress">
            <h4>处理进度</h4>
            <el-progress :percentage="batchProgress" :status="batchProgress === 100 ? 'success' : ''" />
            <p v-if="batchProgress < 100">正在处理第 {{ currentBatchIndex + 1 }} 个文件...</p>
            <p v-else>批量处理完成！</p>
          </div>
        </div>
      </el-tab-pane>

      <!-- 工具设置 -->
      <el-tab-pane label="工具设置" name="settings">
        <div class="settings-container">
          <h3>工具设置</h3>
          
          <div class="settings-section">
            <h4>默认设置</h4>
            <div class="setting-item">
              <label>默认输出格式：</label>
              <el-select v-model="defaultSettings.outputFormat">
                <el-option label="PNG" value="png" />
                <el-option label="SVG" value="svg" />
                <el-option label="ICO" value="ico" />
                <el-option label="WebP" value="webp" />
              </el-select>
            </div>
            
            <div class="setting-item">
              <label>默认质量：</label>
              <el-slider
                v-model="defaultSettings.quality"
                :min="1"
                :max="100"
                :step="1"
                show-input
                show-input-controls
              />
            </div>
            
            <div class="setting-item">
              <label>默认背景模式：</label>
              <el-radio-group v-model="defaultSettings.backgroundMode">
                <el-radio label="transparent">透明背景</el-radio>
                <el-radio label="white">白色背景</el-radio>
                <el-radio label="black">黑色背景</el-radio>
              </el-radio-group>
            </div>
          </div>
          
          <div class="settings-section">
            <h4>高级设置</h4>
            <div class="setting-item">
              <label>边缘检测敏感度：</label>
              <el-slider
                v-model="defaultSettings.edgeSensitivity"
                :min="0.1"
                :max="2.0"
                :step="0.1"
                show-input
                show-input-controls
              />
            </div>
            
            <div class="setting-item">
              <label>最小图标尺寸：</label>
              <el-input-number
                v-model="defaultSettings.minIconSize"
                :min="16"
                :max="512"
                :step="16"
                placeholder="最小尺寸"
              />
              <span class="unit">px</span>
            </div>
            
            <div class="setting-item">
              <label>自动保存设置：</label>
              <el-checkbox v-model="defaultSettings.autoSave">自动保存用户设置</el-checkbox>
            </div>
          </div>
          
          <div class="settings-actions">
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
            <el-button @click="resetSettings">重置默认</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('extract')
const uploadRef = ref()
const batchUploadRef = ref()

// 当前图片
const currentImage = ref<File | null>(null)
const imagePreviewUrl = ref('')
const imageInfo = reactive({
  width: 0,
  height: 0,
  format: ''
})

// 提取设置
const extractMode = ref('auto')
const gridSettings = reactive({
  rows: 2,
  columns: 2
})
const outputFormat = ref('png')
const quality = ref(90)
const backgroundMode = ref('transparent')
const customBackgroundColor = ref('#ffffff')

// 选择区域
const selection = ref({ x: 0, y: 0, width: 0, height: 0 })
const isSelecting = ref(false)
const isResizing = ref(false)
const startPos = ref({ x: 0, y: 0 })

// 提取结果
const extractedIcons = ref<any[]>([])

// 批量处理
const batchFiles = ref<any[]>([])
const batchOutputDir = ref('extracted_icons')
const batchNaming = ref('original')
const batchCompress = ref(true)
const batchProgress = ref(0)
const currentBatchIndex = ref(0)

// 默认设置
const defaultSettings = reactive({
  outputFormat: 'png',
  quality: 90,
  backgroundMode: 'transparent',
  edgeSensitivity: 1.0,
  minIconSize: 32,
  autoSave: true
})

// 方法
const handleFileChange = (file: any) => {
  if (file && file.raw) {
    currentImage.value = file.raw
    imagePreviewUrl.value = URL.createObjectURL(file.raw)
    loadImageInfo(file.raw)
    resetSelection()
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

const resetSelection = () => {
  selection.value = { x: 0, y: 0, width: 0, height: 0 }
}

const startSelection = (event: MouseEvent) => {
  if (extractMode.value !== 'manual') return
  
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  startPos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  isSelecting.value = true
  selection.value = {
    x: startPos.value.x,
    y: startPos.value.y,
    width: 0,
    height: 0
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isSelecting.value) return
  
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const currentX = event.clientX - rect.left
  const currentY = event.clientY - rect.top
  
  selection.value.width = currentX - startPos.value.x
  selection.value.height = currentY - startPos.value.y
}

const handleMouseUp = () => {
  isSelecting.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const startResize = (event: MouseEvent) => {
  event.stopPropagation()
  isResizing.value = true
  startPos.value = { x: event.clientX, y: event.clientY }
  
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeUp)
}

const handleResizeMove = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = event.clientX - startPos.value.x
  const deltaY = event.clientY - startPos.value.y
  
  selection.value.width += deltaX
  selection.value.height += deltaY
  
  startPos.value = { x: event.clientX, y: event.clientY }
}

const handleResizeUp = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeUp)
}

const updateExtractOptions = () => {
  resetSelection()
  if (extractMode.value === 'grid') {
    updateGridPreview()
  }
}

const updateGridPreview = () => {
  // 更新网格预览
}

const updateOutputOptions = () => {
  // 根据输出格式更新选项
}

const extractIcons = async () => {
  if (!currentImage.value) return
  
  try {
    ElMessage.info('正在提取图标...')
    
    // 模拟提取过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    let icons = []
    
    if (extractMode.value === 'auto') {
      // 自动检测图标
      icons = await autoDetectIcons()
    } else if (extractMode.value === 'manual') {
      // 手动选择区域
      if (selection.value.width > 0 && selection.value.height > 0) {
        icons = await extractFromSelection()
      } else {
        ElMessage.warning('请先选择要提取的区域')
        return
      }
    } else if (extractMode.value === 'grid') {
      // 网格分割
      icons = await extractFromGrid()
    }
    
    extractedIcons.value = [...extractedIcons.value, ...icons]
    ElMessage.success(`成功提取 ${icons.length} 个图标`)
    
    // 切换到结果标签页
    activeTab.value = 'results'
    
  } catch (error) {
    ElMessage.error('提取失败：' + error.message)
  }
}

const autoDetectIcons = async () => {
  // 模拟自动检测
  return [
    {
      dataUrl: imagePreviewUrl.value,
      width: Math.floor(imageInfo.width / 2),
      height: Math.floor(imageInfo.height / 2),
      format: outputFormat.value,
      size: Math.floor(currentImage.value!.size / 4)
    }
  ]
}

const extractFromSelection = async () => {
  // 模拟从选择区域提取
  return [
    {
      dataUrl: imagePreviewUrl.value,
      width: Math.abs(selection.value.width),
      height: Math.abs(selection.value.height),
      format: outputFormat.value,
      size: Math.floor(currentImage.value!.size / 8)
    }
  ]
}

const extractFromGrid = async () => {
  // 模拟网格分割提取
  const icons = []
  const cellWidth = imageInfo.width / gridSettings.columns
  const cellHeight = imageInfo.height / gridSettings.rows
  
  for (let row = 0; row < gridSettings.rows; row++) {
    for (let col = 0; col < gridSettings.columns; col++) {
      icons.push({
        dataUrl: imagePreviewUrl.value,
        width: Math.floor(cellWidth),
        height: Math.floor(cellHeight),
        format: outputFormat.value,
        size: Math.floor(currentImage.value!.size / (gridSettings.rows * gridSettings.columns))
      })
    }
  }
  
  return icons
}

const resetExtract = () => {
  currentImage.value = null
  imagePreviewUrl.value = ''
  resetSelection()
  Object.assign(imageInfo, { width: 0, height: 0, format: '' })
}

const downloadIcon = (icon: any, index: number) => {
  const link = document.createElement('a')
  link.href = icon.dataUrl
  link.download = `icon_${index + 1}.${icon.format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('图标已下载')
}

const copyIcon = async (icon: any, index: number) => {
  try {
    // 将图片转换为Blob
    const response = await fetch(icon.dataUrl)
    const blob = await response.blob()
    
    // 复制到剪贴板
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    
    ElMessage.success('图标已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const removeIcon = (index: number) => {
  extractedIcons.value.splice(index, 1)
  ElMessage.success('图标已删除')
}

const downloadAll = async () => {
  if (extractedIcons.value.length === 0) return
  
  try {
    // 创建ZIP文件
    const JSZip = await import('jszip')
    const zip = new JSZip.default()
    
    extractedIcons.value.forEach((icon, index) => {
      const fileName = `icon_${index + 1}.${icon.format}`
      zip.file(fileName, icon.dataUrl.split(',')[1], { base64: true })
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted_icons.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('所有图标已打包下载')
  } catch (error) {
    ElMessage.error('下载失败：' + error.message)
  }
}

const clearResults = () => {
  extractedIcons.value = []
  ElMessage.success('结果已清空')
}

const handleBatchFileChange = (file: any) => {
  batchFiles.value.push(file)
}

const startBatchProcess = async () => {
  if (batchFiles.value.length === 0) return
  
  try {
    batchProgress.value = 0
    currentBatchIndex.value = 0
    
    for (let i = 0; i < batchFiles.value.length; i++) {
      currentBatchIndex.value = i
      batchProgress.value = Math.round((i / batchFiles.value.length) * 100)
      
      // 模拟处理过程
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    batchProgress.value = 100
    ElMessage.success('批量处理完成')
    
  } catch (error) {
    ElMessage.error('批量处理失败：' + error.message)
  }
}

const clearBatchFiles = () => {
  batchFiles.value = []
  batchProgress.value = 0
  currentBatchIndex.value = 0
}

const saveSettings = () => {
  localStorage.setItem('iconExtractSettings', JSON.stringify(defaultSettings))
  ElMessage.success('设置已保存')
}

const resetSettings = () => {
  Object.assign(defaultSettings, {
    outputFormat: 'png',
    quality: 90,
    backgroundMode: 'transparent',
    edgeSensitivity: 1.0,
    minIconSize: 32,
    autoSave: true
  })
  ElMessage.success('设置已重置')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算属性
const selectionStyle = computed(() => ({
  left: `${selection.value.x}px`,
  top: `${selection.value.y}px`,
  width: `${Math.abs(selection.value.width)}px`,
  height: `${Math.abs(selection.value.height)}px`
}))

// 生命周期
onMounted(() => {
  // 加载保存的设置
  const savedSettings = localStorage.getItem('iconExtractSettings')
  if (savedSettings) {
    Object.assign(defaultSettings, JSON.parse(savedSettings))
  }
  
  // 应用默认设置
  outputFormat.value = defaultSettings.outputFormat
  quality.value = defaultSettings.quality
  backgroundMode.value = defaultSettings.backgroundMode
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeUp)
})
</script>

<style scoped>
.icon-extract-tool {
  padding: 20px;
}

.extract-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-section,
.extract-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.upload-section h3,
.extract-section h3 {
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

.extract-options {
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

.grid-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.grid-inputs span {
  font-size: 18px;
  color: #909399;
}

.extract-actions {
  display: flex;
  gap: 12px;
}

.preview-section {
  margin-top: 20px;
}

.preview-section h3 {
  margin-bottom: 16px;
  color: #303133;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.image-preview {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.selection-box {
  position: absolute;
  border: 2px dashed #409eff;
  background: rgba(64, 158, 255, 0.1);
  cursor: move;
}

.preview-info {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 6px;
}

.preview-info h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
}

.preview-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.results-container {
  padding: 20px 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h3 {
  margin: 0;
  color: #303133;
}

.results-actions {
  display: flex;
  gap: 12px;
}

.empty-results {
  padding: 60px 0;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.icon-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.icon-preview {
  margin-bottom: 12px;
}

.icon-preview img {
  max-width: 100%;
  max-height: 120px;
  border-radius: 4px;
}

.icon-info {
  margin-bottom: 16px;
  text-align: left;
}

.icon-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.icon-actions {
  display: flex;
  gap: 8px;
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

.settings-container {
  padding: 20px 0;
}

.settings-container h3 {
  margin-bottom: 20px;
  color: #303133;
}

.settings-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.settings-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.setting-item label {
  min-width: 120px;
  font-weight: 500;
  color: #303133;
}

.setting-item .unit {
  color: #909399;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .extract-container,
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .icons-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .setting-item label {
    min-width: auto;
  }
}
</style>
