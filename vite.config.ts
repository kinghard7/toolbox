import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core'
      ],
      dts: true
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ],
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'crypto': ['crypto-js'],
          'editor': ['monaco-editor'],
          'parser': ['js-yaml', 'xml2js', 'papaparse'],
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  base: './',
  optimizeDeps: {
    include: [
      'element-plus',
      'crypto-js',
      'js-yaml',
      'xml2js',
      'papaparse',
      'diff',
      'highlight.js',
      'marked',
      'dayjs'
    ]
  },
  server: {
    port: 3000,
    open: true
  }
})
