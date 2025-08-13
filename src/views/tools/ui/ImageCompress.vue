<template>
  <div class="image-compress-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 图片压缩 -->
      <el-tab-pane label="图片压缩" name="compress">
        <div class="compress-container">
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
                  支持 jpg/png/gif/webp 等格式，文件大小不超过 20MB
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
                  <span class="label">原始尺寸：</span>
                  <span>{{ imageInfo.width }} × {{ imageInfo.height }}px</span>
                </div>
                <div class="info-item">
                  <span class="label">原始大小：</span>
                  <span>{{ formatFileSize(currentImage.size) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">格式：</span>
                  <span>{{ imageInfo.format }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>压缩设置</h3>
            <div class="settings-grid">
              <div class="setting-group">
                <label>输出格式：</label>
                <el-radio-group v-model="compressSettings.format" @change="updateFormatOptions">
                  <el-radio label="jpeg">JPEG</el-radio>
                  <el-radio label="png">PNG</el-radio>
                  <el-radio label="webp">WebP</el-radio>
                  <el-radio label="avif">AVIF</el-radio>
                </el-radio-group>
              </div>
              
              <div class="setting-group">
                <label>质量设置：</label>
                <div class="quality-controls">
                  <el-slider
                    v-model="compressSettings.quality"
                    :min="1"
                    :max="100"
                    :step="1"
                    show-input
                    show-input-controls
                    @change="updateCompression"
                  />
                  <div class="quality-presets">
                    <el-button
                      v-for="preset in qualityPresets"
                      :key="preset.name"
                      size="small"
                      @click="useQualityPreset(preset)"
                    >
                      {{ preset.name }}
                    </el-button>
                  </div>
                </div>
              </div>
              
              <div class="setting-group">
                <label>尺寸设置：</label>
                <div class="size-controls">
                  <el-radio-group v-model="compressSettings.sizeMode" @change="updateSizeOptions">
                    <el-radio label="original">保持原尺寸</el-radio>
                    <el-radio label="custom">自定义尺寸</el-radio>
                    <el-radio label="percentage">按比例缩放</el-radio>
                    <el-radio label="maxDimension">最大尺寸限制</el-radio>
                  </el-radio-group>
                  
                  <div v-if="compressSettings.sizeMode === 'custom'" class="custom-size">
                    <el-input
                      v-model="compressSettings.customWidth"
                      type="number"
                      placeholder="宽度"
                      @input="updateCompression"
                    >
                      <template #append>px</template>
                    </el-input>
                    <span>×</span>
                    <el-input
                      v-model="compressSettings.customHeight"
                      type="number"
                      placeholder="高度"
                      @input="updateCompression"
                    >
                      <template #append>px</template>
                    </el-input>
                  </div>
                  
                  <div v-if="compressSettings.sizeMode === 'percentage'" class="percentage-size">
                    <el-input-number
                      v-model="compressSettings.scalePercentage"
                      :min="1"
                      :max="200"
                      :step="1"
                      placeholder="缩放百分比"
                      @change="updateCompression"
                    >
                      <template #append>%</template>
                    </el-input-number>
                  </div>
                  
                  <div v-if="compressSettings.sizeMode === 'maxDimension'" class="max-dimension">
                    <el-input-number
                      v-model="compressSettings.maxDimension"
                      :min="100"
                      :max="4000"
                      :step="100"
                      placeholder="最大尺寸"
                      @change="updateCompression"
                    >
                      <template #append>px</template>
                    </el-input-number>
                  </div>
                </div>
              </div>
              
              <div class="setting-group">
                <label>高级选项：</label>
                <div class="advanced-options">
                  <el-checkbox v-model="compressSettings.optimize" @change="updateCompression">优化压缩</el-checkbox>
                  <el-checkbox v-model="compressSettings.progressive" @change="updateCompression">渐进式JPEG</el-checkbox>
                  <el-checkbox v-model="compressSettings.stripMetadata" @change="updateCompression">移除元数据</el-checkbox>
                  <el-checkbox v-model="compressSettings.maintainAspectRatio" @change="updateCompression">保持宽高比</el-checkbox>
                </div>
              </div>
              
              <div class="setting-group">
                <label>目标文件大小：</label>
                <div class="target-size">
                  <el-input-number
                    v-model="compressSettings.targetSize"
                    :min="1"
                    :max="10000"
                    :step="1"
                    placeholder="目标大小"
                    @change="updateCompression"
                  >
                    <template #append>KB</template>
                  </el-input-number>
                  <el-button size="small" @click="autoOptimizeQuality">自动优化</el-button>
                </div>
              </div>
            </div>
            
            <div class="compress-actions">
              <el-button type="primary" @click="compressImage" :disabled="!currentImage">
                开始压缩
              </el-button>
              <el-button @click="resetSettings">重置设置</el-button>
              <el-button @click="previewCompression">预览效果</el-button>
            </div>
          </div>
        </div>
        
        <!-- 压缩预览 -->
        <div v-if="currentImage" class="preview-section">
          <h3>压缩预览</h3>
          <div class="preview-container">
            <div class="original-preview">
              <div class="preview-header">
                <span>原始图片</span>
                <span class="preview-size">{{ formatFileSize(currentImage.size) }}</span>
              </div>
              <div class="preview-content">
                <img :src="imagePreviewUrl" alt="原始图片" />
              </div>
            </div>
            
            <div class="compressed-preview">
              <div class="preview-header">
                <span>压缩后</span>
                <span class="preview-size">{{ formatFileSize(compressedSize) }}</span>
              </div>
              <div class="preview-content">
                <img :src="compressedPreviewUrl" alt="压缩后图片" />
              </div>
            </div>
          </div>
          
          <div class="compression-stats">
            <div class="stat-item">
              <span class="stat-label">压缩率：</span>
              <span class="stat-value">{{ compressionRatio }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">节省空间：</span>
              <span class="stat-value">{{ savedSpace }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">质量评分：</span>
              <span class="stat-value">{{ qualityScore }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 压缩结果 -->
      <el-tab-pane label="压缩结果" name="results">
        <div class="results-container">
          <div class="results-header">
            <h3>压缩结果</h3>
            <div class="results-actions">
              <el-button @click="downloadAll" type="primary" :disabled="compressionResults.length === 0">
                下载全部
              </el-button>
              <el-button @click="clearResults" :disabled="compressionResults.length === 0">
                清空结果
              </el-button>
            </div>
          </div>
          
          <div v-if="compressionResults.length === 0" class="empty-results">
            <el-empty description="暂无压缩结果" />
          </div>
          
          <div v-else class="results-grid">
            <div
              v-for="(result, index) in compressionResults"
              :key="index"
              class="result-item"
            >
              <div class="result-preview">
                <img :src="result.compressedUrl" :alt="`结果 ${index + 1}`" />
              </div>
              <div class="result-info">
                <p><strong>文件名：</strong>{{ result.fileName }}</p>
                <p><strong>原始尺寸：</strong>{{ result.originalWidth }} × {{ result.originalHeight }}px</p>
                <p><strong>压缩后尺寸：</strong>{{ result.compressedWidth }} × {{ result.compressedHeight }}px</p>
                <p><strong>原始大小：</strong>{{ formatFileSize(result.originalSize) }}</p>
                <p><strong>压缩后大小：</strong>{{ formatFileSize(result.compressedSize) }}</p>
                <p><strong>压缩率：</strong>{{ result.compressionRatio }}%</p>
                <p><strong>格式：</strong>{{ result.format.toUpperCase() }}</p>
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

      <!-- 批量压缩 -->
      <el-tab-pane label="批量压缩" name="batch">
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
              <template #tip>
                <div class="el-upload__tip">
                  支持批量上传多个图片文件，将使用相同的压缩设置
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
                <el-input v-model="batchSuffix" placeholder="例如：_compressed" />
              </div>
              
              <div class="option-group">
                <label>压缩打包：</label>
                <el-checkbox v-model="batchCompress">生成ZIP压缩包</el-checkbox>
              </div>
              
              <div class="option-group">
                <label>覆盖原文件：</label>
                <el-checkbox v-model="batchOverwrite">允许覆盖原文件</el-checkbox>
              </div>
            </div>
            
            <div class="batch-actions">
              <el-button type="primary" @click="startBatchCompression" :disabled="batchFiles.length === 0">
                开始批量压缩
              </el-button>
              <el-button @click="clearBatchFiles">清空文件</el-button>
            </div>
          </div>
          
          <div v-if="batchProgress > 0" class="batch-progress">
            <h4>压缩进度</h4>
            <el-progress :percentage="batchProgress" :status="batchProgress === 100 ? 'success' : ''" />
            <p v-if="batchProgress < 100">正在压缩第 {{ currentBatchIndex + 1 }} 个文件...</p>
            <p v-else>批量压缩完成！</p>
          </div>
        </div>
      </el-tab-pane>

      <!-- 压缩建议 -->
      <el-tab-pane label="压缩建议" name="advice">
        <div class="advice-container">
          <h3>压缩建议</h3>
          
          <div class="advice-categories">
            <div class="advice-category">
              <h4>不同用途的压缩建议</h4>
              <div class="advice-grid">
                <div class="advice-item">
                  <h5>网站图片</h5>
                  <ul>
                    <li>JPEG格式，质量70-80</li>
                    <li>最大宽度800-1200px</li>
                    <li>文件大小控制在100-300KB</li>
                    <li>使用渐进式JPEG</li>
                  </ul>
                </div>
                
                <div class="advice-item">
                  <h5>社交媒体</h5>
                  <ul>
                    <li>JPEG格式，质量80-90</li>
                    <li>尺寸按平台要求设置</li>
                    <li>文件大小控制在500KB以内</li>
                    <li>保持视觉质量</li>
                  </ul>
                </div>
                
                <div class="advice-item">
                  <h5>打印用途</h5>
                  <ul>
                    <li>PNG或TIFF格式</li>
                    <li>保持原始分辨率</li>
                    <li>质量设置为90-100</li>
                    <li>不压缩或轻微压缩</li>
                  </ul>
                </div>
                
                <div class="advice-item">
                  <h5>移动应用</h5>
                  <ul>
                    <li>WebP或AVIF格式</li>
                    <li>质量60-80</li>
                    <li>多种尺寸适配</li>
                    <li>文件大小控制在100KB以内</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="advice-category">
              <h4>格式选择建议</h4>
              <div class="format-advice">
                <div class="format-item">
                  <h5>JPEG</h5>
                  <p>适合照片和复杂图像，有损压缩，文件小</p>
                  <p><strong>适用场景：</strong>照片、网站图片、社交媒体</p>
                </div>
                
                <div class="format-item">
                  <h5>PNG</h5>
                  <p>无损压缩，支持透明背景，文件较大</p>
                  <p><strong>适用场景：</strong>图标、截图、需要透明背景的图片</p>
                </div>
                
                <div class="format-item">
                  <h5>WebP</h5>
                  <p>Google开发的现代格式，压缩率高</p>
                  <p><strong>适用场景：</strong>网站图片、移动应用、现代浏览器</p>
                </div>
                
                <div class="format-item">
                  <h5>AVIF</h5>
                  <p>最新的图像格式，压缩率最高</p>
                  <p><strong>适用场景：</strong>未来网站、现代应用、支持AVIF的浏览器</p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('compress')
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

// 压缩设置
const compressSettings = reactive({
  format: 'jpeg',
  quality: 80,
  sizeMode: 'original',
  customWidth: 800,
  customHeight: 600,
  scalePercentage: 100,
  maxDimension: 1200,
  targetSize: 500,
  optimize: true,
  progressive: true,
  stripMetadata: true,
  maintainAspectRatio: true
})

// 质量预设
const qualityPresets = ref([
  { name: '低质量', quality: 30, description: '文件最小，质量较低' },
  { name: '中等质量', quality: 60, description: '平衡质量和文件大小' },
  { name: '高质量', quality: 80, description: '保持较好质量' },
  { name: '最高质量', quality: 95, description: '接近原始质量' }
])

// 压缩预览
const compressedPreviewUrl = ref('')
const compressedSize = ref(0)

// 压缩结果
const compressionResults = ref<any[]>([])

// 批量处理
const batchFiles = ref<any[]>([])
const batchOutputDir = ref('compressed_images')
const batchNaming = ref('original')
const batchSuffix = ref('_compressed')
const batchCompress = ref(true)
const batchOverwrite = ref(false)
const batchProgress = ref(0)
const currentBatchIndex = ref(0)

// 计算属性
const compressionRatio = computed(() => {
  if (!currentImage.value || compressedSize.value === 0) return 0
  return Math.round(((currentImage.value.size - compressedSize.value) / currentImage.value.size) * 100)
})

const savedSpace = computed(() => {
  if (!currentImage.value || compressedSize.value === 0) return '0 B'
  const saved = currentImage.value.size - compressedSize.value
  return formatFileSize(saved)
})

const qualityScore = computed(() => {
  if (compressionRatio.value >= 80) return '优秀'
  if (compressionRatio.value >= 60) return '良好'
  if (compressionRatio.value >= 40) return '一般'
  return '较差'
})

// 方法
const handleFileChange = (file: any) => {
  if (file && file.raw) {
    currentImage.value = file.raw
    imagePreviewUrl.value = URL.createObjectURL(file.raw)
    loadImageInfo(file.raw)
    updateCompression()
  }
}

const loadImageInfo = (file: File) => {
  const img = new Image()
  img.onload = () => {
    imageInfo.width = img.width
    imageInfo.height = img.height
    imageInfo.format = file.type.split('/')[1] || 'unknown'
    
    // 设置默认自定义尺寸
    compressSettings.customWidth = img.width
    compressSettings.customHeight = img.height
  }
  img.src = URL.createObjectURL(file)
}

const updateFormatOptions = () => {
  if (compressSettings.format === 'jpeg') {
    compressSettings.progressive = true
  } else {
    compressSettings.progressive = false
  }
  updateCompression()
}

const updateSizeOptions = () => {
  if (compressSettings.sizeMode === 'custom') {
    compressSettings.customWidth = imageInfo.width
    compressSettings.customHeight = imageInfo.height
  } else if (compressSettings.sizeMode === 'percentage') {
    compressSettings.scalePercentage = 100
  } else if (compressSettings.sizeMode === 'maxDimension') {
    compressSettings.maxDimension = Math.max(imageInfo.width, imageInfo.height)
  }
  updateCompression()
}

const useQualityPreset = (preset: any) => {
  compressSettings.quality = preset.quality
  updateCompression()
  ElMessage.success(`已应用质量预设：${preset.name}`)
}

const updateCompression = () => {
  if (!currentImage.value) return
  
  // 模拟压缩计算
  const baseSize = currentImage.value.size
  let compressionFactor = 1 - (compressSettings.quality / 100)
  
  // 格式影响
  if (compressSettings.format === 'webp') compressionFactor *= 0.8
  if (compressSettings.format === 'avif') compressionFactor *= 0.6
  if (compressSettings.format === 'png') compressionFactor *= 0.5
  
  // 尺寸影响
  let sizeFactor = 1
  if (compressSettings.sizeMode === 'custom') {
    const originalArea = imageInfo.width * imageInfo.height
    const newArea = compressSettings.customWidth * compressSettings.customHeight
    sizeFactor = newArea / originalArea
  } else if (compressSettings.sizeMode === 'percentage') {
    sizeFactor = (compressSettings.scalePercentage / 100) ** 2
  } else if (compressSettings.sizeMode === 'maxDimension') {
    const maxDim = Math.max(imageInfo.width, imageInfo.height)
    if (maxDim > compressSettings.maxDimension) {
      const scale = compressSettings.maxDimension / maxDim
      sizeFactor = scale ** 2
    }
  }
  
  // 优化影响
  if (compressSettings.optimize) compressionFactor *= 0.9
  if (compressSettings.stripMetadata) compressionFactor *= 0.95
  
  compressedSize.value = Math.round(baseSize * compressionFactor * sizeFactor)
  
  // 更新预览
  updateCompressedPreview()
}

const updateCompressedPreview = () => {
  // 这里应该实际压缩图片并生成预览
  // 为了演示，我们使用原始图片
  compressedPreviewUrl.value = imagePreviewUrl.value
}

const previewCompression = () => {
  updateCompression()
  ElMessage.success('压缩预览已更新')
}

const compressImage = async () => {
  if (!currentImage.value) return
  
  try {
    ElMessage.info('正在压缩图片...')
    
    // 模拟压缩过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 创建压缩结果
    const result = {
      fileName: `${currentImage.value.name.replace(/\.[^/.]+$/, '')}_compressed.${compressSettings.format}`,
      originalWidth: imageInfo.width,
      originalHeight: imageInfo.height,
      compressedWidth: getCompressedWidth(),
      compressedHeight: getCompressedHeight(),
      originalSize: currentImage.value.size,
      compressedSize: compressedSize.value,
      compressionRatio: compressionRatio.value,
      format: compressSettings.format,
      compressedUrl: compressedPreviewUrl.value
    }
    
    compressionResults.value.push(result)
    ElMessage.success('图片压缩完成')
    
    // 切换到结果标签页
    activeTab.value = 'results'
    
  } catch (error) {
    ElMessage.error('压缩失败：' + error.message)
  }
}

const getCompressedWidth = () => {
  if (compressSettings.sizeMode === 'custom') {
    return compressSettings.customWidth
  } else if (compressSettings.sizeMode === 'percentage') {
    return Math.round(imageInfo.width * compressSettings.scalePercentage / 100)
  } else if (compressSettings.sizeMode === 'maxDimension') {
    const maxDim = Math.max(imageInfo.width, imageInfo.height)
    if (maxDim > compressSettings.maxDimension) {
      const scale = compressSettings.maxDimension / maxDim
      return Math.round(imageInfo.width * scale)
    }
  }
  return imageInfo.width
}

const getCompressedHeight = () => {
  if (compressSettings.sizeMode === 'custom') {
    return compressSettings.customHeight
  } else if (compressSettings.sizeMode === 'percentage') {
    return Math.round(imageInfo.height * compressSettings.scalePercentage / 100)
  } else if (compressSettings.sizeMode === 'maxDimension') {
    const maxDim = Math.max(imageInfo.width, imageInfo.height)
    if (maxDim > compressSettings.maxDimension) {
      const scale = compressSettings.maxDimension / maxDim
      return Math.round(imageInfo.height * scale)
    }
  }
  return imageInfo.height
}

const autoOptimizeQuality = () => {
  if (!currentImage.value) return
  
  const targetBytes = compressSettings.targetSize * 1024
  const currentBytes = currentImage.value.size
  
  if (targetBytes >= currentBytes) {
    compressSettings.quality = 100
  } else {
    // 简单的质量计算
    const ratio = targetBytes / currentBytes
    compressSettings.quality = Math.round(ratio * 100)
    compressSettings.quality = Math.max(1, Math.min(100, compressSettings.quality))
  }
  
  updateCompression()
  ElMessage.success('已自动优化质量设置')
}

const resetSettings = () => {
  Object.assign(compressSettings, {
    format: 'jpeg',
    quality: 80,
    sizeMode: 'original',
    customWidth: 800,
    customHeight: 600,
    scalePercentage: 100,
    maxDimension: 1200,
    targetSize: 500,
    optimize: true,
    progressive: true,
    stripMetadata: true,
    maintainAspectRatio: true
  })
  updateCompression()
  ElMessage.success('设置已重置')
}

const downloadResult = (result: any, index: number) => {
  const link = document.createElement('a')
  link.href = result.compressedUrl
  link.download = result.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('文件已下载')
}

const copyResult = async (result: any, index: number) => {
  try {
    const response = await fetch(result.compressedUrl)
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
  compressionResults.value.splice(index, 1)
  ElMessage.success('结果已删除')
}

const downloadAll = async () => {
  if (compressionResults.value.length === 0) return
  
  try {
    const JSZip = await import('jszip')
    const zip = new JSZip.default()
    
    compressionResults.value.forEach((result, index) => {
      zip.file(result.fileName, result.compressedUrl.split(',')[1], { base64: true })
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'compressed_images.zip'
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
  compressionResults.value = []
  ElMessage.success('结果已清空')
}

const handleBatchFileChange = (file: any) => {
  batchFiles.value.push(file)
}

const startBatchCompression = async () => {
  if (batchFiles.value.length === 0) return
  
  try {
    batchProgress.value = 0
    currentBatchIndex.value = 0
    
    for (let i = 0; i < batchFiles.value.length; i++) {
      currentBatchIndex.value = i
      batchProgress.value = Math.round((i / batchFiles.value.length) * 100)
      
      // 模拟压缩过程
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    batchProgress.value = 100
    ElMessage.success('批量压缩完成')
    
  } catch (error) {
    ElMessage.error('批量压缩失败：' + error.message)
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
.image-compress-tool {
  padding: 20px;
}

.compress-container {
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

.quality-controls {
  margin-bottom: 12px;
}

.quality-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.size-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-size,
.percentage-size,
.max-dimension {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.custom-size span {
  font-size: 18px;
  color: #909399;
}

.advanced-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.target-size {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compress-actions {
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
  margin-bottom: 20px;
}

.original-preview,
.compressed-preview {
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

.preview-size {
  font-size: 14px;
  color: #909399;
}

.preview-content {
  padding: 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.compression-stats {
  display: flex;
  gap: 40px;
  justify-content: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.advice-container {
  padding: 20px 0;
}

.advice-container h3 {
  margin-bottom: 20px;
  color: #303133;
}

.advice-categories {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.advice-category h4 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 18px;
}

.advice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.advice-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.advice-item h5 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
}

.advice-item ul {
  margin: 0;
  padding-left: 20px;
}

.advice-item li {
  margin-bottom: 6px;
  color: #606266;
  font-size: 14px;
}

.format-advice {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.format-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.format-item h5 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
}

.format-item p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .compress-container,
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .advice-grid,
  .format-advice {
    grid-template-columns: 1fr;
  }
  
  .compression-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .custom-size {
    flex-direction: column;
    align-items: stretch;
  }
  
  .custom-size span {
    display: none;
  }
}
</style>
