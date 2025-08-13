import { ToolCategory, type ToolInfo } from '@/types'

// 工具配置
export const toolsConfig: ToolInfo[] = [
  // 编码/加密/解密类（8个）
  {
    id: 'base64',
    name: 'Base64 编码/解码',
    description: '支持文本和文件的Base64编码解码',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/base64',
    icon: 'Document',
    tags: ['base64', '编码', '解码']
  },
  {
    id: 'url-encode',
    name: 'URL 编码/解码',
    description: 'URL编码解码工具',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/url',
    icon: 'Link',
    tags: ['url', '编码', '解码']
  },
  {
    id: 'html-entity',
    name: 'HTML 实体编码/解码',
    description: 'HTML实体字符转换',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/html-entity',
    icon: 'Document',
    tags: ['html', '实体', '编码']
  },
  {
    id: 'unicode',
    name: 'Unicode ↔ UTF-8 转换',
    description: 'Unicode码点与字符互转',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/unicode',
    icon: 'Document',
    tags: ['unicode', 'utf8', '转换']
  },
  {
    id: 'md5',
    name: 'MD5 哈希',
    description: '计算文本或文件的MD5哈希值',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/md5',
    icon: 'Key',
    tags: ['md5', '哈希', '加密']
  },
  {
    id: 'sha',
    name: 'SHA 系列哈希',
    description: '支持SHA1/SHA256/SHA512',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/sha',
    icon: 'Key',
    tags: ['sha', '哈希', '加密']
  },
  {
    id: 'jwt',
    name: 'JWT 解析器',
    description: 'JWT Token解析和验证',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/jwt',
    icon: 'Postcard',
    tags: ['jwt', 'token', '解析']
  },
  {
    id: 'aes-des',
    name: 'AES/DES 加密解密',
    description: '对称加密解密工具',
    category: ToolCategory.ENCODING,
    path: '/tools/encoding/aes-des',
    icon: 'Lock',
    tags: ['aes', 'des', '加密', '解密']
  },

  // JSON & 数据处理类（10个）
  {
    id: 'json-format',
    name: 'JSON 格式化/压缩',
    description: 'JSON格式化、压缩和验证',
    category: ToolCategory.JSON,
    path: '/tools/json/format',
    icon: 'Document',
    tags: ['json', '格式化', '压缩']
  },
  {
    id: 'json-to-csv',
    name: 'JSON 转 CSV',
    description: 'JSON数据转换为CSV格式',
    category: ToolCategory.JSON,
    path: '/tools/json/to-csv',
    icon: 'DocumentCopy',
    tags: ['json', 'csv', '转换']
  },
  {
    id: 'csv-to-json',
    name: 'CSV 转 JSON',
    description: 'CSV数据转换为JSON格式',
    category: ToolCategory.JSON,
    path: '/tools/json/from-csv',
    icon: 'DocumentCopy',
    tags: ['csv', 'json', '转换']
  },
  {
    id: 'json-yaml',
    name: 'JSON ↔ YAML 互转',
    description: 'JSON与YAML格式互转',
    category: ToolCategory.JSON,
    path: '/tools/json/yaml',
    icon: 'DocumentCopy',
    tags: ['json', 'yaml', '转换']
  },
  {
    id: 'json-xml',
    name: 'JSON ↔ XML 互转',
    description: 'JSON与XML格式互转',
    category: ToolCategory.JSON,
    path: '/tools/json/xml',
    icon: 'DocumentCopy',
    tags: ['json', 'xml', '转换']
  },
  {
    id: 'json-schema',
    name: 'JSON Schema 验证',
    description: 'JSON Schema验证和生成',
    category: ToolCategory.JSON,
    path: '/tools/json/schema',
    icon: 'DocumentChecked',
    tags: ['json', 'schema', '验证']
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: '两个JSON对象对比',
    category: ToolCategory.JSON,
    path: '/tools/json/diff',
    icon: 'DocumentCopy',
    tags: ['json', 'diff', '对比']
  },
  {
    id: 'case-convert',
    name: '字符串大小写转换',
    description: '各种大小写格式转换',
    category: ToolCategory.JSON,
    path: '/tools/json/case-convert',
    icon: 'Document',
    tags: ['字符串', '大小写', '转换']
  },
  {
    id: 'regex-test',
    name: '正则表达式测试器',
    description: '正则匹配测试和高亮',
    category: ToolCategory.JSON,
    path: '/tools/json/regex',
    icon: 'Search',
    tags: ['正则', '测试', '匹配']
  },
  {
    id: 'uuid',
    name: 'UUID 生成器',
    description: 'UUID生成和验证',
    category: ToolCategory.JSON,
    path: '/tools/json/uuid',
    icon: 'Key',
    tags: ['uuid', '生成', '验证']
  },

  // 文本处理类（7个）
  {
    id: 'text-diff',
    name: '文本对比',
    description: '文本差异对比和高亮',
    category: ToolCategory.TEXT,
    path: '/tools/text/diff',
    icon: 'DocumentCopy',
    tags: ['文本', '对比', '差异']
  },
  {
    id: 'text-deduplicate',
    name: '文本去重',
    description: '行去重和单词去重',
    category: ToolCategory.TEXT,
    path: '/tools/text/deduplicate',
    icon: 'Document',
    tags: ['文本', '去重', '清理']
  },
  {
    id: 'text-sort',
    name: '文本排序',
    description: '按字母、数字或长度排序',
    category: ToolCategory.TEXT,
    path: '/tools/text/sort',
    icon: 'Sort',
    tags: ['文本', '排序', '整理']
  },
  {
    id: 'text-stats',
    name: '单词统计/字数统计',
    description: '文本统计信息',
    category: ToolCategory.TEXT,
    path: '/tools/text/stats',
    icon: 'DataAnalysis',
    tags: ['统计', '字数', '单词']
  },
  {
    id: 'text-replace',
    name: '文本查找替换',
    description: '支持正则的查找替换',
    category: ToolCategory.TEXT,
    path: '/tools/text/replace',
    icon: 'EditPen',
    tags: ['查找', '替换', '正则']
  },
  {
    id: 'text-clean',
    name: '文本清理',
    description: '去空格、特殊符号等',
    category: ToolCategory.TEXT,
    path: '/tools/text/clean',
    icon: 'Delete',
    tags: ['清理', '空格', '符号']
  },
  {
    id: 'password-gen',
    name: '随机字符串/密码生成器',
    description: '生成安全的随机密码',
    category: ToolCategory.TEXT,
    path: '/tools/text/password',
    icon: 'Key',
    tags: ['密码', '随机', '生成']
  },

  // UI/设计辅助类（8个）
  {
    id: 'color-convert',
    name: '颜色转换',
    description: 'HEX ↔ RGB ↔ HSL转换',
    category: ToolCategory.UI,
    path: '/tools/ui/color-convert',
    icon: 'Brush',
    tags: ['颜色', '转换', 'hex', 'rgb']
  },
  {
    id: 'color-picker',
    name: '颜色取色器',
    description: '从图片中取色',
    category: ToolCategory.UI,
    path: '/tools/ui/color-picker',
    icon: 'Brush',
    tags: ['取色', '颜色', '图片']
  },
  {
    id: 'gradient',
    name: '渐变色生成器',
    description: 'CSS渐变色生成',
    category: ToolCategory.UI,
    path: '/tools/ui/gradient',
    icon: 'Brush',
    tags: ['渐变', 'css', '颜色']
  },
  {
    id: 'image-base64',
    name: '图片转 Base64',
    description: '图片转Base64编码',
    category: ToolCategory.UI,
    path: '/tools/ui/image-base64',
    icon: 'Picture',
    tags: ['图片', 'base64', '转换']
  },
  {
    id: 'image-compress',
    name: '图片压缩',
    description: '图片质量和尺寸压缩',
    category: ToolCategory.UI,
    path: '/tools/ui/image-compress',
    icon: 'Picture',
    tags: ['图片', '压缩', '优化']
  },
  {
    id: 'svg-to-png',
    name: 'SVG 转 PNG',
    description: 'SVG格式转PNG',
    category: ToolCategory.UI,
    path: '/tools/ui/svg-to-png',
    icon: 'Picture',
    tags: ['svg', 'png', '转换']
  },
  {
    id: 'icon-extract',
    name: '图标提取',
    description: '从SVG/PNG提取图标',
    category: ToolCategory.UI,
    path: '/tools/ui/icon-extract',
    icon: 'Picture',
    tags: ['图标', '提取', 'svg']
  },
  {
    id: 'responsive-calc',
    name: '响应式布局计算器',
    description: 'px↔rem/vw单位转换',
    category: ToolCategory.UI,
    path: '/tools/ui/responsive',
    icon: 'Monitor',
    tags: ['响应式', 'px', 'rem', 'vw']
  },

  // 产品/文档类（1个）
  {
    id: 'markdown-html',
    name: 'Markdown ↔ HTML 转换',
    description: 'Markdown与HTML互转',
    category: ToolCategory.DOCUMENT,
    path: '/tools/document/markdown',
    icon: 'Document',
    tags: ['markdown', 'html', '转换']
  },

  // 开发调试类（9个）
  {
    id: 'http-client',
    name: 'HTTP 请求模拟器',
    description: 'HTTP请求测试工具',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/http',
    icon: 'Connection',
    tags: ['http', '请求', '测试']
  },
  {
    id: 'websocket',
    name: 'WebSocket 测试工具',
    description: 'WebSocket连接测试',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/websocket',
    icon: 'Connection',
    tags: ['websocket', '测试', '连接']
  },
  {
    id: 'cron',
    name: 'Cron 表达式解析器',
    description: 'Cron表达式解析和生成',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/cron',
    icon: 'Timer',
    tags: ['cron', '定时', '表达式']
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期互转',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/timestamp',
    icon: 'Timer',
    tags: ['时间戳', '日期', '转换']
  },
  {
    id: 'timezone',
    name: '时区时间查询',
    description: '世界时区时间查询',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/timezone',
    icon: 'Timer',
    tags: ['时区', '时间', '查询']
  },
  {
    id: 'diff-tool',
    name: 'Diff 工具',
    description: '文件和字符串对比',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/diff',
    icon: 'DocumentCopy',
    tags: ['diff', '对比', '文件']
  },
  {
    id: 'code-format',
    name: 'HTML/JS/CSS 压缩格式化',
    description: '前端代码格式化压缩',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/code-format',
    icon: 'Document',
    tags: ['格式化', 'html', 'css', 'js']
  },
  {
    id: 'xml-format',
    name: 'XML 格式化/压缩',
    description: 'XML格式化和压缩',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/xml',
    icon: 'Document',
    tags: ['xml', '格式化', '压缩']
  },
  {
    id: 'sql-format',
    name: 'SQL 格式化/美化',
    description: 'SQL语句格式化',
    category: ToolCategory.DEBUG,
    path: '/tools/debug/sql',
    icon: 'Document',
    tags: ['sql', '格式化', '美化']
  }
]

