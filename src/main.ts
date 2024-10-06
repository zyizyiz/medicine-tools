import { createApp } from 'vue'
// Element-plus组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 路由配置
import router from './router'
// pinia
import App from './App.vue'
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')