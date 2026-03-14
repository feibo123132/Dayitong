import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键修复：将 base 改为 '/'，确保在二级域名根线下能正确找到静态资源
  base: '/', 
  server: {
    port: 9002,
  },
})