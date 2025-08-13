<template>
  <div class="markdown-html-tool">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Markdown转HTML -->
      <el-tab-pane label="Markdown转HTML" name="md2html">
        <div class="conversion-container">
          <div class="input-section">
            <div class="section-header">
              <h3>Markdown输入</h3>
              <div class="actions">
                <el-button size="small" @click="loadExample('markdown')">加载示例</el-button>
                <el-button size="small" @click="clearInput('markdown')">清空</el-button>
                <el-button size="small" @click="copyToClipboard(markdownInput)">复制</el-button>
                <el-button size="small" @click="downloadFile(markdownInput, 'markdown.md', 'text/markdown')">下载</el-button>
              </div>
            </div>
            <el-input
              v-model="markdownInput"
              type="textarea"
              :rows="15"
              placeholder="请输入Markdown内容..."
              @input="convertMarkdownToHtml"
            />
            <div class="options">
              <el-checkbox v-model="options.allowHtml">允许HTML标签</el-checkbox>
              <el-checkbox v-model="options.breaks">换行符转换为&lt;br&gt;</el-checkbox>
              <el-checkbox v-model="options.linkify">自动链接</el-checkbox>
              <el-checkbox v-model="options.typographer">启用排版</el-checkbox>
            </div>
          </div>
          
          <div class="output-section">
            <div class="section-header">
              <h3>HTML输出</h3>
              <div class="actions">
                <el-button size="small" @click="copyToClipboard(htmlOutput)">复制</el-button>
                <el-button size="small" @click="downloadFile(htmlOutput, 'output.html', 'text/html')">下载</el-button>
                <el-button size="small" @click="togglePreview">预览</el-button>
              </div>
            </div>
            <el-input
              v-model="htmlOutput"
              type="textarea"
              :rows="15"
              placeholder="HTML输出..."
              readonly
            />
          </div>
        </div>
        
        <!-- 实时预览 -->
        <div v-if="showPreview" class="preview-section">
          <div class="section-header">
            <h3>实时预览</h3>
            <el-button size="small" @click="togglePreview">隐藏预览</el-button>
          </div>
          <div class="preview-content" v-html="htmlOutput"></div>
        </div>
      </el-tab-pane>

      <!-- HTML转Markdown -->
      <el-tab-pane label="HTML转Markdown" name="html2md">
        <div class="conversion-container">
          <div class="input-section">
            <div class="section-header">
              <h3>HTML输入</h3>
              <div class="actions">
                <el-button size="small" @click="loadExample('html')">加载示例</el-button>
                <el-button size="small" @click="clearInput('html')">清空</el-button>
                <el-button size="small" @click="copyToClipboard(htmlInput)">复制</el-button>
                <el-button size="small" @click="downloadFile(htmlInput, 'input.html', 'text/html')">下载</el-button>
              </div>
            </div>
            <el-input
              v-model="htmlInput"
              type="textarea"
              :rows="15"
              placeholder="请输入HTML内容..."
              @input="convertHtmlToMarkdown"
            />
            <div class="options">
              <el-checkbox v-model="options.html2md.keepTags">保留标签</el-checkbox>
              <el-checkbox v-model="options.html2md.keepAttributes">保留属性</el-checkbox>
              <el-checkbox v-model="options.html2md.keepLinks">保留链接</el-checkbox>
              <el-checkbox v-model="options.html2md.keepImages">保留图片</el-checkbox>
            </div>
          </div>
          
          <div class="output-section">
            <div class="section-header">
              <h3>Markdown输出</h3>
              <div class="actions">
                <el-button size="small" @click="copyToClipboard(markdownOutput)">复制</el-button>
                <el-button size="small" @click="downloadFile(markdownOutput, 'output.md', 'text/markdown')">下载</el-button>
              </div>
            </div>
            <el-input
              v-model="markdownOutput"
              type="textarea"
              :rows="15"
              placeholder="Markdown输出..."
              readonly
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 常用Markdown语法 -->
      <el-tab-pane label="Markdown语法参考" name="reference">
        <div class="reference-section">
          <h3>常用Markdown语法</h3>
          <el-table :data="markdownReference" style="width: 100%">
            <el-table-column prop="syntax" label="语法" width="200" />
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="example" label="示例" width="300" />
            <el-table-column prop="result" label="效果" width="200">
              <template #default="scope">
                <div v-html="scope.row.result"></div>
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
const activeTab = ref('md2html')
const markdownInput = ref('')
const htmlOutput = ref('')
const htmlInput = ref('')
const markdownOutput = ref('')
const showPreview = ref(false)

