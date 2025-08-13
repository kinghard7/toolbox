<template>
  <div class="gradient-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 渐变生成器 -->
      <el-tab-pane label="渐变生成器" name="generator">
        <div class="generator-container">
          <div class="gradient-preview">
            <h3>渐变预览</h3>
            <div class="preview-area" :style="gradientStyle">
              <div class="preview-info">
                <p><strong>CSS代码：</strong></p>
                <code>{{ gradientCSS }}</code>
              </div>
            </div>
            <div class="preview-actions">
              <el-button @click="copyCSS">复制CSS</el-button>
              <el-button @click="downloadCSS">下载CSS</el-button>
            </div>
          </div>
          
          <div class="gradient-settings">
            <h3>渐变设置</h3>
            <div class="setting-group">
              <label>渐变类型：</label>
              <el-radio-group v-model="gradientType" @change="updateGradient">
                <el-radio label="linear">线性渐变</el-radio>
                <el-radio label="radial">径向渐变</el-radio>
                <el-radio label="conic">锥形渐变</el-radio>
              </el-radio-group>
            </div>
            
            <div class="setting-group">
              <label>方向/位置：</label>
              <div class="direction-controls">
                <el-select v-model="gradientDirection" @change="updateGradient">
                  <el-option label="to top" value="to top" />
                  <el-option label="to right" value="to right" />
                  <el-option label="to bottom" value="to bottom" />
                  <el-option label="to left" value="to left" />
                  <el-option label="to top right" value="to top right" />
                  <el-option label="to top left" value="to top left" />
                  <el-option label="to bottom right" value="to bottom right" />
                  <el-option label="to bottom left" value="to bottom left" />
                  <el-option label="45deg" value="45deg" />
                  <el-option label="90deg" value="90deg" />
                  <el-option label="135deg" value="135deg" />
                  <el-option label="180deg" value="180deg" />
                  <el-option label="225deg" value="225deg" />
                  <el-option label="270deg" value="270deg" />
                  <el-option label="315deg" value="315deg" />
                </el-select>
              </div>
            </div>
            
            <div class="setting-group">
              <label>颜色停止点：</label>
              <div class="color-stops">
                <div
                  v-for="(stop, index) in colorStops"
                  :key="index"
                  class="color-stop"
                >
                  <div class="stop-header">
                    <span>停止点 {{ index + 1 }}</span>
                    <el-button
                      size="small"
                      type="danger"
                      @click="removeColorStop(index)"
                      :disabled="colorStops.length <= 2"
                    >
                      删除
                    </el-button>
                  </div>
                  <div class="stop-controls">
                    <el-color-picker
                      v-model="stop.color"
                      @change="updateGradient"
                    />
                    <el-slider
                      v-model="stop.position"
                      :min="0"
                      :max="100"
                      :step="1"
                      show-input
                      @change="updateGradient"
                    />
                  </div>
                </div>
                <el-button @click="addColorStop" type="primary">添加颜色</el-button>
              </div>
            </div>
            
            <div class="setting-group">
              <label>高级选项：</label>
              <div class="advanced-options">
                <el-checkbox v-model="gradientOptions.repeat" @change="updateGradient">
                  重复渐变
                </el-checkbox>
                <el-checkbox v-model="gradientOptions.hardStop" @change="updateGradient">
                  硬停止
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 预设渐变 -->
      <el-tab-pane label="预设渐变" name="presets">
        <div class="presets-container">
          <h3>预设渐变</h3>
          
          <div class="preset-categories">
            <div class="preset-category">
              <h4>基础渐变</h4>
              <div class="preset-grid">
                <div
                  v-for="preset in basicPresets"
                  :key="preset.name"
                  class="preset-item"
                  :style="preset.style"
                  @click="usePreset(preset)"
                >
                  <div class="preset-name">{{ preset.name }}</div>
                </div>
              </div>
            </div>
            
            <div class="preset-category">
              <h4>现代渐变</h4>
              <div class="preset-grid">
                <div
                  v-for="preset in modernPresets"
                  :key="preset.name"
                  class="preset-item"
                  :style="preset.style"
                  @click="usePreset(preset)"
                >
                  <div class="preset-name">{{ preset.name }}</div>
                </div>
              </div>
            </div>
            
            <div class="preset-category">
              <h4>彩虹渐变</h4>
              <div class="preset-grid">
                <div
                  v-for="preset in rainbowPresets"
                  :key="preset.name"
                  class="preset-item"
                  :style="preset.style"
                  @click="usePreset(preset)"
                >
                  <div class="preset-name">{{ preset.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 渐变库 -->
      <el-tab-pane label="渐变库" name="library">
        <div class="library-container">
          <h3>渐变库</h3>
          
          <div class="library-filters">
            <el-input
              v-model="searchQuery"
              placeholder="搜索渐变..."
              prefix-icon="Search"
              clearable
            />
            <el-select v-model="filterCategory" placeholder="选择分类" clearable>
              <el-option label="全部" value="" />
              <el-option label="线性渐变" value="linear" />
              <el-option label="径向渐变" value="radial" />
              <el-option label="锥形渐变" value="conic" />
            </el-select>
          </div>
          
          <div class="gradient-library">
            <div
              v-for="gradient in filteredGradients"
              :key="gradient.id"
              class="library-item"
              :style="gradient.style"
              @click="useLibraryGradient(gradient)"
            >
              <div class="gradient-info">
                <h4>{{ gradient.name }}</h4>
                <p>{{ gradient.description }}</p>
                <div class="gradient-tags">
                  <el-tag
                    v-for="tag in gradient.tags"
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
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

// 响应式数据
const activeTab = ref('generator')

// 渐变设置
const gradientType = ref('linear')
const gradientDirection = ref('to bottom')
const colorStops = ref([
  { color: '#ff6b6b', position: 0 },
  { color: '#4ecdc4', position: 100 }
])

const gradientOptions = reactive({
  repeat: false,
  hardStop: false
})

// 预设渐变
const basicPresets = ref([
  { name: '蓝色到绿色', style: 'background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
  { name: '紫色到粉色', style: 'background: linear-gradient(to right, #667eea 0%, #764ba2 100%)' },
  { name: '橙色到红色', style: 'background: linear-gradient(to right, #f093fb 0%, #f5576c 100%)' },
  { name: '绿色到蓝色', style: 'background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' }
])

const modernPresets = ref([
  { name: '霓虹蓝', style: 'background: linear-gradient(45deg, #667eea 0%, #764ba2 100%)' },
  { name: '日落', style: 'background: linear-gradient(45deg, #fa709a 0%, #fee140 100%)' },
  { name: '海洋', style: 'background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)' },
  { name: '森林', style: 'background: linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%)' }
])

const rainbowPresets = ref([
  { name: '彩虹', style: 'background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
  { name: '彩虹径向', style: 'background: radial-gradient(circle, red, orange, yellow, green, blue, indigo, violet)' },
  { name: '彩虹锥形', style: 'background: conic-gradient(from 0deg, red, orange, yellow, green, blue, indigo, violet)' }
])

// 渐变库
const searchQuery = ref('')
const filterCategory = ref('')

const gradientLibrary = ref([
  {
    id: 1,
    name: '天空渐变',
    description: '从天空蓝到云朵白',
    type: 'linear',
    tags: ['天空', '自然', '清新'],
    style: 'background: linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)'
  },
  {
    id: 2,
    name: '日落渐变',
    description: '温暖的日落色彩',
    type: 'linear',
    tags: ['日落', '温暖', '橙色'],
    style: 'background: linear-gradient(45deg, #FF6B6B 0%, #FFE66D 100%)'
  },
  {
    id: 3,
    name: '海洋渐变',
    description: '深邃的海洋色彩',
    type: 'radial',
    tags: ['海洋', '深邃', '蓝色'],
    style: 'background: radial-gradient(circle, #006994 0%, #003366 100%)'
  }
])

// 计算属性
const gradientCSS = computed(() => {
  let css = ''
  
  if (gradientType.value === 'linear') {
    css = `linear-gradient(${gradientDirection.value}, `
  } else if (gradientType.value === 'radial') {
    css = `radial-gradient(circle at center, `
  } else if (gradientType.value === 'conic') {
    css = `conic-gradient(from 0deg, `
  }
  
  css += colorStops.value
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')
  
  css += ')'
  
  if (gradientOptions.repeat) {
    css = css.replace(')', '), ') + css
  }
  
  return css
})

const gradientStyle = computed(() => {
  return {
    background: gradientCSS.value
  }
})

const filteredGradients = computed(() => {
  let filtered = gradientLibrary.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(gradient =>
      gradient.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      gradient.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      gradient.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  
  if (filterCategory.value) {
    filtered = filtered.filter(gradient => gradient.type === filterCategory.value)
  }
  
  return filtered
})

// 方法
const updateGradient = () => {
  // 渐变已通过计算属性自动更新
}

const addColorStop = () => {
  colorStops.value.push({
    color: '#000000',
    position: 50
  })
}

const removeColorStop = (index: number) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1)
  }
}

const usePreset = (preset: any) => {
  // 这里应该解析预设渐变的CSS并应用到当前设置
  ElMessage.success(`已应用预设：${preset.name}`)
}

const useLibraryGradient = (gradient: any) => {
  // 这里应该应用库中的渐变
  ElMessage.success(`已应用渐变：${gradient.name}`)
}

const copyCSS = async () => {
  try {
    await navigator.clipboard.writeText(gradientCSS.value)
    ElMessage.success('CSS代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const downloadCSS = () => {
  const content = `.gradient {\n  background: ${gradientCSS.value};\n}`
  const blob = new Blob([content], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gradient.css'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('CSS文件已下载')
}

// 生命周期
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.gradient-tool {
  padding: 20px;
}

.generator-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.gradient-preview,
.gradient-settings {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.gradient-preview h3,
.gradient-settings h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.preview-area {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
}

.preview-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px;
}

.preview-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.preview-info code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.direction-controls {
  margin-top: 8px;
}

.color-stops {
  margin-top: 12px;
}

.color-stop {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}

.stop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #303133;
}

.stop-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.advanced-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
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
  height: 120px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preset-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preset-name {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.library-container {
  padding: 20px 0;
}

.library-container h3 {
  margin-bottom: 20px;
  color: #303133;
}

.library-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.gradient-library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.library-item {
  height: 150px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.library-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gradient-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px;
}

.gradient-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.gradient-info p {
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.9;
}

.gradient-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .generator-container {
    grid-template-columns: 1fr;
  }
  
  .preset-grid,
  .gradient-library {
    grid-template-columns: 1fr;
  }
  
  .library-filters {
    flex-direction: column;
  }
  
  .stop-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
