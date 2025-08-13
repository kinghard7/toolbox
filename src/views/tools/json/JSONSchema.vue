<template>
  <ToolContainer title="JSON Schema" description="JSON Schema验证和生成">
    <div class="json-schema-tool">
      <el-tabs v-model="activeTab" class="schema-tabs">
        <!-- 生成Schema标签页 -->
        <el-tab-pane label="生成Schema" name="generate">
          <div class="generate-section">
            <div class="input-section">
              <h3>输入JSON数据</h3>
              <el-input
                v-model="inputJSON"
                type="textarea"
                :rows="8"
                placeholder="请输入JSON数据，将自动生成对应的Schema..."
                @input="generateSchema"
              />
              <div v-if="inputError" class="error">{{ inputError }}</div>
            </div>

            <div class="output-section">
              <div class="section-header">
                <h3>生成的Schema</h3>
                <div class="actions">
                  <el-button size="small" @click="copySchema" :disabled="!generatedSchema">复制Schema</el-button>
                  <el-button size="small" @click="formatSchema" :disabled="!generatedSchema">格式化</el-button>
                </div>
              </div>
              <el-input
                v-model="generatedSchema"
                type="textarea"
                :rows="10"
                readonly
                placeholder="生成的JSON Schema将显示在这里..."
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 验证JSON标签页 -->
        <el-tab-pane label="验证JSON" name="validate">
          <div class="validate-section">
            <div class="schema-input">
              <h3>JSON Schema</h3>
              <el-input
                v-model="validationSchema"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON Schema..."
                @input="validateJSON"
              />
              <div v-if="schemaError" class="error">{{ schemaError }}</div>
            </div>

            <div class="data-input">
              <h3>待验证的JSON数据</h3>
              <el-input
                v-model="validationData"
                type="textarea"
                :rows="6"
                placeholder="请输入要验证的JSON数据..."
                @input="validateJSON"
              />
              <div v-if="dataError" class="error">{{ dataError }}</div>
            </div>

            <div class="validation-result">
              <h3>验证结果</h3>
              <div v-if="validationResult" class="result-display" :class="validationResult.isValid ? 'valid' : 'invalid'">
                <div class="result-status">
                  <el-icon v-if="validationResult.isValid" class="success-icon"><Check /></el-icon>
                  <el-icon v-else class="error-icon"><Close /></el-icon>
                  <span>{{ validationResult.isValid ? '验证通过' : '验证失败' }}</span>
                </div>
                
                <div v-if="!validationResult.isValid && validationResult.errors.length > 0" class="error-list">
                  <h4>错误详情：</h4>
                  <ul>
                    <li v-for="(error, index) in validationResult.errors" :key="index" class="error-item">
                      <strong>路径:</strong> {{ error.path || 'root' }}<br>
                      <strong>错误:</strong> {{ error.message }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface ValidationError {
  path: string
  message: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

const activeTab = ref('generate')
const inputJSON = ref('')
const inputError = ref('')
const generatedSchema = ref('')
const validationSchema = ref('')
const validationData = ref('')
const schemaError = ref('')
const dataError = ref('')
const validationResult = ref<ValidationResult | null>(null)

// 从JSON生成Schema
const generateSchema = () => {
  inputError.value = ''
  generatedSchema.value = ''

  if (!inputJSON.value.trim()) {
    return
  }

  try {
    const parsedJSON = JSON.parse(inputJSON.value)
    const schema = generateSchemaFromObject(parsedJSON)
    generatedSchema.value = JSON.stringify(schema, null, 2)
  } catch (error) {
    inputError.value = '无效的JSON格式'
  }
}

// 递归生成Schema
const generateSchemaFromObject = (obj: any): any => {
  if (obj === null) {
    return { type: 'null' }
  }

  if (Array.isArray(obj)) {
    const schema: any = {
      type: 'array'
    }

    if (obj.length > 0) {
      // 分析数组中的元素类型
      const itemTypes = new Set()
      const itemSchemas = obj.map(item => generateSchemaFromObject(item))
      
      // 如果所有元素都是同一类型，使用单一schema
      const firstType = itemSchemas[0]?.type
      const allSameType = itemSchemas.every(schema => schema.type === firstType)
      
      if (allSameType && itemSchemas.length > 0) {
        schema.items = itemSchemas[0]
      } else {
        // 多种类型，使用oneOf
        schema.items = {
          oneOf: itemSchemas.filter((schema, index, self) => 
            self.findIndex(s => JSON.stringify(s) === JSON.stringify(schema)) === index
          )
        }
      }
    }

    return schema
  }

  if (typeof obj === 'object') {
    const schema: any = {
      type: 'object',
      properties: {},
      required: []
    }

    for (const [key, value] of Object.entries(obj)) {
      schema.properties[key] = generateSchemaFromObject(value)
      schema.required.push(key)
    }

    return schema
  }

  // 基本类型
  const type = typeof obj
  const schema: any = { type }

  // 添加额外约束
  if (type === 'string') {
    if (obj.length > 0) {
      schema.minLength = 1
    }
    // 检测特殊格式
    if (/^\d{4}-\d{2}-\d{2}/.test(obj)) {
      schema.format = 'date-time'
    } else if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(obj)) {
      schema.format = 'email'
    } else if (/^https?:\/\//.test(obj)) {
      schema.format = 'uri'
    }
  } else if (type === 'number') {
    if (Number.isInteger(obj)) {
      schema.type = 'integer'
    }
  }

  return schema
}

// 简化的JSON Schema验证
const validateJSON = () => {
  schemaError.value = ''
  dataError.value = ''
  validationResult.value = null

  if (!validationSchema.value.trim() || !validationData.value.trim()) {
    return
  }

  let schema: any
  let data: any

  try {
    schema = JSON.parse(validationSchema.value)
  } catch (error) {
    schemaError.value = '无效的Schema格式'
    return
  }

  try {
    data = JSON.parse(validationData.value)
  } catch (error) {
    dataError.value = '无效的JSON格式'
    return
  }

  const errors: ValidationError[] = []
  const isValid = validateValue(data, schema, '', errors)

  validationResult.value = {
    isValid,
    errors
  }
}

// 验证值是否符合Schema
const validateValue = (value: any, schema: any, path: string, errors: ValidationError[]): boolean => {
  if (!schema) return true

  // 类型验证
  if (schema.type) {
    const actualType = Array.isArray(value) ? 'array' : 
                      value === null ? 'null' : 
                      typeof value

    if (schema.type !== actualType) {
      if (!(schema.type === 'integer' && actualType === 'number' && Number.isInteger(value))) {
        errors.push({
          path,
          message: `期望类型 ${schema.type}，实际类型 ${actualType}`
        })
        return false
      }
    }
  }

  // 对象验证
  if (schema.type === 'object' && typeof value === 'object' && !Array.isArray(value) && value !== null) {
    // 必需属性验证
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in value)) {
          errors.push({
            path: path ? `${path}.${requiredProp}` : requiredProp,
            message: `缺少必需属性: ${requiredProp}`
          })
        }
      }
    }

    // 属性验证
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in value) {
          const propPath = path ? `${path}.${prop}` : prop
          validateValue(value[prop], propSchema, propPath, errors)
        }
      }
    }
  }

  // 数组验证
  if (schema.type === 'array' && Array.isArray(value)) {
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        const itemPath = `${path}[${i}]`
        validateValue(value[i], schema.items, itemPath, errors)
      }
    }
  }

  // 字符串验证
  if (schema.type === 'string' && typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push({
        path,
        message: `字符串长度不能少于 ${schema.minLength} 个字符`
      })
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push({
        path,
        message: `字符串长度不能超过 ${schema.maxLength} 个字符`
      })
    }
  }

  return errors.length === 0
}