// 配置选项
const options = reactive({
  allowHtml: true,
  breaks: false,
  linkify: true,
  typographer: false,
  html2md: {
    keepTags: false,
    keepAttributes: false,
    keepLinks: true,
    keepImages: true
  }
})

// Markdown语法参考
const markdownReference = ref([
  {
    syntax: '# 标题',
    description: '一级标题',
    example: '# 一级标题',
    result: '<h1>一级标题</h1>'
  },
  {
    syntax: '## 标题',
    description: '二级标题',
    example: '## 二级标题',
    result: '<h2>二级标题</h2>'
  },
  {
    syntax: '**粗体**',
    description: '粗体文本',
    example: '**粗体文本**',
    result: '<strong>粗体文本</strong>'
  },
  {
    syntax: '*斜体*',
    description: '斜体文本',
    example: '*斜体文本*',
    result: '<em>斜体文本</em>'
  },
  {
    syntax: '`代码`',
    description: '行内代码',
    example: '`代码`',
    result: '<code>代码</code>'
  },
  {
    syntax: '```\n代码块\n```',
    description: '代码块',
    example: '```\n代码块\n```',
    result: '<pre><code>代码块</code></pre>'
  },
  {
    syntax: '[链接](URL)',
    description: '超链接',
    example: '[链接](https://example.com)',
    result: '<a href="https://example.com">链接</a>'
  },
  {
    syntax: '![图片](URL)',
    description: '图片',
    example: '![图片](image.jpg)',
    result: '<img src="image.jpg" alt="图片">'
  },
  {
    syntax: '- 列表项',
    description: '无序列表',
    example: '- 列表项',
    result: '<ul><li>列表项</li></ul>'
  },
  {
    syntax: '1. 列表项',
    description: '有序列表',
    example: '1. 列表项',
    result: '<ol><li>列表项</li></ol>'
  },
  {
    syntax: '> 引用',
    description: '引用文本',
    example: '> 引用文本',
    result: '<blockquote>引用文本</blockquote>'
  },
  {
    syntax: '---',
    description: '分割线',
    example: '---',
    result: '<hr>'
  }
])

