<template>
  <div class="color-picker-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 颜色选择器 -->
      <el-tab-pane label="颜色选择器" name="picker">
        <div class="picker-container">
          <div class="color-display">
            <h3>颜色显示</h3>
            <div class="color-preview" :style="{ backgroundColor: currentColor }">
              <div class="color-info">
                <p><strong>当前颜色：</strong>{{ currentColor }}</p>
                <p><strong>RGB：</strong>{{ colorRGB }}</p>
                <p><strong>HSL：</strong>{{ colorHSL }}</p>
                <p><strong>HEX：</strong>{{ currentColor }}</p>
              </div>
            </div>
            <div class="color-actions">
              <el-button @click="copyColor">复制颜色</el-button>
              <el-button @click="addToPalette">添加到调色板</el-button>
              <el-button @click="resetColor">重置</el-button>
            </div>
          </div>
          
          <div class="color-controls">
            <h3>颜色控制</h3>
            <div class="control-group">
              <label>颜色选择：</label>
              <el-color-picker
                v-model="currentColor"
                @change="updateColor"
                show-alpha
                size="large"
              />
            </div>
            
            <div class="control-group">
              <label>图片取色：</label>
              <div class="image-picker">
                <el-upload
                  class="image-upload"
                  accept="image/*"
                  :show-file-list="false"
                  :before-upload="handleImageUpload"
                >
                  <el-button type="primary">选择图片</el-button>
                </el-upload>
                <div v-if="uploadedImage" class="image-container">
                  <img 
                    :src="uploadedImage" 
                    alt="上传的图片" 
                    class="uploaded-image"
                    @click="pickColorFromImage"
                    ref="imageRef"
                  />
                  <div class="image-instructions">
                    <p>点击图片任意位置取色</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="control-group">
              <label>RGB滑块：</label>
              <div class="rgb-sliders">
                <div class="slider-item">
                  <span>R</span>
                  <el-slider
                    v-model="rgbValues.r"
                    :min="0"
                    :max="255"
                    :step="1"
                    show-input
                    @change="updateFromRGB"
                  />
                </div>
                <div class="slider-item">
                  <span>G</span>
                  <el-slider
                    v-model="rgbValues.g"
                    :min="0"
                    :max="255"
                    :step="1"
                    show-input
                    @change="updateFromRGB"
                  />
                </div>
                <div class="slider-item">
                  <span>B</span>
                  <el-slider
                    v-model="rgbValues.b"
                    :min="0"
                    :max="255"
                    :step="1"
                    show-input
                    @change="updateFromRGB"
                  />
                </div>
                <div class="slider-item">
                  <span>A</span>
                  <el-slider
                    v-model="rgbValues.a"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    show-input
                    @change="updateFromRGB"
                  />
                </div>
              </div>
            </div>
            
            <div class="control-group">
              <label>HSL滑块：</label>
              <div class="hsl-sliders">
                <div class="slider-item">
                  <span>H</span>
                  <el-slider
                    v-model="hslValues.h"
                    :min="0"
                    :max="360"
                    :step="1"
                    show-input
                    @change="updateFromHSL"
                  />
                </div>
                <div class="slider-item">
                  <span>S</span>
                  <el-slider
                    v-model="hslValues.s"
                    :min="0"
                    :max="100"
                    :step="1"
                    show-input
                    @change="updateFromHSL"
                  />
                </div>
                <div class="slider-item">
                  <span>L</span>
                  <el-slider
                    v-model="hslValues.l"
                    :min="0"
                    :max="100"
                    :step="1"
                    show-input
                    @change="updateFromHSL"
                  />
                </div>
              </div>
            </div>
            
            <div class="control-group">
              <label>HEX输入：</label>
              <el-input
                v-model="hexInput"
                placeholder="#000000"
                @input="updateFromHex"
                @blur="validateHex"
              >
                <template #prepend>#</template>
              </el-input>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 调色板 -->
      <el-tab-pane label="调色板" name="palette">
        <div class="palette-container">
          <div class="palette-header">
            <h3>我的调色板</h3>
            <div class="palette-actions">
              <el-button @click="exportPalette">导出调色板</el-button>
              <el-button @click="importPalette">导入调色板</el-button>
              <el-button @click="clearPalette">清空调色板</el-button>
            </div>
          </div>
          
          <div v-if="colorPalette.length === 0" class="empty-palette">
            <el-empty description="调色板为空，请先添加一些颜色" />
          </div>
          
          <div v-else class="palette-grid">
            <div
              v-for="(color, index) in colorPalette"
              :key="index"
              class="palette-item"
              :style="{ backgroundColor: color.value }"
            >
              <div class="palette-color-info">
                <p><strong>{{ color.name }}</strong></p>
                <p>{{ color.value }}</p>
                <p>{{ color.rgb }}</p>
              </div>
              <div class="palette-item-actions">
                <el-button size="small" @click="useColor(color)">使用</el-button>
                <el-button size="small" @click="copyColorValue(color.value)">复制</el-button>
                <el-button size="small" type="danger" @click="removeFromPalette(index)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 颜色转换 -->
      <el-tab-pane label="颜色转换" name="converter">
        <div class="converter-container">
          <div class="converter-input">
            <h3>输入颜色</h3>
            <div class="input-methods">
              <el-radio-group v-model="converterInputType" @change="updateConverter">
                <el-radio label="hex">HEX</el-radio>
                <el-radio label="rgb">RGB</el-radio>
                <el-radio label="hsl">HSL</el-radio>
                <el-radio label="cmyk">CMYK</el-radio>
              </el-radio-group>
            </div>
            
            <div class="input-fields">
              <div v-if="converterInputType === 'hex'" class="input-field">
                <label>HEX颜色：</label>
                <el-input
                  v-model="converterInput.hex"
                  placeholder="#000000"
                  @input="convertColor"
                />
              </div>
              
              <div v-if="converterInputType === 'rgb'" class="input-field">
                <label>RGB颜色：</label>
                <div class="rgb-inputs">
                  <el-input-number
                    v-model="converterInput.rgb.r"
                    :min="0"
                    :max="255"
                    placeholder="R"
                    @change="convertColor"
                  />
                  <el-input-number
                    v-model="converterInput.rgb.g"
                    :min="0"
                    :max="255"
                    placeholder="G"
                    @change="convertColor"
                  />
                  <el-input-number
                    v-model="converterInput.rgb.b"
                    :min="0"
                    :max="255"
                    placeholder="B"
                    @change="convertColor"
                  />
                </div>
              </div>
              
              <div v-if="converterInputType === 'hsl'" class="input-field">
                <label>HSL颜色：</label>
                <div class="hsl-inputs">
                  <el-input-number
                    v-model="converterInput.hsl.h"
                    :min="0"
                    :max="360"
                    placeholder="H"
                    @change="convertColor"
                  />
                  <el-input-number
                    v-model="converterInput.hsl.s"
                    :min="0"
                    :max="100"
                    placeholder="S"
                    @change="convertColor"
                  />
                  <el-input-number
                    v-model="converterInput.hsl.l"
                    :min="0"
                    :max="100"
                    placeholder="L"
                    @change="convertColor"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div class="converter-output">
            <h3>转换结果</h3>
            <div class="output-preview" :style="{ backgroundColor: convertedColor }">
              <div class="output-info">
                <p><strong>预览颜色</strong></p>
              </div>
            </div>
            
            <div class="output-formats">
              <div class="format-item">
                <label>HEX：</label>
                <el-input v-model="convertedResults.hex" readonly>
                  <template #append>
                    <el-button @click="copyResult('hex')">复制</el-button>
                  </template>
                </el-input>
              </div>
              
              <div class="format-item">
                <label>RGB：</label>
                <el-input v-model="convertedResults.rgb" readonly>
                  <template #append>
                    <el-button @click="copyResult('rgb')">复制</el-button>
                  </template>
                </el-input>
              </div>
              
              <div class="format-item">
                <label>HSL：</label>
                <el-input v-model="convertedResults.hsl" readonly>
                  <template #append>
                    <el-button @click="copyResult('hsl')">复制</el-button>
                  </template>
                </el-input>
              </div>
              
              <div class="format-item">
                <label>CMYK：</label>
                <el-input v-model="convertedResults.cmyk" readonly>
                  <template #append>
                    <el-button @click="copyResult('cmyk')">复制</el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 颜色方案 -->
      <el-tab-pane label="颜色方案" name="schemes">
        <div class="schemes-container">
          <h3>颜色方案生成器</h3>
          
          <div class="scheme-generator">
            <div class="base-color">
              <label>基础颜色：</label>
              <el-color-picker
                v-model="baseColor"
                @change="generateColorScheme"
                show-alpha
              />
            </div>
            
            <div class="scheme-type">
              <label>方案类型：</label>
              <el-radio-group v-model="schemeType" @change="generateColorScheme">
                <el-radio label="monochromatic">单色</el-radio>
                <el-radio label="analogous">类似色</el-radio>
                <el-radio label="complementary">互补色</el-radio>
                <el-radio label="triadic">三角色</el-radio>
                <el-radio label="tetradic">四角色</el-radio>
                <el-radio label="split-complementary">分裂互补色</el-radio>
              </el-radio-group>
            </div>
          </div>
          
          <div v-if="colorScheme.length > 0" class="scheme-display">
            <h4>生成的颜色方案</h4>
            <div class="scheme-grid">
              <div
                v-for="(color, index) in colorScheme"
                :key="index"
                class="scheme-color"
                :style="{ backgroundColor: color }"
              >
                <div class="scheme-color-info">
                  <p>{{ color }}</p>
                  <p>{{ getRGBFromHex(color) }}</p>
                </div>
                <div class="scheme-color-actions">
                  <el-button size="small" @click="useColor({ value: color })">使用</el-button>
                  <el-button size="small" @click="copyColorValue(color)">复制</el-button>
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
const activeTab = ref('picker')