// 复制Schema
const copySchema = async () => {
  if (!generatedSchema.value) {
    ElMessage.warning('没有Schema可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(generatedSchema.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 格式化Schema
const formatSchema = () => {
  if (!generatedSchema.value) return

  try {
    const parsed = JSON.parse(generatedSchema.value)
    generatedSchema.value = JSON.stringify(parsed, null, 2)
  } catch (error) {
    ElMessage.error('格式化失败')
  }
}
</script>

<style scoped lang="scss">
.json-schema-tool {
  .schema-tabs {
    .generate-section {
      .input-section, .output-section {
        margin-bottom: 24px;

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

      .output-section {
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          h3 {
            margin: 0;
          }

          .actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }

    .validate-section {
      .schema-input, .data-input {
        margin-bottom: 24px;

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

      .validation-result {
        h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .result-display {
          padding: 16px;
          border-radius: 6px;
          border: 1px solid;

          &.valid {
            background-color: var(--el-color-success-light-9);
            border-color: var(--el-color-success-light-7);
            color: var(--el-color-success);
          }

          &.invalid {
            background-color: var(--el-color-danger-light-9);
            border-color: var(--el-color-danger-light-7);
            color: var(--el-color-danger);
          }

          .result-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            margin-bottom: 12px;

            .success-icon, .error-icon {
              font-size: 18px;
            }
          }

          .error-list {
            h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
            }

            ul {
              margin: 0;
              padding-left: 20px;
            }

            .error-item {
              margin-bottom: 8px;
              font-size: 14px;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .json-schema-tool {
    .generate-section .output-section .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
}
</style>
