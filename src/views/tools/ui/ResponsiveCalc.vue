<template>
  <div class="responsive-calc-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 断点计算器 -->
      <el-tab-pane label="断点计算器" name="breakpoints">
        <div class="calc-container">
          <div class="input-section">
            <h3>设计稿尺寸</h3>
            <div class="input-group">
              <el-input
                v-model="design.width"
                type="number"
                placeholder="设计稿宽度"
                @input="calculateBreakpoints"
              >
                <template #append>px</template>
              </el-input>
              <span class="separator">×</span>
              <el-input
                v-model="design.height"
                type="number"
                placeholder="设计稿高度"
                @input="calculateBreakpoints"
              >
                <template #append>px</template>
              </el-input>
            </div>
            
            <h3>断点配置</h3>
            <div class="breakpoint-config">
              <div class="breakpoint-item" v-for="(bp, index) in breakpoints" :key="index">
                <div class="bp-header">
                  <span class="bp-name">{{ bp.name }}</span>
                  <el-button size="small" type="danger" @click="removeBreakpoint(index)" :disabled="breakpoints.length <= 1">
                    删除
                  </el-button>
                </div>
                <div class="bp-inputs">
                  <el-input
                    v-model="bp.width"
                    type="number"
                    placeholder="宽度"
                    @input="calculateBreakpoints"
                  >
                    <template #append>px</template>
                  </el-input>
                  <el-input
                    v-model="bp.minWidth"
                    type="number"
                    placeholder="最小宽度"
                    @input="calculateBreakpoints"
                  >
                    <template #append>px</template>
                  </el-input>
                  <el-input
                    v-model="bp.maxWidth"
                    type="number"
                    placeholder="最大宽度"
                    @input="calculateBreakpoints"
                  >
                    <template #append>px</template>
                  </el-input>
                </div>
              </div>
              <el-button @click="addBreakpoint" type="primary">添加断点</el-button>
            </div>
          </div>
          
          <div class="output-section">
            <h3>计算结果</h3>
            <div class="results">
              <div class="result-item" v-for="(result, index) in breakpointResults" :key="index">
                <h4>{{ result.name }}</h4>
                <div class="result-details">
                  <p><strong>设计稿比例：</strong>{{ result.ratio.toFixed(4) }}</p>
                  <p><strong>实际尺寸：</strong>{{ result.actualWidth }}px × {{ result.actualHeight }}px</p>
                  <p><strong>媒体查询：</strong><code>{{ result.mediaQuery }}</code></p>
                  <p><strong>CSS变量：</strong><code>{{ result.cssVars }}</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 尺寸转换器 -->
      <el-tab-pane label="尺寸转换器" name="converter">
        <div class="converter-container">
          <div class="conversion-types">
            <el-radio-group v-model="conversionType" @change="convertSize">
              <el-radio label="px2rem">px → rem</el-radio>
              <el-radio label="rem2px">rem → px</el-radio>
              <el-radio label="px2vw">px → vw</el-radio>
              <el-radio label="vw2px">vw → px</el-radio>
              <el-radio label="px2em">px → em</el-radio>
              <el-radio label="em2px">em → px</el-radio>
            </el-radio-group>
          </div>
          
          <div class="conversion-inputs">
            <div class="input-group">
              <label>基准值：</label>
              <el-input
                v-model="baseValue"
                type="number"
                placeholder="基准值"
                @input="convertSize"
              >
                <template #append>{{ getBaseUnit() }}</template>
              </el-input>
            </div>
            
            <div class="input-group">
              <label>输入值：</label>
              <el-input
                v-model="inputValue"
                type="number"
                placeholder="输入值"
                @input="convertSize"
              >
                <template #append>{{ getInputUnit() }}</template>
              </el-input>
            </div>
            
            <div class="input-group">
              <label>输出值：</label>
              <el-input
                v-model="outputValue"
                type="number"
                placeholder="输出值"
                readonly
              >
                <template #append>{{ getOutputUnit() }}</template>
              </el-input>
            </div>
          </div>
          
          <div class="conversion-formula">
            <h4>转换公式</h4>
            <p><code>{{ getFormula() }}</code></p>
          </div>
        </div>
      </el-tab-pane>

      <!-- 媒体查询生成器 -->
      <el-tab-pane label="媒体查询生成器" name="mediaqueries">
        <div class="mediaquery-container">
          <div class="mq-inputs">
            <div class="mq-group">
              <h4>断点设置</h4>
              <div class="mq-breakpoints">
                <div class="mq-item" v-for="(mq, index) in mediaQueries" :key="index">
                  <div class="mq-header">
                    <span class="mq-name">{{ mq.name }}</span>
                    <el-button size="small" type="danger" @click="removeMediaQuery(index)" :disabled="mediaQueries.length <= 1">
                      删除
                    </el-button>
                  </div>
                  <div class="mq-inputs">
                    <el-input
                      v-model="mq.minWidth"
                      type="number"
                      placeholder="最小宽度"
                      @input="generateMediaQueries"
                    >
                      <template #append>px</template>
                    </el-input>
                    <el-input
                      v-model="mq.maxWidth"
                      type="number"
                      placeholder="最大宽度"
                      @input="generateMediaQueries"
                    >
                      <template #append>px</template>
                    </el-input>
                    <el-select v-model="mq.orientation" @change="generateMediaQueries">
                      <el-option label="任意方向" value="" />
                      <el-option label="横屏" value="landscape" />
                      <el-option label="竖屏" value="portrait" />
                    </el-select>
                  </div>
                </div>
                <el-button @click="addMediaQuery" type="primary">添加断点</el-button>
              </div>
            </div>
            
            <div class="mq-group">
              <h4>设备类型</h4>
              <div class="device-types">
                <el-checkbox v-model="deviceTypes.mobile" @change="generateMediaQueries">移动设备</el-checkbox>
                <el-checkbox v-model="deviceTypes.tablet" @change="generateMediaQueries">平板设备</el-checkbox>
                <el-checkbox v-model="deviceTypes.desktop" @change="generateMediaQueries">桌面设备</el-checkbox>
                <el-checkbox v-model="deviceTypes.print" @change="generateMediaQueries">打印样式</el-checkbox>
              </div>
            </div>
          </div>
          
          <div class="mq-output">
            <h4>生成的媒体查询</h4>
            <div class="mq-results">
              <div class="mq-result" v-for="(result, index) in mediaQueryResults" :key="index">
                <h5>{{ result.name }}</h5>
                <el-input
                  v-model="result.query"
                  type="textarea"
                  :rows="2"
                  readonly
                />
                <div class="mq-actions">
                  <el-button size="small" @click="copyToClipboard(result.query)">复制</el-button>
                  <el-button size="small" @click="downloadMediaQuery(result)">下载</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 常用断点 -->
      <el-tab-pane label="常用断点" name="common">
        <div class="common-breakpoints">
          <h3>常用断点配置</h3>
          <el-table :data="commonBreakpoints" style="width: 100%">
            <el-table-column prop="name" label="名称" width="150" />
            <el-table-column prop="minWidth" label="最小宽度" width="120" />
            <el-table-column prop="maxWidth" label="最大宽度" width="120" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="usage" label="使用场景" width="200" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" @click="useCommonBreakpoint(scope.row)">使用</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const activeTab = ref('breakpoints')