// 当前颜色
const currentColor = ref('#409eff')

// RGB值
const rgbValues = reactive({
  r: 64,
  g: 158,
  b: 255,
  a: 1
})

// HSL值
const hslValues = reactive({
  h: 210,
  s: 100,
  l: 63
})

// HEX输入
const hexInput = ref('409eff')

// 调色板
const colorPalette = ref<any[]>([])

// 图片取色相关
const uploadedImage = ref('')
const imageRef = ref<HTMLImageElement>()

// 颜色转换器
const converterInputType = ref('hex')
const converterInput = reactive({
  hex: '#409eff',
  rgb: { r: 64, g: 158, b: 255 },
  hsl: { h: 210, s: 100, l: 63 }
})

const convertedColor = ref('#409eff')
const convertedResults = reactive({
  hex: '#409eff',
  rgb: 'rgb(64, 158, 255)',
  hsl: 'hsl(210, 100%, 63%)',
  cmyk: 'cmyk(75%, 38%, 0%, 0%)'
})

// 颜色方案
const baseColor = ref('#409eff')
const schemeType = ref('monochromatic')
const colorScheme = ref<string[]>([])

// 计算属性
const colorRGB = computed(() => {
  return `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, ${rgbValues.a})`
})

const colorHSL = computed(() => {
  return `hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`
})

