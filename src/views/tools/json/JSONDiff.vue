<template>
  <ToolContainer title="JSON Diff" description="两个JSON对象对比">
    <div class="json-diff-tool">
      <div class="input-sections">
        <div class="input-section">
          <h3>JSON 1</h3>
          <el-input
            v-model="json1"
            type="textarea"
            :rows="8"
            placeholder="请输入第一个JSON..."
            @input="compareJSON"
          />
          <div v-if="json1Error" class="error">{{ json1Error }}</div>
        </div>

        <div class="input-section">
          <h3>JSON 2</h3>
          <el-input
            v-model="json2"
            type="textarea"
            :rows="8"
            placeholder="请输入第二个JSON..."
            @input="compareJSON"
          />
          <div v-if="json2Error" class="error">{{ json2Error }}</div>
        </div>
      </div>

      <div class="options-section">
        <el-checkbox v-model="ignoreOrder" @change="compareJSON">忽略数组顺序</el-checkbox>
        <el-checkbox v-model="ignoreCase" @change="compareJSON">忽略大小写</el-checkbox>
        <el-checkbox v-model="showOnlyDifferences" @change="updateDisplay">只显示差异</el-checkbox>
      </div>

      <div class="result-section">
        <div class="result-header">
          <h3>对比结果</h3>
          <div class="result-stats">
            <span v-if="diffResult" class="stats-item">
              <span class="stats-label">相同:</span>
              <span class="stats-value same">{{ diffResult.stats.same }}</span>
            </span>
            <span v-if="diffResult" class="stats-item">
              <span class="stats-label">不同:</span>
              <span class="stats-value different">{{ diffResult.stats.different }}</span>
            </span>
            <span v-if="diffResult" class="stats-item">
              <span class="stats-label">仅在JSON1:</span>
              <span class="stats-value only-left">{{ diffResult.stats.onlyInLeft }}</span>
            </span>
            <span v-if="diffResult" class="stats-item">
              <span class="stats-label">仅在JSON2:</span>
              <span class="stats-value only-right">{{ diffResult.stats.onlyInRight }}</span>
            </span>
          </div>
        </div>

        <div v-if="diffResult" class="diff-display">
          <div v-for="(item, index) in displayItems" :key="index" class="diff-item" :class="item.type">
            <div class="diff-path">{{ item.path }}</div>
            <div class="diff-content">
              <div v-if="item.type === 'modified'" class="diff-values">
                <div class="old-value">
                  <span class="value-label">JSON1:</span>
                  <code>{{ item.oldValue }}</code>
                </div>
                <div class="new-value">
                  <span class="value-label">JSON2:</span>
                  <code>{{ item.newValue }}</code>
                </div>
              </div>
              <div v-else-if="item.type === 'added'" class="diff-values">
                <div class="new-value">
                  <span class="value-label">新增:</span>
                  <code>{{ item.value }}</code>
                </div>
              </div>
              <div v-else-if="item.type === 'deleted'" class="diff-values">
                <div class="old-value">
                  <span class="value-label">删除:</span>
                  <code>{{ item.value }}</code>
                </div>
              </div>
              <div v-else class="diff-values">
                <div class="same-value">
                  <span class="value-label">相同:</span>
                  <code>{{ item.value }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!diffResult && (json1 || json2)" class="no-result">
          请输入有效的JSON格式数据
        </div>

        <div v-if="diffResult && displayItems.length === 0" class="no-differences">
          JSON完全相同
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface DiffItem {
  path: string
  type: 'same' | 'modified' | 'added' | 'deleted'
  value?: any
  oldValue?: any
  newValue?: any
}

interface DiffResult {
  items: DiffItem[]
  stats: {
    same: number
    different: number
    onlyInLeft: number
    onlyInRight: number
  }
}

const json1 = ref('')
const json2 = ref('')
const json1Error = ref('')
const json2Error = ref('')
const ignoreOrder = ref(false)
const ignoreCase = ref(false)
const showOnlyDifferences = ref(false)
const diffResult = ref<DiffResult | null>(null)

// 计算显示的差异项
const displayItems = computed(() => {
  if (!diffResult.value) return []
  
  if (showOnlyDifferences.value) {
    return diffResult.value.items.filter(item => item.type !== 'same')
  }
  
  return diffResult.value.items
})

// 深度比较两个值
const deepCompare = (obj1: any, obj2: any, path: string = ''): DiffItem[] => {
  const items: DiffItem[] = []
  
  // 处理null和undefined
  if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
    if (obj1 === obj2) {
      items.push({ path, type: 'same', value: obj1 })
    } else if (obj1 === null || obj1 === undefined) {
      items.push({ path, type: 'added', value: obj2 })
    } else {
      items.push({ path, type: 'deleted', value: obj1 })
    }
    return items
  }

  // 处理基本类型
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    let val1 = obj1
    let val2 = obj2
    
    if (ignoreCase.value && typeof obj1 === 'string' && typeof obj2 === 'string') {
      val1 = obj1.toLowerCase()
      val2 = obj2.toLowerCase()
    }
    
    if (val1 === val2) {
      items.push({ path, type: 'same', value: obj1 })
    } else {
      items.push({ path, type: 'modified', oldValue: obj1, newValue: obj2 })
    }
    return items
  }

  // 处理数组
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (ignoreOrder.value) {
      // 忽略顺序的数组比较
      const sorted1 = [...obj1].sort()
      const sorted2 = [...obj2].sort()
      return deepCompare(sorted1, sorted2, path)
    } else {
      // 按顺序比较数组
      const maxLength = Math.max(obj1.length, obj2.length)
      for (let i = 0; i < maxLength; i++) {
        const itemPath = path ? `${path}[${i}]` : `[${i}]`
        if (i >= obj1.length) {
          items.push({ path: itemPath, type: 'added', value: obj2[i] })
        } else if (i >= obj2.length) {
          items.push({ path: itemPath, type: 'deleted', value: obj1[i] })
        } else {
          items.push(...deepCompare(obj1[i], obj2[i], itemPath))
        }
      }
    }
    return items
  }

  // 处理对象
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  const allKeys = new Set([...keys1, ...keys2])

  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : key
    
    if (!(key in obj1)) {
      items.push({ path: keyPath, type: 'added', value: obj2[key] })
    } else if (!(key in obj2)) {
      items.push({ path: keyPath, type: 'deleted', value: obj1[key] })
    } else {
      items.push(...deepCompare(obj1[key], obj2[key], keyPath))
    }
  }

  return items
}