// 设计稿尺寸
const design = reactive({
  width: 1920,
  height: 1080
})

// 断点配置
const breakpoints = ref([
  { name: '移动端', width: 375, minWidth: 0, maxWidth: 767 },
  { name: '平板', width: 768, minWidth: 768, maxWidth: 1023 },
  { name: '桌面', width: 1920, minWidth: 1024, maxWidth: 9999 }
])

// 断点计算结果
const breakpointResults = ref([])

// 尺寸转换
const conversionType = ref('px2rem')
const baseValue = ref(16)
const inputValue = ref(100)
const outputValue = ref(0)

// 媒体查询
const mediaQueries = ref([
  { name: '移动端', minWidth: 0, maxWidth: 767, orientation: '' },
  { name: '平板', minWidth: 768, maxWidth: 1023, orientation: '' },
  { name: '桌面', minWidth: 1024, maxWidth: 9999, orientation: '' }
])

const deviceTypes = reactive({
  mobile: true,
  tablet: true,
  desktop: true,
  print: false
})

const mediaQueryResults = ref([])

// 常用断点
const commonBreakpoints = ref([
  {
    name: 'Bootstrap 5',
    minWidth: 0,
    maxWidth: 575,
    description: '超小屏幕 (xs)',
    usage: '手机竖屏'
  },
  {
    name: 'Bootstrap 5',
    minWidth: 576,
    maxWidth: 767,
    description: '小屏幕 (sm)',
    usage: '手机横屏'
  },
  {
    name: 'Bootstrap 5',
    minWidth: 768,
    maxWidth: 991,
    description: '中等屏幕 (md)',
    usage: '平板'
  },
  {
    name: 'Bootstrap 5',
    minWidth: 992,
    maxWidth: 1199,
    description: '大屏幕 (lg)',
    usage: '桌面'
  },
  {
    name: 'Bootstrap 5',
    minWidth: 1200,
    maxWidth: 1399,
    description: '超大屏幕 (xl)',
    usage: '大桌面'
  },
  {
    name: 'Bootstrap 5',
    minWidth: 1400,
    maxWidth: 9999,
    description: '超超大屏幕 (xxl)',
    usage: '超大桌面'
  },
  {
    name: 'Tailwind CSS',
    minWidth: 0,
    maxWidth: 639,
    description: 'sm',
    usage: '小屏幕'
  },
  {
    name: 'Tailwind CSS',
    minWidth: 640,
    maxWidth: 767,
    description: 'md',
    usage: '中等屏幕'
  },
  {
    name: 'Tailwind CSS',
    minWidth: 768,
    maxWidth: 1023,
    description: 'lg',
    usage: '大屏幕'
  },
  {
    name: 'Tailwind CSS',
    minWidth: 1024,
    maxWidth: 1279,
    description: 'xl',
    usage: '超大屏幕'
  },
  {
    name: 'Tailwind CSS',
    minWidth: 1280,
    maxWidth: 9999,
    description: '2xl',
    usage: '超超大屏幕'
  }
])