// 方法
const updateColor = (color: string) => {
  if (color) {
    currentColor.value = color
    updateRGBFromHex(color)
    updateHSLFromHex(color)
  }
}

const updateRGBFromHex = (hex: string) => {
  // 简单的HEX到RGB转换
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  rgbValues.r = r
  rgbValues.g = g
  rgbValues.b = b
}

const updateHSLFromHex = (hex: string) => {
  // 实现真实的HEX到HSL转换
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // 无彩色
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  hslValues.h = Math.round(h * 360)
  hslValues.s = Math.round(s * 100)
  hslValues.l = Math.round(l * 100)
}

const updateFromRGB = () => {
  // 更新当前颜色和HEX
  const hex = rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b)
  currentColor.value = hex
  hexInput.value = hex.slice(1)
}

const updateFromHSL = () => {
  // 实现真实的HSL到RGB转换
  const h = hslValues.h / 360
  const s = hslValues.s / 100
  const l = hslValues.l / 100
  
  if (s === 0) {
    // 无彩色
    rgbValues.r = rgbValues.g = rgbValues.b = Math.round(l * 255)
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    rgbValues.r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
    rgbValues.g = Math.round(hue2rgb(p, q, h) * 255)
    rgbValues.b = Math.round(hue2rgb(p, q, h - 1/3) * 255)
  }
  
  updateFromRGB()
}

const updateFromHex = () => {
  if (hexInput.value.length === 6) {
    const hex = '#' + hexInput.value
    currentColor.value = hex
    updateRGBFromHex(hex)
    updateHSLFromHex(hex)
  }
}