// 示例内容
const examples = {
  markdown: `# Markdown示例

这是一个**Markdown**示例文档，展示了各种语法特性。

## 文本格式

- **粗体文本**
- *斜体文本*
- \`行内代码\`
- ~~删除线~~

## 列表

### 无序列表
- 项目1
- 项目2
  - 子项目2.1
  - 子项目2.2

### 有序列表
1. 第一项
2. 第二项
3. 第三项

## 链接和图片

[访问GitHub](https://github.com)

![示例图片](https://via.placeholder.com/300x200)

## 代码

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## 引用

> 这是一个引用块
> 可以包含多行内容

## 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |

---

*文档结束*`,

  html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML示例</title>
</head>
<body>
    <h1>HTML示例</h1>
    
    <p>这是一个<strong>HTML</strong>示例文档，展示了各种标签的使用。</p>
    
    <h2>文本格式</h2>
    <ul>
        <li><strong>粗体文本</strong></li>
        <li><em>斜体文本</em></li>
        <li><code>行内代码</code></li>
        <li><del>删除线</del></li>
    </ul>
    
    <h2>链接和图片</h2>
    <p><a href="https://github.com">访问GitHub</a></p>
    <img src="https://via.placeholder.com/300x200" alt="示例图片">
    
    <h2>代码块</h2>
    <pre><code>function hello() {
    console.log("Hello, World!");
}</code></pre>
    
    <h2>引用</h2>
    <blockquote>
        <p>这是一个引用块，可以包含多行内容。</p>
    </blockquote>
    
    <h2>表格</h2>
    <table border="1">
        <thead>
            <tr>
                <th>列1</th>
                <th>列2</th>
                <th>列3</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>内容1</td>
                <td>内容2</td>
                <td>内容3</td>
            </tr>
            <tr>
                <td>内容4</td>
                <td>内容5</td>
                <td>内容6</td>
            </tr>
        </tbody>
    </table>
    
    <hr>
    <p><em>文档结束</em></p>
</body>
</html>`
}

// 方法
const convertMarkdownToHtml = () => {
  if (!markdownInput.value.trim()) {
    htmlOutput.value = ''
    return
  }
  
  try {
    // 简单的Markdown转HTML实现
    let html = markdownInput.value
    
    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // 删除线
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')
    
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>')
    
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    
    // 无序列表
    html = html.replace(/^[\s]*[-*+] (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    
    // 有序列表
    html = html.replace(/^[\s]*\d+\. (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
    
    // 引用
    html = html.replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>')
    
    // 分割线
    html = html.replace(/^---$/gim, '<hr>')
    
    // 段落
    html = html.replace(/\n\n/g, '</p><p>')
    html = html = '<p>' + html + '</p>'
    
    // 清理空段落
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p><\/p>/g, '')
    
    // 换行符
    if (options.breaks) {
      html = html.replace(/\n/g, '<br>')
    }
    
    htmlOutput.value = html
  } catch (error) {
    ElMessage.error('转换失败：' + error.message)
  }
}

const convertHtmlToMarkdown = () => {
  if (!htmlInput.value.trim()) {
    markdownOutput.value = ''
    return
  }
  
  try {
    // 简单的HTML转Markdown实现
    let markdown = htmlInput.value
    
    // 移除DOCTYPE和HTML标签
    markdown = markdown.replace(/<!DOCTYPE[^>]*>/gi, '')
    markdown = markdown.replace(/<html[^>]*>/gi, '')
    markdown = markdown.replace(/<\/html>/gi, '')
    markdown = markdown.replace(/<head[\s\S]*?<\/head>/gi, '')
    markdown = markdown.replace(/<body[^>]*>/gi, '')
    markdown = markdown.replace(/<\/body>/gi, '')
    
    // 标题
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1')
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1')
    
    // 粗体和斜体
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // 删除线
    markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
    markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    
    // 行内代码
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    
    // 代码块
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```')
    
    // 链接
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // 图片
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    
    // 无序列表
    markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    })
    
    // 有序列表
    markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let index = 1
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
        return `${index++}. $1\n`
      })
    })
    
    // 引用
    markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return content.replace(/<p[^>]*>(.*?)<\/p>/gi, '> $1\n')
    })
    
    // 分割线
    markdown = markdown.replace(/<hr[^>]*>/gi, '---')
    
    // 段落
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    
    // 换行
    markdown = markdown.replace(/<br[^>]*>/gi, '\n')
    
    // 清理多余的空行和空格
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n')
    markdown = markdown.replace(/^\s+|\s+$/gm, '')
    
    markdownOutput.value = markdown
  } catch (error) {
    ElMessage.error('转换失败：' + error.message)
  }
}

const loadExample = (type: 'markdown' | 'html') => {
  if (type === 'markdown') {
    markdownInput.value = examples.markdown
    convertMarkdownToHtml()
  } else {
    htmlInput.value = examples.html
    convertHtmlToMarkdown()
  }
  ElMessage.success('示例已加载')
}

const clearInput = (type: 'markdown' | 'html') => {
  if (type === 'markdown') {
    markdownInput.value = ''
    htmlOutput.value = ''
  } else {
    htmlInput.value = ''
    markdownOutput.value = ''
  }
  ElMessage.success('内容已清空')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件已下载')
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// 生命周期
onMounted(() => {
  // 加载默认示例
  loadExample('markdown')
})
</script>

<style scoped>
.markdown-html-tool {
  padding: 20px;
}

.conversion-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
}

.actions {
  display: flex;
  gap: 8px;
}

.options {
  margin-top: 10px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.preview-section {
  margin-top: 20px;
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

.preview-content {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  background: #fafafa;
  min-height: 200px;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
}

.preview-content p {
  margin-bottom: 16px;
  line-height: 1.6;
}

.preview-content ul,
.preview-content ol {
  margin-bottom: 16px;
  padding-left: 20px;
}

.preview-content li {
  margin-bottom: 8px;
}

.preview-content blockquote {
  border-left: 4px solid #409eff;
  margin: 16px 0;
  padding-left: 16px;
  color: #606266;
  font-style: italic;
}

.preview-content code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.preview-content pre {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.preview-content pre code {
  background: none;
  padding: 0;
}

.preview-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.preview-content th,
.preview-content td {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.preview-content th {
  background: #f5f7fa;
  font-weight: 600;
}

.preview-content img {
  max-width: 100%;
  height: auto;
}

.preview-content a {
  color: #409eff;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.reference-section {
  padding: 20px 0;
}

.reference-section h3 {
  margin-bottom: 20px;
  color: #303133;
}

@media (max-width: 768px) {
  .conversion-container {
    grid-template-columns: 1fr;
  }
  
  .options {
    flex-direction: column;
    gap: 8px;
  }
  
  .actions {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
