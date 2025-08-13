/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'crypto-js'
declare module 'js-yaml'
declare module 'xml2js'
declare module 'papaparse'
declare module 'jsonwebtoken'
declare module 'diff'
declare module 'highlight.js'
declare module 'marked'
declare module 'cron-parser'
declare module 'sql-formatter'
declare module 'ajv'
declare module 'tinycolor2'
declare module 'file-saver'
