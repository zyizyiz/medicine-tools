import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
export default defineConfig({
  plugins: [vue()],
  resolve:{
    // 导入以下文件可以不用后缀名
    extensions:['.vue','.ts'],
    // 配置路径别名
    alias:{
      "@":path.resolve(__dirname,"src")
    }
  },
})