// 比较JSON
const compareJSON = () => {
  json1Error.value = ''
  json2Error.value = ''
  diffResult.value = null

  if (!json1.value.trim() && !json2.value.trim()) {
    return
  }

  let parsed1: any
  let parsed2: any

  try {
    parsed1 = json1.value.trim() ? JSON.parse(json1.value) : null
  } catch (error) {
    json1Error.value = 'JSON1 格式错误'
    return
  }

  try {
    parsed2 = json2.value.trim() ? JSON.parse(json2.value) : null
  } catch (error) {
    json2Error.value = 'JSON2 格式错误'
    return
  }

  const items = deepCompare(parsed1, parsed2)
  
  const stats = {
    same: items.filter(item => item.type === 'same').length,
    different: items.filter(item => item.type === 'modified').length,
    onlyInLeft: items.filter(item => item.type === 'deleted').length,
    onlyInRight: items.filter(item => item.type === 'added').length
  }

  diffResult.value = { items, stats }
}

// 更新显示
const updateDisplay = () => {
  // 强制重新计算computed
}
</script>

<style scoped lang="scss">
.json-diff-tool {
  .input-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;

    .input-section {
      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .error {
        color: var(--el-color-danger);
        margin-top: 8px;
        font-size: 14px;
      }
    }
  }

  .options-section {
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
  }

  .result-section {
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .result-stats {
        display: flex;
        gap: 16px;

        .stats-item {
          font-size: 14px;

          .stats-label {
            color: var(--el-text-color-regular);
          }

          .stats-value {
            font-weight: 600;
            margin-left: 4px;

            &.same { color: var(--el-color-success); }
            &.different { color: var(--el-color-warning); }
            &.only-left { color: var(--el-color-danger); }
            &.only-right { color: var(--el-color-info); }
          }
        }
      }
    }

    .diff-display {
      max-height: 500px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;

      .diff-item {
        padding: 12px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
        }

        &.same {
          background-color: var(--el-color-success-light-9);
        }

        &.modified {
          background-color: var(--el-color-warning-light-9);
        }

        &.added {
          background-color: var(--el-color-info-light-9);
        }

        &.deleted {
          background-color: var(--el-color-danger-light-9);
        }

        .diff-path {
          font-weight: 600;
          margin-bottom: 8px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          color: var(--el-text-color-primary);
        }

        .diff-content {
          .diff-values {
            .old-value, .new-value, .same-value {
              margin: 4px 0;

              .value-label {
                font-size: 12px;
                color: var(--el-text-color-regular);
                margin-right: 8px;
              }

              code {
                background-color: var(--el-fill-color-light);
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
              }
            }

            .old-value {
              color: var(--el-color-danger);
            }

            .new-value {
              color: var(--el-color-info);
            }
          }
        }
      }
    }

    .no-result, .no-differences {
      text-align: center;
      color: var(--el-text-color-placeholder);
      padding: 40px;
    }
  }
}

@media (max-width: 768px) {
  .json-diff-tool {
    .input-sections {
      grid-template-columns: 1fr;
    }

    .options-section {
      flex-direction: column;
      gap: 8px;
    }

    .result-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 12px;

      .result-stats {
        flex-wrap: wrap;
        gap: 12px !important;
      }
    }
  }
}
</style>
