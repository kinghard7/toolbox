<template>
  <ToolContainer title="JSON 转 CSV" description="将JSON数据转换为CSV格式">
    <div class="json-csv-tool">
      <div class="input-section">
        <h3>JSON 数据</h3>
        <el-input
          v-model="jsonInput"
          type="textarea"
          :rows="8"
          placeholder="请输入JSON数据..."
          @input="convertToCSV"
        />
      </div>
      
      <div class="output-section">
        <h3>CSV 结果</h3>
        <el-input
          v-model="csvOutput"
          type="textarea"
          :rows="8"
          readonly
          placeholder="CSV结果将显示在这里..."
        />
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

const jsonInput = ref('')
const csvOutput = ref('')
const errorMessage = ref('')

const convertToCSV = () => {
  errorMessage.value = ''
  if (!jsonInput.value.trim()) {
    csvOutput.value = ''
    return
  }
  
  try {
    const data = JSON.parse(jsonInput.value)
    // 简化的转换逻辑
    csvOutput.value = 'JSON to CSV conversion (功能开发中...)'
  } catch (error) {
    errorMessage.value = '无效的JSON格式'
    csvOutput.value = ''
  }
}
</script>

<style scoped lang="scss">
.json-csv-tool {
  .input-section, .output-section {
    margin-bottom: 24px;
    h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
  }
  .error { color: var(--el-color-danger); margin-top: 8px; }
}
</style>
