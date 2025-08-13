<template>
  <ToolContainer title="UUID 生成器" description="UUID生成和验证">
    <div class="uuid-tool">
      <div class="generate-section">
        <h3>生成 UUID</h3>
        <div class="generate-controls">
          <el-button type="primary" @click="generateUUID">生成 UUID v4</el-button>
          <el-button @click="generateMultiple">批量生成</el-button>
          <el-input-number v-model="batchCount" :min="1" :max="100" style="margin-left: 8px;" />
        </div>
      </div>

      <div class="result-section">
        <h3>生成结果</h3>
        <el-input
          v-model="generatedUUIDs"
          type="textarea"
          :rows="6"
          readonly
          placeholder="生成的UUID将显示在这里..."
        />
        <div class="action-buttons">
          <el-button @click="copyToClipboard" :disabled="!generatedUUIDs">复制</el-button>
          <el-button @click="clearResults">清空</el-button>
        </div>
      </div>

      <div class="validate-section">
        <h3>UUID 验证</h3>
        <el-input
          v-model="validateInput"
          placeholder="输入UUID进行验证..."
          @input="validateUUID"
        />
        <div v-if="validationResult" class="validation-result" :class="validationResult.isValid ? 'valid' : 'invalid'">
          {{ validationResult.message }}
          <div v-if="validationResult.info" class="uuid-info">
            <p>版本: {{ validationResult.info.version }}</p>
            <p>变体: {{ validationResult.info.variant }}</p>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

const generatedUUIDs = ref('')
const batchCount = ref(1)
const validateInput = ref('')
const validationResult = ref<{
  isValid: boolean
  message: string
  info?: {
    version: string
    variant: string
  }
} | null>(null)

// 生成UUID v4
const generateUUID = () => {
  const uuid = crypto.randomUUID()
  if (generatedUUIDs.value) {
    generatedUUIDs.value += '\n' + uuid
  } else {
    generatedUUIDs.value = uuid
  }
}

// 批量生成UUID
const generateMultiple = () => {
  const uuids = []
  for (let i = 0; i < batchCount.value; i++) {
    uuids.push(crypto.randomUUID())
  }
  
  if (generatedUUIDs.value) {
    generatedUUIDs.value += '\n' + uuids.join('\n')
  } else {
    generatedUUIDs.value = uuids.join('\n')
  }
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedUUIDs.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空结果
const clearResults = () => {
  generatedUUIDs.value = ''
}

// 验证UUID
const validateUUID = () => {
  if (!validateInput.value.trim()) {
    validationResult.value = null
    return
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const isValid = uuidRegex.test(validateInput.value.trim())

  if (isValid) {
    const uuid = validateInput.value.trim()
    const version = uuid.charAt(14)
    const variantChar = uuid.charAt(19)
    let variant = 'Unknown'
    
    if (['8', '9', 'a', 'b'].includes(variantChar.toLowerCase())) {
      variant = 'RFC 4122'
    }

    validationResult.value = {
      isValid: true,
      message: 'UUID 格式有效',
      info: {
        version: `v${version}`,
        variant
      }
    }
  } else {
    validationResult.value = {
      isValid: false,
      message: 'UUID 格式无效'
    }
  }
}
</script>

<style scoped lang="scss">
.uuid-tool {
  .generate-section, .result-section, .validate-section {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .generate-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-buttons {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }

  .validation-result {
    margin-top: 12px;
    padding: 12px;
    border-radius: 4px;
    
    &.valid {
      background-color: var(--el-color-success-light-9);
      color: var(--el-color-success);
      border: 1px solid var(--el-color-success-light-7);
    }
    
    &.invalid {
      background-color: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
      border: 1px solid var(--el-color-danger-light-7);
    }

    .uuid-info {
      margin-top: 8px;
      font-size: 14px;
      
      p {
        margin: 4px 0;
      }
    }
  }
}
</style>
