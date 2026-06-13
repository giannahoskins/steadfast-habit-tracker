import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api': {
          target: 'http://localhost:8888',
          changeOrigin: true,
      }
    }
  },

  base: '/steadfast-habit-tracker/'
})
