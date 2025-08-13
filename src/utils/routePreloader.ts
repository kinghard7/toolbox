/**
 * 路由预加载工具
 * 用于预加载热门工具的路由组件，减少首次点击时的加载时间
 */

// 热门工具路径，这些会被预加载
const POPULAR_TOOLS = [
  '/tools/json/format',
  '/tools/encoding/base64',
  '/tools/encoding/url',
  '/tools/text/diff',
  '/tools/ui/color-convert',
  '/tools/debug/timestamp',
  '/tools/encoding/md5',
  '/tools/json/to-csv'
]

// 预加载函数映射
const preloadMap = new Map<string, () => Promise<any>>([
  ['/tools/json/format', () => import('@/views/tools/json/JSONFormat.vue')],
  ['/tools/encoding/base64', () => import('@/views/tools/encoding/Base64.vue')],
  ['/tools/encoding/url', () => import('@/views/tools/encoding/URLEncode.vue')],
  ['/tools/text/diff', () => import('@/views/tools/text/TextDiff.vue')],
  ['/tools/ui/color-convert', () => import('@/views/tools/ui/ColorConvert.vue')],
  ['/tools/debug/timestamp', () => import('@/views/tools/debug/Timestamp.vue')],
  ['/tools/encoding/md5', () => import('@/views/tools/encoding/MD5.vue')],
  ['/tools/json/to-csv', () => import('@/views/tools/json/JSONToCSV.vue')]
])

// 已预加载的组件缓存
const preloadedCache = new Set<string>()

/**
 * 预加载指定路径的组件
 */
export async function preloadRoute(path: string): Promise<void> {
  if (preloadedCache.has(path)) {
    return // 已经预加载过
  }

  const preloader = preloadMap.get(path)
  if (preloader) {
    try {
      await preloader()
      preloadedCache.add(path)
      console.log(`✅ Preloaded route: ${path}`)
    } catch (error) {
      console.warn(`❌ Failed to preload route: ${path}`, error)
    }
  }
}

/**
 * 批量预加载热门工具
 */
export async function preloadPopularTools(): Promise<void> {
  console.log('🚀 Starting to preload popular tools...')
  
  // 使用 requestIdleCallback 在空闲时间预加载
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      POPULAR_TOOLS.forEach(path => {
        preloadRoute(path)
      })
    })
  } else {
    // 降级方案：延迟执行
    setTimeout(() => {
      POPULAR_TOOLS.forEach(path => {
        preloadRoute(path)
      })
    }, 1000)
  }
}

/**
 * 智能预加载：基于用户行为预加载可能使用的工具
 */
export function preloadByCategory(category: string): void {
  const categoryRoutes = new Map<string, string[]>([
    ['encoding', [
      '/tools/encoding/base64',
      '/tools/encoding/url',
      '/tools/encoding/md5',
      '/tools/encoding/sha'
    ]],
    ['json', [
      '/tools/json/format',
      '/tools/json/to-csv',
      '/tools/json/yaml',
      '/tools/json/diff'
    ]],
    ['text', [
      '/tools/text/diff',
      '/tools/text/stats',
      '/tools/text/replace'
    ]],
    ['ui', [
      '/tools/ui/color-convert',
      '/tools/ui/color-picker',
      '/tools/ui/image-base64'
    ]]
  ])

  const routes = categoryRoutes.get(category)
  if (routes) {
    routes.forEach(path => {
      if (preloadMap.has(path)) {
        preloadRoute(path)
      }
    })
  }
}

/**
 * 检查路由是否已预加载
 */
export function isRoutePreloaded(path: string): boolean {
  return preloadedCache.has(path)
}