// 分类配置
export const categoryConfig = {
  [ToolCategory.ENCODING]: {
    name: '编码/加密/解密',
    icon: 'Key',
    color: '#409eff'
  },
  [ToolCategory.JSON]: {
    name: 'JSON & 数据处理',
    icon: 'Document',
    color: '#67c23a'
  },
  [ToolCategory.TEXT]: {
    name: '文本处理',
    icon: 'EditPen',
    color: '#e6a23c'
  },
  [ToolCategory.UI]: {
    name: 'UI / 设计辅助',
    icon: 'Brush',
    color: '#f56c6c'
  },
  [ToolCategory.DOCUMENT]: {
    name: '产品/文档',
    icon: 'Document',
    color: '#909399'
  },
  [ToolCategory.DEBUG]: {
    name: '开发调试',
    icon: 'Setting',
    color: '#606266'
  }
}

// 获取工具列表
export const getToolsByCategory = (category: ToolCategory) => {
  return toolsConfig.filter(tool => tool.category === category)
}

// 获取热门工具
export const getPopularTools = () => {
  return toolsConfig.filter(tool => tool.popular)
}

// 根据ID获取工具信息
export const getToolById = (id: string) => {
  return toolsConfig.find(tool => tool.id === id)
}

// 搜索工具
export const searchTools = (keyword: string) => {
  const lowerKeyword = keyword.toLowerCase()
  return toolsConfig.filter(tool => 
    tool.name.toLowerCase().includes(lowerKeyword) ||
    tool.description.toLowerCase().includes(lowerKeyword) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

// 根据自定义顺序获取工具
export const getToolsByCategoryWithOrder = (category: ToolCategory, customOrder?: string[]) => {
  const categoryTools = getToolsByCategory(category)
  
  if (!customOrder || customOrder.length === 0) {
    return categoryTools
  }
  
  // 按自定义顺序排序
  const orderedTools: ToolInfo[] = []
  const remainingTools = [...categoryTools]
  
  // 首先添加自定义顺序中的工具
  customOrder.forEach(toolId => {
    const toolIndex = remainingTools.findIndex(tool => tool.id === toolId)
    if (toolIndex !== -1) {
      orderedTools.push(remainingTools.splice(toolIndex, 1)[0])
    }
  })
  
  // 然后添加剩余的工具
  orderedTools.push(...remainingTools)
  
  return orderedTools
}
