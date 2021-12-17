import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    proxy:{
      '/live': {
        target: 'http://api.polyv.net/live',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/live/, '')
      },
    },
    
  }
})
