// 工具分类枚举
export enum ToolCategory {
  ENCODING = 'encoding',
  JSON = 'json',
  TEXT = 'text',
  UI = 'ui',
  DOCUMENT = 'document',
  DEBUG = 'debug'
}

// 工具信息接口
export interface ToolInfo {
  id: string
  name: string
  description: string
  category: ToolCategory
  path: string
  icon: string
  tags: string[]
  popular?: boolean
}

// 工具组件基础接口
export interface ToolComponentProps {
  title: string
  description?: string
  showHistory?: boolean
  showExport?: boolean
}

// 工具操作接口
export interface ToolActions {
  process: (input: any) => Promise<any>
  clear: () => void
  export?: (data: any, format: string) => void
  import?: (file: File) => Promise<any>
}

// 工具历史记录
export interface ToolHistory {
  toolId: string
  timestamp: number
  input: any
  output: any
}

// 应用状态接口
export interface AppState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  recentTools: string[]
  favorites: string[]
  history: ToolHistory[]
}

// 颜色相关类型
export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

// HTTP 请求配置
export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
}

// HTTP 响应数据
export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  config: RequestConfig
  duration: number
}

// 文本统计信息
export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  paragraphs: number
}

// 差异对比结果
export interface DiffResult {
  type: 'added' | 'removed' | 'unchanged'
  value: string
  lineNumber?: number
}

// 时区信息
export interface TimezoneInfo {
  name: string
  offset: string
  abbreviation: string
  isDST: boolean
}

// 文件处理结果
export interface FileProcessResult {
  success: boolean
  data?: any
  error?: string
  filename?: string
  size?: number
  type?: string
}
