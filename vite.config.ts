import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative asset URLs so the app works on both:
  // 1) GitHub Pages project path (e.g. /Dayitong/)
  // 2) custom domain root (e.g. https://dayitong.jieyouyuzhou.cn/)
  base: './',
  server: {
    port: 9002,
  },
})