// 方法
const calculateBreakpoints = () => {
  if (!design.width || !design.height) return
  
  breakpointResults.value = breakpoints.value.map(bp => {
    const ratio = bp.width / design.width
    const actualWidth = bp.width
    const actualHeight = Math.round(design.height * ratio)
    
    let mediaQuery = ''
    if (bp.minWidth === 0 && bp.maxWidth === 9999) {
      mediaQuery = 'all'
    } else if (bp.minWidth === 0) {
      mediaQuery = `(max-width: ${bp.maxWidth}px)`
    } else if (bp.maxWidth === 9999) {
      mediaQuery = `(min-width: ${bp.minWidth}px)`
    } else {
      mediaQuery = `(min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`
    }
    
    const cssVars = `--design-width: ${design.width}px;\n  --design-height: ${design.height}px;\n  --ratio: ${ratio.toFixed(4)};\n  --actual-width: ${actualWidth}px;\n  --actual-height: ${actualHeight}px;`
    
    return {
      name: bp.name,
      ratio,
      actualWidth,
      actualHeight,
      mediaQuery: `@media ${mediaQuery}`,
      cssVars: `:root {\n  ${cssVars}\n}`
    }
  })
}

const addBreakpoint = () => {
  breakpoints.value.push({
    name: `断点${breakpoints.value.length + 1}`,
    width: 1200,
    minWidth: 1200,
    maxWidth: 9999
  })
  calculateBreakpoints()
}

const removeBreakpoint = (index: number) => {
  if (breakpoints.value.length > 1) {
    breakpoints.value.splice(index, 1)
    calculateBreakpoints()
  }
}

const convertSize = () => {
  if (!baseValue.value || !inputValue.value) return
  
  const base = parseFloat(baseValue.value)
  const input = parseFloat(inputValue.value)
  
  switch (conversionType.value) {
    case 'px2rem':
      outputValue.value = input / base
      break
    case 'rem2px':
      outputValue.value = input * base
      break
    case 'px2vw':
      outputValue.value = (input / 100) * 100
      break
    case 'vw2px':
      outputValue.value = (input / 100) * 100
      break
    case 'px2em':
      outputValue.value = input / base
      break
    case 'em2px':
      outputValue.value = input * base
      break
  }
}

const getBaseUnit = () => {
  switch (conversionType.value) {
    case 'px2rem':
    case 'rem2px':
      return 'px'
    case 'px2vw':
    case 'vw2px':
      return 'vw'
    case 'px2em':
    case 'em2px':
      return 'px'
    default:
      return 'px'
  }
}

const getInputUnit = () => {
  switch (conversionType.value) {
    case 'px2rem':
    case 'px2vw':
    case 'px2em':
      return 'px'
    case 'rem2px':
      return 'rem'
    case 'vw2px':
      return 'vw'
    case 'em2px':
      return 'em'
    default:
      return 'px'
  }
}

const getOutputUnit = () => {
  switch (conversionType.value) {
    case 'px2rem':
      return 'rem'
    case 'rem2px':
      return 'px'
    case 'px2vw':
      return 'vw'
    case 'vw2px':
      return 'px'
    case 'px2em':
      return 'em'
    case 'em2px':
      return 'px'
    default:
      return 'px'
  }
}

const getFormula = () => {
  switch (conversionType.value) {
    case 'px2rem':
      return 'rem = px ÷ 基准字体大小'
    case 'rem2px':
      return 'px = rem × 基准字体大小'
    case 'px2vw':
      return 'vw = (px ÷ 视口宽度) × 100'
    case 'vw2px':
      return 'px = (vw ÷ 100) × 视口宽度'
    case 'px2em':
      return 'em = px ÷ 父元素字体大小'
    case 'em2px':
      return 'px = em × 父元素字体大小'
    default:
      return ''
  }
}

