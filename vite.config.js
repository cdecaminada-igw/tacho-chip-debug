import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  plugins: [vue()],
  server: {
    proxy: {
      '/cards': {
        target: 'http://127.0.0.1:8123',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

