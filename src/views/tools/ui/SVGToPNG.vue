<template>
  <div class="svg-to-png-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- SVG转换 -->
      <el-tab-pane label="SVG转换" name="convert">
        <div class="convert-container">
          <div class="upload-section">
            <h3>上传SVG文件</h3>
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept=".svg,image/svg+xml"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将SVG文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持SVG格式文件，文件大小不超过 5MB
                </div>
              </template>
            </el-upload>
            
            <div v-if="currentSVG" class="svg-info">
              <h4>SVG信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">文件名：</span>
                  <span>{{ currentSVG.name }}</span>
                </div>
                <div class="info-item">
                  <span class="label">文件大小：</span>
                  <span>{{ formatFileSize(currentSVG.size) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">原始尺寸：</span>
                  <span>{{ svgInfo.originalWidth }} × {{ svgInfo.originalHeight }}</span>
                </div>
                <div class="info-item">
                  <span class="label">视口尺寸：</span>
                  <span>{{ svgInfo.viewBox || '未设置' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>转换设置</h3>
            <div class="settings-grid">
              <div class="setting-group">
                <label>输出尺寸：</label>
                <div class="size-inputs">
                  <el-input
                    v-model="outputSettings.width"
                    type="number"
                    placeholder="宽度"
                    @input="updateOutputSize"
                  >
                    <template #append>px</template>
                  </el-input>
                  <span>×</span>
                  <el-input
                    v-model="outputSettings.height"
                    type="number"
                    placeholder="高度"
                    @input="updateOutputSize"
                  >
                    <template #append>px</template>
                  </el-input>
                </div>
                
                <div class="size-presets">
                  <el-button
                    v-for="preset in sizePresets"
                    :key="preset.name"
                    size="small"
                    @click="useSizePreset(preset)"
                  >
                    {{ preset.name }}
                  </el-button>
                </div>
              </div>
              
              <div class="setting-group">
                <label>输出格式：</label>
                <el-radio-group v-model="outputSettings.format" @change="updateFormatOptions">
                  <el-radio label="png">PNG</el-radio>
                  <el-radio label="jpg">JPG</el-radio>
                  <el-radio label="webp">WebP</el-radio>
                </el-radio-group>
              </div>
              
              <div class="setting-group">
                <label>质量设置：</label>
                <el-slider
                  v-model="outputSettings.quality"
                  :min="1"
                  :max="100"
                  :step="1"
                  show-input
                  show-input-controls
                  :disabled="outputSettings.format === 'png'"
                />
              </div>
              
              <div class="setting-group">
                <label>背景设置：</label>
                <el-radio-group v-model="outputSettings.background" @change="updateBackgroundOptions">
                  <el-radio label="transparent">透明</el-radio>
                  <el-radio label="white">白色</el-radio>
                  <el-radio label="black">黑色</el-radio>
                  <el-radio label="custom">自定义</el-radio>
                </el-radio-group>
                
                <div v-if="outputSettings.background === 'custom'" class="custom-background">
                  <el-color-picker v-model="outputSettings.customBackgroundColor" />
                  <span class="color-preview" :style="{ backgroundColor: outputSettings.customBackgroundColor }"></span>
                </div>
              </div>
              
              <div class="setting-group">
                <label>缩放模式：</label>
                <el-select v-model="outputSettings.scaleMode" @change="updateScaleMode">
                  <el-option label="拉伸填充" value="stretch" />
                  <el-option label="保持比例" value="aspect" />
                  <el-option label="居中裁剪" value="crop" />
                  <el-option label="居中留白" value="padding" />
                </el-select>
              </div>
              
              <div class="setting-group">
                <label>高级选项：</label>
                <div class="advanced-options">
                  <el-checkbox v-model="outputSettings.antialiasing">抗锯齿</el-checkbox>
                  <el-checkbox v-model="outputSettings.optimize">优化输出</el-checkbox>
                  <el-checkbox v-model="outputSettings.embedFonts">嵌入字体</el-checkbox>
                </div>
              </div>
            </div>
            
            <div class="convert-actions">
              <el-button type="primary" @click="convertSVG" :disabled="!currentSVG">
                开始转换
              </el-button>
              <el-button @click="resetSettings">重置设置</el-button>
              <el-button @click="previewConversion">预览效果</el-button>
            </div>
          </div>
        </div>
        
        <!-- SVG预览 -->
        <div v-if="currentSVG" class="preview-section">
          <h3>SVG预览</h3>
          <div class="preview-container">
            <div class="svg-preview">
              <div class="preview-header">
                <span>原始SVG</span>
                <div class="preview-controls">
                  <el-button size="small" @click="zoomIn">放大</el-button>
                  <el-button size="small" @click="zoomOut">缩小</el-button>
                  <el-button size="small" @click="resetZoom">重置</el-button>
                </div>
              </div>
              <div class="preview-content" ref="svgPreviewRef">
                <div v-html="svgContent" class="svg-content"></div>
              </div>
            </div>
            
            <div class="conversion-preview">
              <div class="preview-header">
                <span>转换预览</span>
                <span class="preview-size">{{ outputSettings.width }} × {{ outputSettings.height }}px</span>
              </div>
              <div class="preview-content" ref="conversionPreviewRef">
                <canvas ref="previewCanvas" :width="outputSettings.width" :height="outputSettings.height"></canvas>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 转换结果 -->
      <el-tab-pane label="转换结果" name="results">
        <div class="results-container">
          <div class="results-header">
            <h3>转换结果</h3>
            <div class="results-actions">
              <el-button @click="downloadAll" type="primary" :disabled="conversionResults.length === 0">
                下载全部
              </el-button>
              <el-button @click="clearResults" :disabled="conversionResults.length === 0">
                清空结果
              </el-button>
            </div>
          </div>
          
          <div v-if="conversionResults.length === 0" class="empty-results">
            <el-empty description="暂无转换结果" />
          </div>
          
          <div v-else class="results-grid">
            <div
              v-for="(result, index) in conversionResults"
              :key="index"
              class="result-item"
            >
              <div class="result-preview">
                <img :src="result.dataUrl" :alt="`结果 ${index + 1}`" />
              </div>
              <div class="result-info">
                <p><strong>文件名：</strong>{{ result.fileName }}</p>
                <p><strong>尺寸：</strong>{{ result.width }} × {{ result.height }}px</p>
                <p><strong>格式：</strong>{{ result.format.toUpperCase() }}</p>
                <p><strong>大小：</strong>{{ formatFileSize(result.size) }}</p>
                <p><strong>背景：</strong>{{ getBackgroundLabel(result.background) }}</p>
              </div>
              <div class="result-actions">
                <el-button size="small" @click="downloadResult(result, index)">下载</el-button>
                <el-button size="small" @click="copyResult(result, index)">复制</el-button>
                <el-button size="small" type="danger" @click="removeResult(index)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 批量转换 -->
      <el-tab-pane label="批量转换" name="batch">
        <div class="batch-container">
          <div class="batch-upload">
            <h3>批量上传SVG</h3>
            <el-upload
              ref="batchUploadRef"
              :auto-upload="false"
              :on-change="handleBatchFileChange"
              :file-list="batchFiles"
              accept=".svg,image/svg+xml"
              multiple
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将多个SVG文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持批量上传多个SVG文件，将使用相同的转换设置
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
                  <el-option label="添加后缀" value="suffix" />
                  <el-option label="序号命名" value="sequence" />
                </el-select>
              </div>
              
              <div class="option-group" v-if="batchNaming === 'suffix'">
                <label>后缀：</label>
                <el-input v-model="batchSuffix" placeholder="例如：_converted" />
              </div>
              
              <div class="option-group">
                <label>压缩打包：</label>
                <el-checkbox v-model="batchCompress">生成ZIP压缩包</el-checkbox>
              </div>
            </div>
            
            <div class="batch-actions">
              <el-button type="primary" @click="startBatchConversion" :disabled="batchFiles.length === 0">
                开始批量转换
              </el-button>
              <el-button @click="clearBatchFiles">清空文件</el-button>
            </div>
          </div>
          
          <div v-if="batchProgress > 0" class="batch-progress">
            <h4>转换进度</h4>
            <el-progress :percentage="batchProgress" :status="batchProgress === 100 ? 'success' : ''" />
            <p v-if="batchProgress < 100">正在转换第 {{ currentBatchIndex + 1 }} 个文件...</p>
            <p v-else>批量转换完成！</p>
          </div>
        </div>
      </el-tab-pane>

      <!-- 常用尺寸 -->
      <el-tab-pane label="常用尺寸" name="presets">
        <div class="presets-container">
          <h3>常用尺寸预设</h3>
          
          <div class="preset-categories">
            <div class="preset-category">
              <h4>社交媒体</h4>
              <div class="preset-grid">
                <div
                  v-for="preset in socialMediaPresets"
                  :key="preset.name"
                  class="preset-item"
                  @click="useSizePreset(preset)"
                >
                  <div class="preset-size">{{ preset.width }} × {{ preset.height }}</div>
                  <div class="preset-name">{{ preset.name }}</div>
                  <div class="preset-desc">{{ preset.description }}</div>
                </div>
              </div>
            </div>
            
            <div class="preset-category">
              <h4>网站图标</h4>
              <div class="preset-grid">
                <div
                  v-for="preset in websitePresets"
                  :key="preset.name"
                  class="preset-item"
                  @click="useSizePreset(preset)"
                >
                  <div class="preset-size">{{ preset.width }} × {{ preset.height }}</div>
                  <div class="preset-name">{{ preset.name }}</div>
                  <div class="preset-desc">{{ preset.description }}</div>
                </div>
              </div>
            </div>
            
            <div class="preset-category">
              <h4>移动应用</h4>
              <div class="preset-grid">
                <div
                  v-for="preset in mobileAppPresets"
                  :key="preset.name"
                  class="preset-item"
                  @click="useSizePreset(preset)"
                >
                  <div class="preset-size">{{ preset.width }} × {{ preset.height }}</div>
                  <div class="preset-name">{{ preset.name }}</div>
                  <div class="preset-desc">{{ preset.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('convert')
const uploadRef = ref()
const batchUploadRef = ref()
const svgPreviewRef = ref()
const conversionPreviewRef = ref()
const previewCanvas = ref()

// 当前SVG
const currentSVG = ref<File | null>(null)
const svgContent = ref('')
const svgInfo = reactive({
  originalWidth: '',
  originalHeight: '',
  viewBox: ''
})

// 输出设置
const outputSettings = reactive({
  width: 512,
  height: 512,
  format: 'png',
  quality: 90,
  background: 'transparent',
  customBackgroundColor: '#ffffff',
  scaleMode: 'aspect',
  antialiasing: true,
  optimize: true,
  embedFonts: false
})

// 尺寸预设
const sizePresets = ref([
  { name: '16×16', width: 16, height: 16 },
  { name: '32×32', width: 32, height: 32 },
  { name: '64×64', width: 64, height: 64 },
  { name: '128×128', width: 128, height: 128 },
  { name: '256×256', width: 256, height: 256 },
  { name: '512×512', width: 512, height: 512 },
  { name: '1024×1024', width: 1024, height: 1024 }
])

// 常用尺寸预设
const socialMediaPresets = ref([
  { name: 'Facebook', width: 1200, height: 630, description: 'Facebook分享图片' },
  { name: 'Twitter', width: 1200, height: 675, description: 'Twitter卡片图片' },
  { name: 'Instagram', width: 1080, height: 1080, description: 'Instagram方形图片' },
  { name: 'LinkedIn', width: 1200, height: 627, description: 'LinkedIn分享图片' }
])

const websitePresets = ref([
  { name: 'Favicon', width: 32, height: 32, description: '网站图标' },
  { name: 'Apple Touch', width: 180, height: 180, description: 'Apple设备图标' },
  { name: 'Android', width: 192, height: 192, description: 'Android设备图标' },
  { name: 'Windows Tile', width: 144, height: 144, description: 'Windows磁贴图标' }
])

const mobileAppPresets = ref([
  { name: 'App Icon', width: 1024, height: 1024, description: '应用商店图标' },
  { name: 'Spotlight', width: 120, height: 120, description: 'iOS Spotlight图标' },
  { name: 'Settings', width: 87, height: 87, description: 'iOS设置图标' },
  { name: 'Notification', width: 40, height: 40, description: '通知栏图标' }
])

// 转换结果
const conversionResults = ref<any[]>([])

// 批量处理
const batchFiles = ref<any[]>([])
const batchOutputDir = ref('converted_svg')
const batchNaming = ref('original')
const batchSuffix = ref('_converted')
const batchCompress = ref(true)
const batchProgress = ref(0)
const currentBatchIndex = ref(0)

// 缩放相关
let currentZoom = 1

// 方法
const handleFileChange = (file: any) => {
  if (file && file.raw) {
    currentSVG.value = file.raw
    loadSVGContent(file.raw)
  }
}

const loadSVGContent = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    svgContent.value = content
    parseSVGInfo(content)
    nextTick(() => {
      updatePreview()
    })
  }
  reader.readAsText(file)
}

const parseSVGInfo = (content: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  
  if (svg) {
    svgInfo.originalWidth = svg.getAttribute('width') || 'auto'
    svgInfo.originalHeight = svg.getAttribute('height') || 'auto'
    svgInfo.viewBox = svg.getAttribute('viewBox') || '未设置'
    
    // 如果没有设置尺寸，尝试从viewBox获取
    if (svgInfo.originalWidth === 'auto' && svgInfo.viewBox !== '未设置') {
      const viewBoxParts = svgInfo.viewBox.split(' ')
      if (viewBoxParts.length >= 4) {
        outputSettings.width = parseInt(viewBoxParts[2])
        outputSettings.height = parseInt(viewBoxParts[3])
      }
    } else if (svgInfo.originalWidth !== 'auto') {
      outputSettings.width = parseInt(svgInfo.originalWidth)
      outputSettings.height = parseInt(svgInfo.originalHeight)
    }
  }
}

const updateOutputSize = () => {
  if (outputSettings.scaleMode === 'aspect') {
    // 保持宽高比
    const aspectRatio = outputSettings.width / outputSettings.height
    if (aspectRatio > 1) {
      outputSettings.height = Math.round(outputSettings.width / aspectRatio)
    } else {
      outputSettings.width = Math.round(outputSettings.height * aspectRatio)
    }
  }
  updatePreview()
}

const useSizePreset = (preset: any) => {
  outputSettings.width = preset.width
  outputSettings.height = preset.height
  updatePreview()
  ElMessage.success(`已应用尺寸预设：${preset.name}`)
}

const updateFormatOptions = () => {
  if (outputSettings.format === 'png') {
    outputSettings.background = 'transparent'
  } else {
    if (outputSettings.background === 'transparent') {
      outputSettings.background = 'white'
    }
  }
}

const updateBackgroundOptions = () => {
  if (outputSettings.background === 'custom') {
    outputSettings.customBackgroundColor = '#ffffff'
  }
}

const updateScaleMode = () => {
  updateOutputSize()
}

const zoomIn = () => {
  currentZoom = Math.min(currentZoom * 1.2, 5)
  updateZoom()
}

const zoomOut = () => {
  currentZoom = Math.max(currentZoom / 1.2, 0.1)
  updateZoom()
}

const resetZoom = () => {
  currentZoom = 1
  updateZoom()
}

const updateZoom = () => {
  if (svgPreviewRef.value) {
    const content = svgPreviewRef.value.querySelector('.svg-content')
    if (content) {
      content.style.transform = `scale(${currentZoom})`
      content.style.transformOrigin = 'center'
    }
  }
}

const updatePreview = () => {
  nextTick(() => {
    if (previewCanvas.value && svgContent.value) {
      const canvas = previewCanvas.value
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // 设置背景
        if (outputSettings.background === 'transparent') {
          // 透明背景，绘制棋盘格
          drawCheckerboard(ctx, canvas.width, canvas.height)
        } else {
          let bgColor = '#ffffff'
          if (outputSettings.background === 'black') {
            bgColor = '#000000'
          } else if (outputSettings.background === 'custom') {
            bgColor = outputSettings.customBackgroundColor
          }
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        // 这里应该渲染SVG到Canvas，但为了演示，我们绘制一个占位符
        ctx.strokeStyle = '#409eff'
        ctx.lineWidth = 2
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
        
        ctx.fillStyle = '#409eff'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('SVG预览', canvas.width / 2, canvas.height / 2)
      }
    }
  })
}

const drawCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = 10
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const isEven = ((x / size) + (y / size)) % 2 === 0
      ctx.fillStyle = isEven ? '#f0f0f0' : '#e0e0e0'
      ctx.fillRect(x, y, size, size)
    }
  }
}

const previewConversion = () => {
  updatePreview()
  ElMessage.success('预览已更新')
}

const convertSVG = async () => {
  if (!currentSVG.value) return
  
  try {
    ElMessage.info('正在转换SVG...')
    
    // 模拟转换过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 创建转换结果
    const result = {
      fileName: `${currentSVG.value.name.replace('.svg', '')}.${outputSettings.format}`,
      width: outputSettings.width,
      height: outputSettings.height,
      format: outputSettings.format,
      size: Math.floor(currentSVG.value.size / 2), // 模拟文件大小
      background: outputSettings.background,
      dataUrl: previewCanvas.value?.toDataURL(`image/${outputSettings.format}`, outputSettings.quality / 100) || ''
    }
    
    conversionResults.value.push(result)
    ElMessage.success('SVG转换完成')
    
    // 切换到结果标签页
    activeTab.value = 'results'
    
  } catch (error) {
    ElMessage.error('转换失败：' + error.message)
  }
}

const resetSettings = () => {
  Object.assign(outputSettings, {
    width: 512,
    height: 512,
    format: 'png',
    quality: 90,
    background: 'transparent',
    customBackgroundColor: '#ffffff',
    scaleMode: 'aspect',
    antialiasing: true,
    optimize: true,
    embedFonts: false
  })
  updatePreview()
  ElMessage.success('设置已重置')
}

const downloadResult = (result: any, index: number) => {
  const link = document.createElement('a')
  link.href = result.dataUrl
  link.download = result.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('文件已下载')
}

const copyResult = async (result: any, index: number) => {
  try {
    const response = await fetch(result.dataUrl)
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

const removeResult = (index: number) => {
  conversionResults.value.splice(index, 1)
  ElMessage.success('结果已删除')
}

const downloadAll = async () => {
  if (conversionResults.value.length === 0) return
  
  try {
    const JSZip = await import('jszip')
    const zip = new JSZip.default()
    
    conversionResults.value.forEach((result, index) => {
      zip.file(result.fileName, result.dataUrl.split(',')[1], { base64: true })
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'converted_svg.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('所有文件已打包下载')
  } catch (error) {
    ElMessage.error('下载失败：' + error.message)
  }
}

const clearResults = () => {
  conversionResults.value = []
  ElMessage.success('结果已清空')
}

const handleBatchFileChange = (file: any) => {
  batchFiles.value.push(file)
}

const startBatchConversion = async () => {
  if (batchFiles.value.length === 0) return
  
  try {
    batchProgress.value = 0
    currentBatchIndex.value = 0
    
    for (let i = 0; i < batchFiles.value.length; i++) {
      currentBatchIndex.value = i
      batchProgress.value = Math.round((i / batchFiles.value.length) * 100)
      
      // 模拟转换过程
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    batchProgress.value = 100
    ElMessage.success('批量转换完成')
    
  } catch (error) {
    ElMessage.error('批量转换失败：' + error.message)
  }
}

const clearBatchFiles = () => {
  batchFiles.value = []
  batchProgress.value = 0
  currentBatchIndex.value = 0
}

const getBackgroundLabel = (background: string) => {
  switch (background) {
    case 'transparent': return '透明'
    case 'white': return '白色'
    case 'black': return '黑色'
    case 'custom': return '自定义'
    default: return background
  }
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
  // 初始化预览
  updatePreview()
})
</script>

<style scoped>
.svg-to-png-tool {
  padding: 20px;
}

.convert-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-section,
.settings-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.upload-section h3,
.settings-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.svg-info {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.svg-info h4 {
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

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.setting-group {
  margin-bottom: 16px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.size-inputs span {
  font-size: 18px;
  color: #909399;
}

.size-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.custom-background {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.advanced-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.convert-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
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
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.svg-preview,
.conversion-preview {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: #303133;
}

.preview-controls {
  display: flex;
  gap: 8px;
}

.preview-size {
  font-size: 14px;
  color: #909399;
}

.preview-content {
  padding: 20px;
  text-align: center;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-content {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.2s ease;
}

.svg-content svg {
  max-width: 100%;
  max-height: 100%;
}

.preview-content canvas {
  max-width: 100%;
  max-height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
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

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.result-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.result-preview {
  margin-bottom: 12px;
}

.result-preview img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
}

.result-info {
  margin-bottom: 16px;
  text-align: left;
}

.result-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.result-actions {
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

.presets-container {
  padding: 20px 0;
}

.presets-container h3 {
  margin-bottom: 20px;
  color: #303133;
}

.preset-categories {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.preset-category h4 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 18px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.preset-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.preset-size {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.preset-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.preset-desc {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .convert-container,
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .preset-grid {
    grid-template-columns: 1fr;
  }
  
  .size-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .size-inputs span {
    display: none;
  }
}
</style>