const validateHex = () => {
  if (hexInput.value.length !== 6) {
    hexInput.value = '409eff'
    ElMessage.warning('请输入6位十六进制颜色值')
  }
}

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const copyColor = async () => {
  try {
    await navigator.clipboard.writeText(currentColor.value)
    ElMessage.success('颜色已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const addToPalette = () => {
  const colorName = `颜色${colorPalette.value.length + 1}`
  const colorItem = {
    name: colorName,
    value: currentColor.value,
    rgb: colorRGB.value,
    hsl: colorHSL.value
  }
  
  colorPalette.value.push(colorItem)
  ElMessage.success('颜色已添加到调色板')
}

const resetColor = () => {
  currentColor.value = '#409eff'
  hexInput.value = '409eff'
  Object.assign(rgbValues, { r: 64, g: 158, b: 255, a: 1 })
  Object.assign(hslValues, { h: 210, s: 100, l: 63 })
  ElMessage.success('颜色已重置')
}

const useColor = (color: any) => {
  currentColor.value = color.value
  updateRGBFromHex(color.value)
  updateHSLFromHex(color.value)
  hexInput.value = color.value.slice(1)
  ElMessage.success('颜色已应用')
}

const copyColorValue = async (color: string) => {
  try {
    await navigator.clipboard.writeText(color)
    ElMessage.success('颜色值已复制')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const removeFromPalette = (index: number) => {
  colorPalette.value.splice(index, 1)
  ElMessage.success('颜色已从调色板移除')
}

const exportPalette = () => {
  const content = JSON.stringify(colorPalette.value, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'color_palette.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('调色板已导出')
}

const importPalette = () => {
  // 实现文件导入功能
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const palette = JSON.parse(content)
          if (Array.isArray(palette)) {
            colorPalette.value = palette
            ElMessage.success(`成功导入 ${palette.length} 个颜色`)
          } else {
            ElMessage.error('文件格式不正确')
          }
        } catch (error) {
          ElMessage.error('文件解析失败：' + error.message)
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const clearPalette = () => {
  colorPalette.value = []
  ElMessage.success('调色板已清空')
}

const updateConverter = () => {
  convertColor()
}

const convertColor = () => {
  // 实现真实的颜色转换逻辑
  let hex = ''
  let rgb = { r: 0, g: 0, b: 0 }
  let hsl = { h: 0, s: 0, l: 0 }
  
  switch (converterInputType.value) {
    case 'hex':
      hex = converterInput.hex
      if (hex.startsWith('#')) {
        rgb = hexToRgb(hex)
        hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      }
      break
    case 'rgb':
      rgb = converterInput.rgb
      hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      break
    case 'hsl':
      hsl = converterInput.hsl
      rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
      hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      break
  }
  
  convertedColor.value = hex
  convertedResults.hex = hex
  convertedResults.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  convertedResults.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  convertedResults.cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
}

const copyResult = async (type: string) => {
  try {
    const value = convertedResults[type as keyof typeof convertedResults]
    await navigator.clipboard.writeText(value)
    ElMessage.success(`${type.toUpperCase()}值已复制`)
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const generateColorScheme = () => {
  // 实现真实的颜色方案生成
  const baseHex = baseColor.value
  const baseRgb = hexToRgb(baseHex)
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b)
  
  let colors: string[] = []
  
  switch (schemeType.value) {
    case 'monochromatic':
      // 单色方案：调整亮度和饱和度
      colors = [
        baseHex,
        hslToHex(baseHsl.h, baseHsl.s, Math.max(0, baseHsl.l - 30)),
        hslToHex(baseHsl.h, baseHsl.s, Math.max(0, baseHsl.l - 60)),
        hslToHex(baseHsl.h, Math.max(0, baseHsl.s - 30), baseHsl.l),
        hslToHex(baseHsl.h, Math.max(0, baseHsl.s - 60), baseHsl.l)
      ]
      break
      
    case 'analogous':
      // 类似色方案：色相相邻
      colors = [
        baseHex,
        hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h - 60 + 360) % 360, baseHsl.s, baseHsl.l)
      ]
      break
      
    case 'complementary':
      // 互补色方案：色相相差180度
      colors = [
        baseHex,
        hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
        hslToHex(baseHsl.h, Math.max(0, baseHsl.s - 20), baseHsl.l),
        hslToHex((baseHsl.h + 180) % 360, Math.max(0, baseHsl.s - 20), baseHsl.l),
        hslToHex(baseHsl.h, Math.min(100, baseHsl.s + 20), baseHsl.l)
      ]
      break
      
    case 'triadic':
      // 三角色方案：色相相差120度
      colors = [
        baseHex,
        hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l)
      ]
      break
      
    case 'tetradic':
      // 四角色方案：色相相差90度
      colors = [
        baseHex,
        hslToHex((baseHsl.h + 90) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 270) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 45) % 360, baseHsl.s, baseHsl.l)
      ]
      break
      
    case 'split-complementary':
      // 分裂互补色方案：互补色两侧
      colors = [
        baseHex,
        hslToHex((baseHsl.h + 150) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 210) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
        hslToHex((baseHsl.h + 330) % 360, baseHsl.s, baseHsl.l)
      ]
      break
  }
  
  colorScheme.value = colors
  ElMessage.success('颜色方案已生成')
}

const getRGBFromHex = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

// 辅助函数
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360
  s /= 100
  l /= 100
  
  if (s === 0) {
    const value = Math.round(l * 255)
    return { r: value, g: value, b: value }
  }
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  }
}