const addMediaQuery = () => {
  mediaQueries.value.push({
    name: `断点${mediaQueries.value.length + 1}`,
    minWidth: 1200,
    maxWidth: 9999,
    orientation: ''
  })
  generateMediaQueries()
}

const removeMediaQuery = (index: number) => {
  if (mediaQueries.value.length > 1) {
    mediaQueries.value.splice(index, 1)
    generateMediaQueries()
  }
}

const generateMediaQueries = () => {
  mediaQueryResults.value = mediaQueries.value.map(mq => {
    let query = ''
    
    if (mq.minWidth === 0 && mq.maxWidth === 9999) {
      query = 'all'
    } else if (mq.minWidth === 0) {
      query = `(max-width: ${mq.maxWidth}px)`
    } else if (mq.maxWidth === 9999) {
      query = `(min-width: ${mq.minWidth}px)`
    } else {
      query = `(min-width: ${mq.minWidth}px) and (max-width: ${mq.maxWidth}px)`
    }
    
    if (mq.orientation) {
      query += ` and (orientation: ${mq.orientation})`
    }
    
    return {
      name: mq.name,
      query: `@media ${query} {\n  /* 样式内容 */\n}`
    }
  })
  
  // 添加设备类型媒体查询
  if (deviceTypes.mobile) {
    mediaQueryResults.value.push({
      name: '移动设备',
      query: '@media (max-width: 767px) {\n  /* 移动端样式 */\n}'
    })
  }
  
  if (deviceTypes.tablet) {
    mediaQueryResults.value.push({
      name: '平板设备',
      query: '@media (min-width: 768px) and (max-width: 1023px) {\n  /* 平板样式 */\n}'
    })
  }
  
  if (deviceTypes.desktop) {
    mediaQueryResults.value.push({
      name: '桌面设备',
      query: '@media (min-width: 1024px) {\n  /* 桌面样式 */\n}'
    })
  }
  
  if (deviceTypes.print) {
    mediaQueryResults.value.push({
      name: '打印样式',
      query: '@media print {\n  /* 打印样式 */\n}'
    })
  }
}

const useCommonBreakpoint = (breakpoint: any) => {
  const newBreakpoint = {
    name: breakpoint.name,
    width: breakpoint.maxWidth,
    minWidth: breakpoint.minWidth,
    maxWidth: breakpoint.maxWidth
  }
  
  // 检查是否已存在
  const exists = breakpoints.value.find(bp => bp.name === breakpoint.name)
  if (!exists) {
    breakpoints.value.push(newBreakpoint)
    calculateBreakpoints()
    ElMessage.success(`已添加断点：${breakpoint.name}`)
  } else {
    ElMessage.warning('该断点已存在')
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const downloadMediaQuery = (result: any) => {
  const content = `${result.name}\n\n${result.query}`
  const blob = new Blob([content], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${result.name}.css`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}

// 生命周期
onMounted(() => {
  calculateBreakpoints()
  convertSize()
  generateMediaQueries()
})
</script>

<style scoped>
.responsive-calc-tool {
  padding: 20px;
}

.calc-container,
.converter-container,
.mediaquery-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-section,
.output-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.input-section h3,
.output-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.input-group label {
  min-width: 80px;
  font-weight: 500;
}

.separator {
  font-size: 18px;
  color: #909399;
}

.breakpoint-config {
  margin-top: 16px;
}

.breakpoint-item,
.mq-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.bp-header,
.mq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bp-name,
.mq-name {
  font-weight: 500;
  color: #303133;
}

.bp-inputs,
.mq-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.mq-inputs {
  grid-template-columns: 1fr 1fr 120px;
}

.results {
  max-height: 500px;
  overflow-y: auto;
}

.result-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.result-item h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
}

.result-details p {
  margin: 8px 0;
  font-size: 14px;
}

.result-details code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.conversion-types {
  margin-bottom: 24px;
}

.conversion-inputs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversion-formula {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.conversion-formula h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
}

.conversion-formula code {
  font-size: 16px;
  color: #409eff;
}

.mq-inputs {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mq-group h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.mq-breakpoints {
  margin-bottom: 16px;
}

.device-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mq-output {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.mq-output h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.mq-result {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.mq-result h5 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
}

.mq-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.common-breakpoints h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

@media (max-width: 768px) {
  .calc-container,
  .converter-container,
  .mediaquery-container {
    grid-template-columns: 1fr;
  }
  
  .bp-inputs,
  .mq-inputs {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-group label {
    min-width: auto;
  }
}
</style>
