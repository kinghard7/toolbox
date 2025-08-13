import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/Home.vue')
        },
        // 编码/加密/解密类工具
        {
          path: '/tools/encoding/base64',
          name: 'Base64',
          component: () => import('@/views/tools/encoding/Base64.vue')
        },
        {
          path: '/tools/encoding/url',
          name: 'URLEncode',
          component: () => import('@/views/tools/encoding/URLEncode.vue')
        },
        {
          path: '/tools/encoding/html-entity',
          name: 'HTMLEntity',
          component: () => import('@/views/tools/encoding/HTMLEntity.vue')
        },
        {
          path: '/tools/encoding/unicode',
          name: 'Unicode',
          component: () => import('@/views/tools/encoding/Unicode.vue')
        },
        {
          path: '/tools/encoding/md5',
          name: 'MD5',
          component: () => import('@/views/tools/encoding/MD5.vue')
        },
        {
          path: '/tools/encoding/sha',
          name: 'SHA',
          component: () => import('@/views/tools/encoding/SHA.vue')
        },
        {
          path: '/tools/encoding/jwt',
          name: 'JWT',
          component: () => import('@/views/tools/encoding/JWT.vue')
        },
        {
          path: '/tools/encoding/aes-des',
          name: 'AESDES',
          component: () => import('@/views/tools/encoding/AESDES.vue')
        },
        
        // JSON & 数据处理类工具
        {
          path: '/tools/json/format',
          name: 'JSONFormat',
          component: () => import('@/views/tools/json/JSONFormat.vue')
        },
        {
          path: '/tools/json/to-csv',
          name: 'JSONToCSV',
          component: () => import('@/views/tools/json/JSONToCSV.vue')
        },
        {
          path: '/tools/json/from-csv',
          name: 'CSVToJSON',
          component: () => import('@/views/tools/json/CSVToJSON.vue')
        },
        {
          path: '/tools/json/yaml',
          name: 'JSONYaml',
          component: () => import('@/views/tools/json/JSONYaml.vue')
        },
        {
          path: '/tools/json/xml',
          name: 'JSONXML',
          component: () => import('@/views/tools/json/JSONXML.vue')
        },
        {
          path: '/tools/json/schema',
          name: 'JSONSchema',
          component: () => import('@/views/tools/json/JSONSchema.vue')
        },
        {
          path: '/tools/json/diff',
          name: 'JSONDiff',
          component: () => import('@/views/tools/json/JSONDiff.vue')
        },
        {
          path: '/tools/json/case-convert',
          name: 'CaseConvert',
          component: () => import('@/views/tools/json/CaseConvert.vue')
        },
        {
          path: '/tools/json/regex',
          name: 'RegexTest',
          component: () => import('@/views/tools/json/RegexTest.vue')
        },
        {
          path: '/tools/json/uuid',
          name: 'UUID',
          component: () => import('@/views/tools/json/UUID.vue')
        },

        // 文本处理类工具
        {
          path: '/tools/text/diff',
          name: 'TextDiff',
          component: () => import('@/views/tools/text/TextDiff.vue')
        },
        {
          path: '/tools/text/deduplicate',
          name: 'TextDeduplicate',
          component: () => import('@/views/tools/text/TextDeduplicate.vue')
        },
        {
          path: '/tools/text/sort',
          name: 'TextSort',
          component: () => import('@/views/tools/text/TextSort.vue')
        },
        {
          path: '/tools/text/stats',
          name: 'TextStats',
          component: () => import('@/views/tools/text/TextStats.vue')
        },
        {
          path: '/tools/text/replace',
          name: 'TextReplace',
          component: () => import('@/views/tools/text/TextReplace.vue')
        },
        {
          path: '/tools/text/clean',
          name: 'TextClean',
          component: () => import('@/views/tools/text/TextClean.vue')
        },
        {
          path: '/tools/text/password',
          name: 'PasswordGen',
          component: () => import('@/views/tools/text/PasswordGen.vue')
        },

        // UI/设计辅助类工具
        {
          path: '/tools/ui/color-convert',
          name: 'ColorConvert',
          component: () => import('@/views/tools/ui/ColorConvert.vue')
        },
        {
          path: '/tools/ui/color-picker',
          name: 'ColorPicker',
          component: () => import('@/views/tools/ui/ColorPicker.vue')
        },
        {
          path: '/tools/ui/gradient',
          name: 'Gradient',
          component: () => import('@/views/tools/ui/Gradient.vue')
        },
        {
          path: '/tools/ui/image-base64',
          name: 'ImageBase64',
          component: () => import('@/views/tools/ui/ImageBase64.vue')
        },
        {
          path: '/tools/ui/image-compress',
          name: 'ImageCompress',
          component: () => import('@/views/tools/ui/ImageCompress.vue')
        },
        {
          path: '/tools/ui/svg-to-png',
          name: 'SVGToPNG',
          component: () => import('@/views/tools/ui/SVGToPNG.vue')
        },
        {
          path: '/tools/ui/icon-extract',
          name: 'IconExtract',
          component: () => import('@/views/tools/ui/IconExtract.vue')
        },
        {
          path: '/tools/ui/responsive',
          name: 'ResponsiveCalc',
          component: () => import('@/views/tools/ui/ResponsiveCalc.vue')
        },

        // 产品/文档类工具
        {
          path: '/tools/document/markdown',
          name: 'MarkdownHTML',
          component: () => import('@/views/tools/document/MarkdownHTML.vue')
        },

        // 开发调试类工具
        {
          path: '/tools/debug/http',
          name: 'HTTPClient',
          component: () => import('@/views/tools/debug/HTTPClient.vue')
        },
        {
          path: '/tools/debug/websocket',
          name: 'WebSocket',
          component: () => import('@/views/tools/debug/WebSocket.vue')
        },
        {
          path: '/tools/debug/cron',
          name: 'Cron',
          component: () => import('@/views/tools/debug/Cron.vue')
        },
        {
          path: '/tools/debug/timestamp',
          name: 'Timestamp',
          component: () => import('@/views/tools/debug/Timestamp.vue')
        },
        {
          path: '/tools/debug/timezone',
          name: 'Timezone',
          component: () => import('@/views/tools/debug/Timezone.vue')
        },
        {
          path: '/tools/debug/diff',
          name: 'DiffTool',
          component: () => import('@/views/tools/debug/DiffTool.vue')
        },
        {
          path: '/tools/debug/code-format',
          name: 'CodeFormat',
          component: () => import('@/views/tools/debug/CodeFormat.vue')
        },
        {
          path: '/tools/debug/xml',
          name: 'XMLFormat',
          component: () => import('@/views/tools/debug/XMLFormat.vue')
        },
        {
          path: '/tools/debug/sql',
          name: 'SQLFormat',
          component: () => import('@/views/tools/debug/SQLFormat.vue')
        }
      ]
    }
  ]
})

// 路由守卫 - 记录工具使用历史
router.afterEach((to) => {
  if (to.path.startsWith('/tools/')) {
    const appStore = useAppStore()
    const toolId = to.path.split('/').pop()
    if (toolId) {
      appStore.addRecentTool(toolId)
    }
  }
})

export default router
