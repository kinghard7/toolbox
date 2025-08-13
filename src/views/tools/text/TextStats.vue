<template>
  <ToolContainer title="文本统计" description="文本内容统计分析工具">
    <div class="text-stats-tool">
      <div class="input-section">
        <div class="input-header">
          <h3>输入文本</h3>
          <div class="input-actions">
            <el-button size="small" @click="clearText">清空</el-button>
            <el-button size="small" @click="pasteText">粘贴</el-button>
          </div>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          placeholder="请输入要统计的文本..."
          @input="analyzeText"
        />
      </div>

      <div class="stats-section">
        <div class="stats-grid">
          <!-- 基础统计 -->
          <div class="stats-card">
            <h4>基础统计</h4>
            <div class="stats-list">
              <div class="stats-item">
                <span class="label">字符总数:</span>
                <span class="value">{{ stats.totalChars }}</span>
              </div>
              <div class="stats-item">
                <span class="label">字符数(无空格):</span>
                <span class="value">{{ stats.charsNoSpaces }}</span>
              </div>
              <div class="stats-item">
                <span class="label">单词数:</span>
                <span class="value">{{ stats.words }}</span>
              </div>
              <div class="stats-item">
                <span class="label">句子数:</span>
                <span class="value">{{ stats.sentences }}</span>
              </div>
              <div class="stats-item">
                <span class="label">段落数:</span>
                <span class="value">{{ stats.paragraphs }}</span>
              </div>
              <div class="stats-item">
                <span class="label">行数:</span>
                <span class="value">{{ stats.lines }}</span>
              </div>
            </div>
          </div>

          <!-- 字符分析 -->
          <div class="stats-card">
            <h4>字符分析</h4>
            <div class="stats-list">
              <div class="stats-item">
                <span class="label">字母:</span>
                <span class="value">{{ stats.letters }}</span>
              </div>
              <div class="stats-item">
                <span class="label">数字:</span>
                <span class="value">{{ stats.digits }}</span>
              </div>
              <div class="stats-item">
                <span class="label">空格:</span>
                <span class="value">{{ stats.spaces }}</span>
              </div>
              <div class="stats-item">
                <span class="label">标点符号:</span>
                <span class="value">{{ stats.punctuation }}</span>
              </div>
              <div class="stats-item">
                <span class="label">中文字符:</span>
                <span class="value">{{ stats.chinese }}</span>
              </div>
              <div class="stats-item">
                <span class="label">特殊字符:</span>
                <span class="value">{{ stats.special }}</span>
              </div>
            </div>
          </div>

          <!-- 阅读估算 -->
          <div class="stats-card">
            <h4>阅读估算</h4>
            <div class="stats-list">
              <div class="stats-item">
                <span class="label">阅读时间:</span>
                <span class="value">{{ stats.readingTime }}</span>
              </div>
              <div class="stats-item">
                <span class="label">打字时间:</span>
                <span class="value">{{ stats.typingTime }}</span>
              </div>
              <div class="stats-item">
                <span class="label">平均单词长度:</span>
                <span class="value">{{ stats.avgWordLength }}</span>
              </div>
              <div class="stats-item">
                <span class="label">平均句子长度:</span>
                <span class="value">{{ stats.avgSentenceLength }}</span>
              </div>
            </div>
          </div>

          <!-- 编码信息 -->
          <div class="stats-card">
            <h4>编码信息</h4>
            <div class="stats-list">
              <div class="stats-item">
                <span class="label">UTF-8字节:</span>
                <span class="value">{{ stats.utf8Bytes }}</span>
              </div>
              <div class="stats-item">
                <span class="label">UTF-16字节:</span>
                <span class="value">{{ stats.utf16Bytes }}</span>
              </div>
              <div class="stats-item">
                <span class="label">Base64长度:</span>
                <span class="value">{{ stats.base64Length }}</span>
              </div>
              <div class="stats-item">
                <span class="label">MD5长度:</span>
                <span class="value">32</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 词频统计 -->
        <div class="frequency-section" v-if="inputText.trim()">
          <h4>词频统计</h4>
          <div class="frequency-options">
            <el-input-number v-model="topWordsCount" :min="5" :max="50" controls-position="right" style="width: 120px;" @change="analyzeText" />
            <span style="margin-left: 8px;">显示前N个高频词</span>
            <el-checkbox v-model="ignoreCase" @change="analyzeText" style="margin-left: 16px;">忽略大小写</el-checkbox>
          </div>
          <div class="frequency-table">
            <el-table :data="stats.wordFrequency" size="small" max-height="300">
              <el-table-column prop="word" label="单词" width="150" />
              <el-table-column prop="count" label="频率" width="80" />
              <el-table-column prop="percentage" label="百分比" width="100" />
              <el-table-column label="可视化">
                <template #default="{ row }">
                  <div class="frequency-bar">
                    <div class="bar" :style="{ width: row.percentage }"></div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import ToolContainer from '@/components/base/ToolContainer.vue'

interface WordFrequency {
  word: string
  count: number
  percentage: string
}

