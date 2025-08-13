<template>
  <ToolContainer title="CSV 转 JSON" description="将CSV数据转换为JSON格式">
    <div class="csv-json-tool">
      <div class="input-section">
        <h3>CSV 数据</h3>
        <el-input
          v-model="csvInput"
          type="textarea"
          :rows="8"
          placeholder="请输入CSV数据..."
        />
      </div>
      
      <div class="output-section">
        <h3>JSON 结果</h3>
        <el-input
          v-model="jsonOutput"
          type="textarea"
          :rows="8"
          readonly
          placeholder="JSON结果将显示在这里..."
        />
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

const csvInput = ref('')
const jsonOutput = ref('')
</script>

<style scoped lang="scss">
.csv-json-tool {
  .input-section, .output-section {
    margin-bottom: 24px;
    h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
  }
}
</style>
