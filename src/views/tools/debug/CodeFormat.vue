<template>
  <ToolContainer title="代码格式化" description="HTML、CSS、JavaScript代码格式化和压缩工具">
    <div class="code-format-tool">
      <div class="tool-header">
        <div class="language-selector">
          <el-radio-group v-model="selectedLanguage" @change="handleLanguageChange">
            <el-radio-button label="html">HTML</el-radio-button>
            <el-radio-button label="css">CSS</el-radio-button>
            <el-radio-button label="javascript">JavaScript</el-radio-button>
            <el-radio-button label="json">JSON</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="formatCode" :disabled="!inputCode.trim()">
            <el-icon><Document /></el-icon>
            格式化
          </el-button>
          <el-button @click="minifyCode" :disabled="!inputCode.trim()">
            <el-icon><Delete /></el-icon>
            压缩
          </el-button>
          <el-button @click="clearCode">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <div class="code-editor-section">
        <div class="input-section">
          <div class="section-header">
            <h3>输入代码</h3>
            <div class="input-actions">
              <el-button size="small" @click="pasteCode">粘贴</el-button>
              <el-button size="small" @click="loadSampleCode">加载示例</el-button>
            </div>
          </div>
          <el-input
            v-model="inputCode"
            type="textarea"
            :rows="12"
            :placeholder="getPlaceholder()"
            class="code-input"
          />
        </div>

        <div class="output-section">
          <div class="section-header">
            <h3>输出结果</h3>
            <div class="output-actions">
              <el-button size="small" @click="copyOutput">复制</el-button>
              <el-button size="small" @click="downloadOutput">下载</el-button>
            </div>
          </div>
          <el-input
            v-model="outputCode"
            type="textarea"
            :rows="12"
            readonly
            class="code-output"
          />
        </div>
      </div>

      <div class="options-section">
        <el-card class="options-card">
          <template #header>
            <span>格式化选项</span>
          </template>
          
          <div class="options-grid">
            <div class="option-item">
              <el-checkbox v-model="options.indentWithSpaces">使用空格缩进</el-checkbox>
            </div>
            <div class="option-item">
              <el-input-number
                v-model="options.indentSize"
                :min="2"
                :max="8"
                size="small"
                label="缩进大小"
              />
              <span class="option-label">缩进大小</span>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.wrapAttributes">换行属性</el-checkbox>
            </div>
            <div class="option-item">
              <el-checkbox v-model="options.maxLineLength">限制行长度</el-checkbox>
            </div>
            <div class="option-item" v-if="options.maxLineLength">
              <el-input-number
                v-model="options.maxLineLengthValue"
                :min="40"
                :max="200"
                size="small"
                label="最大行长度"
              />
              <span class="option-label">最大行长度</span>
            </div>
          </div>
        </el-card>
      </div>

      <div class="stats-section">
        <el-card class="stats-card">
          <template #header>
            <span>代码统计</span>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">原始大小:</span>
              <span class="stat-value">{{ formatFileSize(inputCode.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">处理后大小:</span>
              <span class="stat-value">{{ formatFileSize(outputCode.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">压缩率:</span>
              <span class="stat-value">{{ compressionRatio }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">行数:</span>
              <span class="stat-value">{{ lineCount }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'
import ToolContainer from '@/components/base/ToolContainer.vue'

// 语言类型
type Language = 'html' | 'css' | 'javascript' | 'json'

// 格式化选项
interface FormatOptions {
  indentWithSpaces: boolean
  indentSize: number
  wrapAttributes: boolean
  maxLineLength: boolean
  maxLineLengthValue: number
}

// 响应式数据
const selectedLanguage = ref<Language>('html')
const inputCode = ref('')
const outputCode = ref('')

const options = ref<FormatOptions>({
  indentWithSpaces: true,
  indentSize: 2,
  wrapAttributes: true,
  maxLineLength: false,
  maxLineLengthValue: 80
})

// 计算属性
const compressionRatio = computed(() => {
  if (!inputCode.value || !outputCode.value) return 0
  const ratio = ((inputCode.value.length - outputCode.value.length) / inputCode.value.length) * 100
  return Math.round(ratio)
})

const lineCount = computed(() => {
  return outputCode.value ? outputCode.value.split('\n').length : 0
})

// 方法
const getPlaceholder = () => {
  const placeholders = {
    html: '请输入HTML代码...',
    css: '请输入CSS代码...',
    javascript: '请输入JavaScript代码...',
    json: '请输入JSON代码...'
  }
  return placeholders[selectedLanguage.value]
}

const handleLanguageChange = () => {
  // 切换语言时清空输出
  outputCode.value = ''
}

const formatCode = () => {
  if (!inputCode.value.trim()) {
    ElMessage.warning('请先输入代码')
    return
  }

  try {
    switch (selectedLanguage.value) {
      case 'html':
        outputCode.value = formatHTML(inputCode.value)
        break
      case 'css':
        outputCode.value = formatCSS(inputCode.value)
        break
      case 'javascript':
        outputCode.value = formatJavaScript(inputCode.value)
        break
      case 'json':
        outputCode.value = formatJSON(inputCode.value)
        break
    }
    ElMessage.success('代码格式化完成')
  } catch (error) {
    ElMessage.error('代码格式化失败：' + (error as Error).message)
  }
}

const minifyCode = () => {
  if (!inputCode.value.trim()) {
    ElMessage.warning('请先输入代码')
    return
  }

  try {
    switch (selectedLanguage.value) {
      case 'html':
        outputCode.value = minifyHTML(inputCode.value)
        break
      case 'css':
        outputCode.value = minifyCSS(inputCode.value)
        break
      case 'javascript':
        outputCode.value = minifyJavaScript(inputCode.value)
        break
      case 'json':
        outputCode.value = minifyJSON(inputCode.value)
        break
    }
    ElMessage.success('代码压缩完成')
  } catch (error) {
    ElMessage.error('代码压缩失败：' + (error as Error).message)
  }
}

const clearCode = () => {
  inputCode.value = ''
  outputCode.value = ''
}

const pasteCode = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputCode.value = text
    ElMessage.success('代码已粘贴')
  } catch (error) {
    ElMessage.error('无法访问剪贴板')
  }
}

const copyOutput = async () => {
  if (!outputCode.value) {
    ElMessage.warning('没有输出内容可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(outputCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadOutput = () => {
  if (!outputCode.value) {
    ElMessage.warning('没有输出内容可下载')
    return
  }

  const extension = getFileExtension()
  const filename = `formatted-code.${extension}`
  const blob = new Blob([outputCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载完成')
}

const getFileExtension = () => {
  const extensions = {
    html: 'html',
    css: 'css',
    javascript: 'js',
    json: 'json'
  }
  return extensions[selectedLanguage.value]
}

const loadSampleCode = () => {
  const samples = {
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例页面</title>
</head>
<body>
    <header>
        <h1>欢迎使用代码格式化工具</h1>
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>功能特点</h2>
            <p>支持多种编程语言的格式化和压缩</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 代码格式化工具</p>
    </footer>
</body>
</html>`,
    css: `/* 基础样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

/* 头部样式 */
header {
    background-color: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}

header h1 {
    margin-bottom: 1rem;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover {
    background-color: #555;
}

/* 主要内容 */
main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

section {
    background-color: white;
    padding: 2rem;
    margin-bottom: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    margin-bottom: 1rem;
}

/* 页脚 */
footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}`,
    javascript: `// 工具类函数
class CodeFormatter {
    constructor(options = {}) {
        this.options = {
            indentWithSpaces: true,
            indentSize: 2,
            wrapAttributes: true,
            maxLineLength: false,
            maxLineLengthValue: 80,
            ...options
        };
    }

    // 格式化HTML代码
    formatHTML(html) {
        if (!html || typeof html !== 'string') {
            throw new Error('Invalid HTML input');
        }

        // 移除多余的空白字符
        html = html.replace(/\\s+/g, ' ').trim();
        
        // 添加换行和缩进
        let formatted = '';
        let indentLevel = 0;
        const indent = this.options.indentWithSpaces ? ' '.repeat(this.options.indentSize) : '\\t';
        
        // 简单的HTML格式化逻辑
        const tags = html.match(/<[^>]*>/g) || [];
        let currentIndex = 0;
        
        tags.forEach(tag => {
            const tagIndex = html.indexOf(tag, currentIndex);
            const textBefore = html.substring(currentIndex, tagIndex).trim();
            
            if (textBefore) {
                formatted += '\\n' + indent.repeat(indentLevel) + textBefore;
            }
            
            if (tag.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            formatted += '\\n' + indent.repeat(indentLevel) + tag;
            
            if (!tag.startsWith('</') && !tag.endsWith('/>')) {
                indentLevel++;
            }
            
            currentIndex = tagIndex + tag.length;
        });
        
        return formatted.trim();
    }

    // 格式化CSS代码
    formatCSS(css) {
        if (!css || typeof css !== 'string') {
            throw new Error('Invalid CSS input');
        }

        // 移除注释和多余空白
        css = css.replace(/\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*\\//g, '');
        css = css.replace(/\\s+/g, ' ');
        
        // 添加换行和缩进
        let formatted = '';
        let indentLevel = 0;
        const indent = this.options.indentWithSpaces ? ' '.repeat(this.options.indentSize) : '\\t';
        
        // 简单的CSS格式化逻辑
        const rules = css.split('}');
        rules.forEach((rule, index) => {
            if (rule.trim()) {
                const parts = rule.split('{');
                if (parts.length === 2) {
                    const selector = parts[0].trim();
                    const properties = parts[1].trim();
                    
                    formatted += '\\n' + indent.repeat(indentLevel) + selector + ' {';
                    
                    if (properties) {
                        const props = properties.split(';').filter(p => p.trim());
                        props.forEach(prop => {
                            if (prop.trim()) {
                                formatted += '\\n' + indent.repeat(indentLevel + 1) + prop.trim() + ';';
                            }
                        });
                    }
                    
                    formatted += '\\n' + indent.repeat(indentLevel) + '}';
                }
            }
        });
        
        return formatted.trim();
    }

    // 格式化JavaScript代码
    formatJavaScript(js) {
        if (!js || typeof js !== 'string') {
            throw new Error('Invalid JavaScript input');
        }

        try {
            // 使用JSON.stringify来格式化对象字面量
            // 这是一个简化的实现，实际项目中建议使用专业的代码格式化库
            let formatted = js;
            
            // 基本的格式化：在分号后添加换行
            formatted = formatted.replace(/;/g, ';\\n');
            
            // 在花括号后添加换行
            formatted = formatted.replace(/\\}/g, '\\n}\\n');
            formatted = formatted.replace(/\\{/g, ' {\\n');
            
            // 清理多余的换行
            formatted = formatted.replace(/\\n\\s*\\n/g, '\\n');
            
            return formatted.trim();
        } catch (error) {
            throw new Error('JavaScript formatting failed: ' + error.message);
        }
    }

    // 格式化JSON代码
    formatJSON(json) {
        if (!json || typeof json !== 'string') {
            throw new Error('Invalid JSON input');
        }

        try {
            const parsed = JSON.parse(json);
            return JSON.stringify(parsed, null, this.options.indentSize);
        } catch (error) {
            throw new Error('Invalid JSON: ' + error.message);
        }
    }
}

// 导出工具类
export default CodeFormatter;`,
    json: `{
  "name": "代码格式化工具",
  "version": "1.0.0",
  "description": "一个支持多种编程语言格式化和压缩的在线工具",
  "author": "开发者",
  "license": "MIT",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "webpack": "^5.88.2",
    "webpack-cli": "^5.1.4",
    "jest": "^29.6.2",
    "eslint": "^8.47.0",
    "prettier": "^3.0.2"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/example/code-formatter.git"
  },
  "bugs": {
    "url": "https://github.com/example/code-formatter/issues"
  },
  "homepage": "https://github.com/example/code-formatter#readme",
  "keywords": [
    "code",
    "formatter",
    "beautifier",
    "minifier",
    "html",
    "css",
    "javascript",
    "json"
  ]
}`
  }
  
  inputCode.value = samples[selectedLanguage.value]
  ElMessage.success('示例代码已加载')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化函数实现
const formatHTML = (html: string): string => {
  // 简化的HTML格式化
  return html
    .replace(/>\s+</g, '>\n<')
    .replace(/\n\s*\n/g, '\n')
    .split('\n')
    .map((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      
      let indent = 0
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, index - 1)
      } else if (!trimmed.startsWith('<!') && !trimmed.startsWith('<meta') && !trimmed.startsWith('<link')) {
        indent = index
      }
      
      return '  '.repeat(indent) + trimmed
    })
    .filter(line => line !== '')
    .join('\n')
}

const formatCSS = (css: string): string => {
  // 简化的CSS格式化
  return css
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/\s*;\s*/g, ';\n  ')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

const formatJavaScript = (js: string): string => {
  // 简化的JavaScript格式化
  try {
    // 使用eval来格式化（仅用于演示，生产环境不推荐）
    return js
      .replace(/;/g, ';\n')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  } catch {
    return js
  }
}

const formatJSON = (json: string): string => {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    throw new Error('Invalid JSON: ' + (error as Error).message)
  }
}

// 压缩函数实现
const minifyHTML = (html: string): string => {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

const minifyCSS = (css: string): string => {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*}\s*/g, '}')
    .trim()
}

const minifyJavaScript = (js: string): string => {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
    .replace(/\/\/.*$/gm, '') // 移除单行注释
    .replace(/\s+/g, ' ')
    .trim()
}

const minifyJSON = (json: string): string => {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed)
  } catch (error) {
    throw new Error('Invalid JSON: ' + (error as Error).message)
  }
}
</script>

<style scoped lang="scss">
.code-format-tool {
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;

    .language-selector {
      .el-radio-group {
        .el-radio-button__inner {
          padding: 8px 16px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;

      .el-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  .code-editor-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .input-section,
    .output-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        h3 {
          margin: 0;
          color: #333;
        }

        .input-actions,
        .output-actions {
          display: flex;
          gap: 0.5rem;
        }
      }

      .code-input,
      .code-output {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;

        :deep(.el-textarea__inner) {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          padding: 1rem;
          border-radius: 8px;
        }
      }

      .code-output {
        :deep(.el-textarea__inner) {
          background-color: #f8f9fa;
          color: #666;
        }
      }
    }
  }

  .options-section {
    margin-bottom: 1.5rem;

    .options-card {
      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: center;

        .option-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .option-label {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }

  .stats-section {
    .stats-card {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 4px;

          .stat-label {
            font-size: 14px;
            color: #666;
          }

          .stat-value {
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