interface TextStats {
  totalChars: number
  charsNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  letters: number
  digits: number
  spaces: number
  punctuation: number
  chinese: number
  special: number
  readingTime: string
  typingTime: string
  avgWordLength: string
  avgSentenceLength: string
  utf8Bytes: number
  utf16Bytes: number
  base64Length: number
  wordFrequency: WordFrequency[]
}

const inputText = ref('')
const topWordsCount = ref(10)
const ignoreCase = ref(true)

const stats = reactive<TextStats>({
  totalChars: 0,
  charsNoSpaces: 0,
  words: 0,
  sentences: 0,
  paragraphs: 0,
  lines: 0,
  letters: 0,
  digits: 0,
  spaces: 0,
  punctuation: 0,
  chinese: 0,
  special: 0,
  readingTime: '0分0秒',
  typingTime: '0分0秒',
  avgWordLength: '0',
  avgSentenceLength: '0',
  utf8Bytes: 0,
  utf16Bytes: 0,
  base64Length: 0,
  wordFrequency: []
})

// 分析文本
const analyzeText = () => {
  const text = inputText.value
  
  if (!text) {
    resetStats()
    return
  }

  // 基础统计
  stats.totalChars = text.length
  stats.charsNoSpaces = text.replace(/\s/g, '').length
  stats.lines = text.split('\n').length
  
  // 段落统计
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
  stats.paragraphs = paragraphs.length

  // 句子统计
  const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim())
  stats.sentences = sentences.length

  // 单词统计
  const words = text.match(/\b\w+\b/g) || []
  stats.words = words.length

  // 字符分析
  stats.letters = (text.match(/[a-zA-Z]/g) || []).length
  stats.digits = (text.match(/\d/g) || []).length
  stats.spaces = (text.match(/\s/g) || []).length
  stats.punctuation = (text.match(/[.,;:!?。，；：！？]/g) || []).length
  stats.chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length
  stats.special = stats.totalChars - stats.letters - stats.digits - stats.spaces - stats.punctuation - stats.chinese

  // 阅读时间估算 (平均阅读速度200字/分钟)
  const readingMinutes = stats.words / 200
  stats.readingTime = formatTime(readingMinutes)

  // 打字时间估算 (平均打字速度40字/分钟)
  const typingMinutes = stats.words / 40
  stats.typingTime = formatTime(typingMinutes)

  // 平均长度
  stats.avgWordLength = stats.words > 0 ? (stats.letters / stats.words).toFixed(1) : '0'
  stats.avgSentenceLength = stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : '0'

  // 编码字节数
  stats.utf8Bytes = new Blob([text]).size
  stats.utf16Bytes = text.length * 2
  stats.base64Length = Math.ceil(stats.utf8Bytes / 3) * 4

  // 词频统计
  analyzeWordFrequency(words)
}

// 格式化时间
const formatTime = (minutes: number): string => {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}秒`
  }
  const mins = Math.floor(minutes)
  const secs = Math.round((minutes - mins) * 60)
  return `${mins}分${secs}秒`
}

// 词频分析
const analyzeWordFrequency = (words: string[]) => {
  if (words.length === 0) {
    stats.wordFrequency = []
    return
  }

  const frequency: { [key: string]: number } = {}
  
  words.forEach(word => {
    const key = ignoreCase.value ? word.toLowerCase() : word
    frequency[key] = (frequency[key] || 0) + 1
  })

  const sortedWords = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topWordsCount.value)

  const totalWords = words.length

  stats.wordFrequency = sortedWords.map(([word, count]) => ({
    word,
    count,
    percentage: ((count / totalWords) * 100).toFixed(1) + '%'
  }))
}

// 重置统计
const resetStats = () => {
  Object.assign(stats, {
    totalChars: 0,
    charsNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    letters: 0,
    digits: 0,
    spaces: 0,
    punctuation: 0,
    chinese: 0,
    special: 0,
    readingTime: '0分0秒',
    typingTime: '0分0秒',
    avgWordLength: '0',
    avgSentenceLength: '0',
    utf8Bytes: 0,
    utf16Bytes: 0,
    base64Length: 0,
    wordFrequency: []
  })
}

// 清空文本
const clearText = () => {
  inputText.value = ''
  resetStats()
}

// 粘贴文本
const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    analyzeText()
    ElMessage.success('文本已粘贴')
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}
</script>

<style scoped lang="scss">
.text-stats-tool {
  .input-section {
    margin-bottom: 24px;

    .input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .input-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .stats-section {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .stats-card {
        padding: 16px;
        border: 1px solid var(--el-border-color);
        border-radius: 6px;
        background-color: var(--el-bg-color);

        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          border-bottom: 1px solid var(--el-border-color-lighter);
          padding-bottom: 8px;
        }

        .stats-list {
          .stats-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: var(--el-text-color-regular);
            }

            .value {
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }
        }
      }
    }

    .frequency-section {
      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .frequency-options {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }

      .frequency-table {
        .frequency-bar {
          width: 100px;
          height: 20px;
          background-color: var(--el-fill-color-light);
          border-radius: 10px;
          overflow: hidden;

          .bar {
            height: 100%;
            background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
            transition: width 0.3s ease;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .text-stats-tool {
    .input-section .input-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .stats-section {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .frequency-section .frequency-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  }
}
</style>