const rgbToCmyk = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const k = 1 - Math.max(r, g, b)
  if (k === 1) {
    return 'cmyk(0%, 0%, 0%, 100%)'
  }
  
  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)
  
  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`
}

const hslToHex = (h: number, s: number, l: number) => {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

// 生命周期
onMounted(() => {
  // 初始化
  updateColor(currentColor.value)
})

// 图片取色相关方法
const handleImageUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false // 阻止自动上传
}

const pickColorFromImage = (event: MouseEvent) => {
  if (!imageRef.value) return
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const img = imageRef.value
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  
  ctx.drawImage(img, 0, 0)
  
  const rect = img.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 计算图片上的实际坐标
  const scaleX = img.naturalWidth / rect.width
  const scaleY = img.naturalHeight / rect.height
  const imageX = Math.round(x * scaleX)
  const imageY = Math.round(y * scaleY)
  
  const pixel = ctx.getImageData(imageX, imageY, 1, 1).data
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2])
  
  // 更新当前颜色
  currentColor.value = hex
  updateRGBFromHex(hex)
  updateHSLFromHex(hex)
  hexInput.value = hex.slice(1)
  
  ElMessage.success(`已取色：${hex}`)
}
</script>

<style scoped>
.color-picker-tool {
  padding: 20px;
}

.picker-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.color-display,
.color-controls {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.color-display h3,
.color-controls h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.color-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
}

.color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px;
}

.color-info p {
  margin: 4px 0;
  font-size: 14px;
}

.color-actions {
  display: flex;
  gap: 12px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.rgb-sliders,
.hsl-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-item span {
  min-width: 20px;
  font-weight: 500;
  color: #606266;
}

.palette-container {
  padding: 20px 0;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.palette-header h3 {
  margin: 0;
  color: #303133;
}

.palette-actions {
  display: flex;
  gap: 12px;
}

.empty-palette {
  padding: 60px 0;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.palette-item {
  height: 150px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.palette-color-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px;
}

.palette-color-info p {
  margin: 4px 0;
  font-size: 14px;
}

.palette-item-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.converter-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.converter-input,
.converter-output {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.converter-input h3,
.converter-output h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.input-methods {
  margin-bottom: 20px;
}

.input-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.rgb-inputs,
.hsl-inputs {
  display: flex;
  gap: 12px;
}

.output-preview {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  position: relative;
  overflow: hidden;
}

.output-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

.output-formats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.format-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.format-item label {
  min-width: 60px;
  font-weight: 500;
  color: #303133;
}

.schemes-container {
  padding: 20px 0;
}

.schemes-container h3 {
  margin-bottom: 20px;
  color: #303133;
}

.scheme-generator {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.base-color,
.scheme-type {
  margin-bottom: 20px;
}

.base-color label,
.scheme-type label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.scheme-display h4 {
  margin-bottom: 16px;
  color: #303133;
}

.scheme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.scheme-color {
  height: 120px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.scheme-color-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
}

.scheme-color-info p {
  margin: 2px 0;
  font-size: 12px;
}

.scheme-color-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  display: flex;
  gap: 4px;
  justify-content: center;
}

.image-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-upload {
  width: 100%;
  max-width: 300px;
}

.image-container {
  width: 100%;
  max-width: 300px;
  height: 200px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  margin-top: 10px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-instructions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
}

@media (max-width: 768px) {
  .picker-container,
  .converter-container {
    grid-template-columns: 1fr;
  }
  
  .palette-grid,
  .scheme-grid {
    grid-template-columns: 1fr;
  }
  
  .rgb-inputs,
  .hsl-inputs {
    flex-direction: column;
  }
  
  .palette-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
