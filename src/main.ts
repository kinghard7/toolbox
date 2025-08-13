import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAppStore } from './stores/app'
import { preloadPopularTools } from './utils/routePreloader'

// Element Plus
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 自定义样式
import './styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化store
const appStore = useAppStore()
appStore.initializeStore()

app.mount('#app')

// 应用挂载后启动预加载
preloadPopularTools()