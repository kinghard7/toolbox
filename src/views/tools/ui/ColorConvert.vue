<template>
  <ToolContainer title="颜色转换" description="HEX ↔ RGB ↔ HSL 颜色格式转换">
    <template #header-actions>
      <el-button @click="clearAll">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </template>

    <div class="color-convert-tool">
      <!-- 颜色输入区域 -->
      <el-card class="input-card">
        <template #header>
          <span>颜色输入</span>
        </template>
        
        <div class="color-input-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="input-group">
                <label class="input-label">HEX 颜色：</label>
                <el-input
                  v-model="hexInput"
                  placeholder="#FF5733 或 FF5733"
                  @input="handleHexInput"
                >
                  <template #prepend>#</template>
                </el-input>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="input-group">
                <label class="input-label">RGB 颜色：</label>
                <div class="rgb-inputs">
                  <el-input-number 
                    v-model="rgbInput.r" 
                    :min="0" 
                    :max="255" 
                    size="small"
                    @change="handleRgbInput"
                  />
                  <el-input-number 
                    v-model="rgbInput.g" 
                    :min="0" 
                    :max="255" 
                    size="small"
                    @change="handleRgbInput"
                  />
                  <el-input-number 
                    v-model="rgbInput.b" 
                    :min="0" 
                    :max="255" 
                    size="small"
                    @change="handleRgbInput"
                  />
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="input-group">
                <label class="input-label">HSL 颜色：</label>
                <div class="hsl-inputs">
                  <el-input-number 
                    v-model="hslInput.h" 
                    :min="0" 
                    :max="360" 
                    size="small"
                    @change="handleHslInput"
                  />
                  <el-input-number 
                    v-model="hslInput.s" 
                    :min="0" 
                    :max="100" 
                    size="small"
                    @change="handleHslInput"
                  />
                  <el-input-number 
                    v-model="hslInput.l" 
                    :min="0" 
                    :max="100" 
                    size="small"
                    @change="handleHslInput"
                  />
                </div>
              </div>
            </el-col>
          </el-row>
          
          <div class="color-picker-section">
            <label class="input-label">颜色选择器：</label>
            <el-color-picker 
              v-model="colorPickerValue" 
              @change="handleColorPickerChange"
              show-alpha
            />
          </div>
        </div>
      </el-card>

      <!-- 颜色预览和结果 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>颜色预览</span>
            </template>
            
            <div class="color-preview">
              <div 
                class="color-swatch"
                :style="{ backgroundColor: currentColor }"
              ></div>
              
              <div class="color-info">
                <div class="color-name">
                  <strong>{{ getColorName(currentColor) }}</strong>
                </div>
                <div class="color-brightness">
                  亮度：{{ getBrightness(currentColor) }}%
                </div>
                <div class="color-luminance">
                  对比度：{{ getContrastRatio(currentColor) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>转换结果</span>
                <div class="header-actions">
                  <el-button size="small" @click="copyAllFormats">
                    <el-icon><DocumentCopy /></el-icon>
                    复制全部
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="colorResult" class="color-results">
              <div class="result-item">
                <label>HEX：</label>
                <div class="result-value">
                  <span>{{ colorResult.hex }}</span>
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(colorResult.hex)"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="result-item">
                <label>RGB：</label>
                <div class="result-value">
                  <span>{{ colorResult.rgb }}</span>
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(colorResult.rgb)"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="result-item">
                <label>HSL：</label>
                <div class="result-value">
                  <span>{{ colorResult.hsl }}</span>
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(colorResult.hsl)"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="result-item">
                <label>HSV：</label>
                <div class="result-value">
                  <span>{{ colorResult.hsv }}</span>
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(colorResult.hsv)"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="result-item">
                <label>CMYK：</label>
                <div class="result-value">
                  <span>{{ colorResult.cmyk }}</span>
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(colorResult.cmyk)"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 颜色调色板 -->
      <el-card class="palette-card">
        <template #header>
          <span>颜色调色板</span>
        </template>
        
        <div class="color-palettes">
          <div class="palette-section">
            <h4>相似色调</h4>
            <div class="color-swatches">
              <div 
                v-for="(color, index) in analogousColors" 
                :key="index"
                class="mini-swatch"
                :style="{ backgroundColor: color }"
                @click="applyColor(color)"
                :title="color"
              ></div>
            </div>
          </div>
          
          <div class="palette-section">
            <h4>补色</h4>
            <div class="color-swatches">
              <div 
                v-for="(color, index) in complementaryColors" 
                :key="index"
                class="mini-swatch"
                :style="{ backgroundColor: color }"
                @click="applyColor(color)"
                :title="color"
              ></div>
            </div>
          </div>
          
          <div class="palette-section">
            <h4>三元色</h4>
            <div class="color-swatches">
              <div 
                v-for="(color, index) in triadicColors" 
                :key="index"
                class="mini-swatch"
                :style="{ backgroundColor: color }"
                @click="applyColor(color)"
                :title="color"
              ></div>
            </div>
          </div>
          
          <div class="palette-section">
            <h4>明度变化</h4>
            <div class="color-swatches">
              <div 
                v-for="(color, index) in lightnessVariations" 
                :key="index"
                class="mini-swatch"
                :style="{ backgroundColor: color }"
                @click="applyColor(color)"
                :title="color"
              ></div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 常用颜色 -->
      <el-card class="common-colors-card">
        <template #header>
          <span>常用颜色</span>
        </template>
        
        <div class="common-colors">
          <div 
            v-for="color in commonColors" 
            :key="color.hex"
            class="common-color-item"
            @click="applyColor(color.hex)"
          >
            <div 
              class="common-color-swatch"
              :style="{ backgroundColor: color.hex }"
            ></div>
            <div class="common-color-info">
              <div class="color-name">{{ color.name }}</div>
              <div class="color-hex">{{ color.hex }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'
import { useAppStore } from '@/stores/app'
import {
  Delete,
  DocumentCopy
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const hexInput = ref('')
const rgbInput = ref({ r: 255, g: 87, b: 51 })
const hslInput = ref({ h: 12, s: 100, l: 60 })
const colorPickerValue = ref('#FF5733')
const currentColor = ref('#FF5733')

// 计算属性
const colorResult = computed(() => {
  if (!currentColor.value) return null

  const rgb = hexToRgb(currentColor.value)
  if (!rgb) return null

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)

  return {
    hex: currentColor.value.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
    cmyk: `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`
  }
})

// 生成调色板
const analogousColors = computed(() => {
  if (!currentColor.value) return []
  const rgb = hexToRgb(currentColor.value)
  if (!rgb) return []
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []
  
  for (let i = -30; i <= 30; i += 10) {
    if (i === 0) continue
    const h = (hsl.h + i + 360) % 360
    const newRgb = hslToRgb(h, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }
  
  return colors
})

const complementaryColors = computed(() => {
  if (!currentColor.value) return []
  const rgb = hexToRgb(currentColor.value)
  if (!rgb) return []
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []
  
  // 补色
  const complementH = (hsl.h + 180) % 360
  const complementRgb = hslToRgb(complementH, hsl.s, hsl.l)
  colors.push(rgbToHex(complementRgb.r, complementRgb.g, complementRgb.b))
  
  // 分割补色
  const split1H = (hsl.h + 150) % 360
  const split1Rgb = hslToRgb(split1H, hsl.s, hsl.l)
  colors.push(rgbToHex(split1Rgb.r, split1Rgb.g, split1Rgb.b))
  
  const split2H = (hsl.h + 210) % 360
  const split2Rgb = hslToRgb(split2H, hsl.s, hsl.l)
  colors.push(rgbToHex(split2Rgb.r, split2Rgb.g, split2Rgb.b))
  
  return colors
})

const triadicColors = computed(() => {
  if (!currentColor.value) return []
  const rgb = hexToRgb(currentColor.value)
  if (!rgb) return []
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []
  
  // 三元色
  const triadic1H = (hsl.h + 120) % 360
  const triadic1Rgb = hslToRgb(triadic1H, hsl.s, hsl.l)
  colors.push(rgbToHex(triadic1Rgb.r, triadic1Rgb.g, triadic1Rgb.b))
  
  const triadic2H = (hsl.h + 240) % 360
  const triadic2Rgb = hslToRgb(triadic2H, hsl.s, hsl.l)
  colors.push(rgbToHex(triadic2Rgb.r, triadic2Rgb.g, triadic2Rgb.b))
  
  return colors
})

const lightnessVariations = computed(() => {
  if (!currentColor.value) return []
  const rgb = hexToRgb(currentColor.value)
  if (!rgb) return []
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors = []
  
  for (let l = 10; l <= 90; l += 20) {
    if (Math.abs(l - hsl.l) < 5) continue
    const newRgb = hslToRgb(hsl.h, hsl.s, l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }
  
  return colors
})

// 常用颜色
const commonColors = [
  { name: '红色', hex: '#FF0000' },
  { name: '绿色', hex: '#00FF00' },
  { name: '蓝色', hex: '#0000FF' },
  { name: '黄色', hex: '#FFFF00' },
  { name: '青色', hex: '#00FFFF' },
  { name: '洋红', hex: '#FF00FF' },
  { name: '黑色', hex: '#000000' },
  { name: '白色', hex: '#FFFFFF' },
  { name: '灰色', hex: '#808080' },
  { name: '橙色', hex: '#FFA500' },
  { name: '紫色', hex: '#800080' },
  { name: '粉色', hex: '#FFC0CB' },
  { name: '棕色', hex: '#A52A2A' },
  { name: '金色', hex: '#FFD700' },
  { name: '银色', hex: '#C0C0C0' },
  { name: '深蓝', hex: '#000080' }
]

// 方法
const clearAll = () => {
  hexInput.value = ''
  rgbInput.value = { r: 0, g: 0, b: 0 }
  hslInput.value = { h: 0, s: 0, l: 0 }
  colorPickerValue.value = '#000000'
  currentColor.value = '#000000'
}

const handleHexInput = () => {
  let hex = hexInput.value.trim()
  if (!hex) return

  // 移除 # 符号
  hex = hex.replace('#', '')
  
  // 验证 hex 格式
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    return
  }

  // 转换 3 位 hex 为 6 位
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }

  const fullHex = '#' + hex.toUpperCase()
  updateAllFromHex(fullHex)
}

const handleRgbInput = () => {
  const { r, g, b } = rgbInput.value
  if (r === null || g === null || b === null) return

  const hex = rgbToHex(r, g, b)
  updateAllFromHex(hex)
}

const handleHslInput = () => {
  const { h, s, l } = hslInput.value
  if (h === null || s === null || l === null) return

  const rgb = hslToRgb(h, s, l)
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
  updateAllFromHex(hex)
}

const handleColorPickerChange = (color: string) => {
  if (color) {
    updateAllFromHex(color)
  }
}

const updateAllFromHex = (hex: string) => {
  currentColor.value = hex
  colorPickerValue.value = hex
  
  const rgb = hexToRgb(hex)
  if (rgb) {
    rgbInput.value = rgb
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    hslInput.value = {
      h: Math.round(hsl.h),
      s: Math.round(hsl.s),
      l: Math.round(hsl.l)
    }
  }

  // 记录历史
  appStore.addHistory({
    toolId: 'color-convert',
    timestamp: Date.now(),
    input: hex,
    output: colorResult.value
  })
}

const applyColor = (hex: string) => {
  hexInput.value = hex.replace('#', '')
  updateAllFromHex(hex)
  ElMessage.success('已应用颜色')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyAllFormats = async () => {
  if (!colorResult.value) return

  const text = [
    `HEX: ${colorResult.value.hex}`,
    `RGB: ${colorResult.value.rgb}`,
    `HSL: ${colorResult.value.hsl}`,
    `HSV: ${colorResult.value.hsv}`,
    `CMYK: ${colorResult.value.cmyk}`
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('所有格式已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 颜色转换函数
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number, s: number, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default: h = 0
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  if (s === 0) {
    const gray = l * 255
    return { r: Math.round(gray), g: Math.round(gray), b: Math.round(gray) }
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  }
}

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    switch (max) {
      case r: h = ((g - b) / diff) % 6; break
      case g: h = (b - r) / diff + 2; break
      case b: h = (r - g) / diff + 4; break
    }
  }

  return {
    h: h * 60,
    s: max === 0 ? 0 : (diff / max) * 100,
    v: max * 100
  }
}

const rgbToCmyk = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const k = 1 - Math.max(r, g, b)
  const c = (1 - r - k) / (1 - k) || 0
  const m = (1 - g - k) / (1 - k) || 0
  const y = (1 - b - k) / (1 - k) || 0

  return {
    c: c * 100,
    m: m * 100,
    y: y * 100,
    k: k * 100
  }
}

const getBrightness = (hex: string): number => {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  
  // 使用 YIQ 方法计算亮度
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return Math.round((brightness / 255) * 100)
}

const getContrastRatio = (hex: string): string => {
  const brightness = getBrightness(hex)
  return brightness > 50 ? '适合深色文字' : '适合浅色文字'
}

const getColorName = (hex: string): string => {
  const found = commonColors.find(color => color.hex.toLowerCase() === hex.toLowerCase())
  return found ? found.name : '自定义颜色'
}

// 初始化
watch(() => currentColor.value, (newColor) => {
  hexInput.value = newColor.replace('#', '')
}, { immediate: true })
</script>

<style lang="scss" scoped>
.color-convert-tool {
  .input-card {
    margin-bottom: 20px;
    
    .color-input-section {
      .input-group {
        .input-label {
          display: block;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }
        
        .rgb-inputs,
        .hsl-inputs {
          display: flex;
          gap: 8px;
          
          .el-input-number {
            flex: 1;
          }
        }
      }
      
      .color-picker-section {
        margin-top: 20px;
        
        .input-label {
          display: block;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
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

  .color-preview {
    display: flex;
    gap: 20px;
    
    .color-swatch {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      border: 2px solid var(--el-border-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .color-info {
      flex: 1;
      
      .color-name {
        font-size: 18px;
        margin-bottom: 8px;
        color: var(--el-text-color-primary);
      }
      
      .color-brightness,
      .color-luminance {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }
    }
  }

  .color-results {
    .result-item {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      label {
        font-weight: 500;
        color: var(--el-text-color-primary);
        min-width: 60px;
      }
      
      .result-value {
        display: flex;
        align-items: center;
        gap: 8px;
        
        span {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          background: var(--el-fill-color-extra-light);
          padding: 4px 8px;
          border-radius: 4px;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .palette-card {
    margin-top: 20px;
    
    .color-palettes {
      .palette-section {
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        h4 {
          margin: 0 0 12px 0;
          color: var(--el-text-color-primary);
          font-size: 14px;
        }
        
        .color-swatches {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          
          .mini-swatch {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            border: 1px solid var(--el-border-color-light);
            cursor: pointer;
            transition: all 0.3s;
            
            &:hover {
              transform: scale(1.1);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
          }
        }
      }
    }
  }

  .common-colors-card {
    margin-top: 20px;
    
    .common-colors {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      
      .common-color-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: var(--el-fill-color-light);
        }
        
        .common-color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--el-border-color-light);
        }
        
        .common-color-info {
          .color-name {
            font-size: 12px;
            color: var(--el-text-color-primary);
            margin-bottom: 2px;
          }
          
          .color-hex {
            font-size: 10px;
            color: var(--el-text-color-secondary);
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .color-convert-tool {
    .color-input-section {
      :deep(.el-row) {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }

    .color-preview {
      flex-direction: column;
      align-items: center;
      
      .color-swatch {
        width: 100px;
        height: 100px;
      }
    }

    .common-colors {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
    }

    .color-palettes {
      .palette-section {
        .color-swatches {
          .mini-swatch {
            width: 32px;
            height: 32px;
          }
        }
      }
    }
  }
}
</style>
