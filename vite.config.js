import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/yoga-sync': {
        target: 'https://n8n.curiyawellness.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yoga-sync/, '/webhook/yoga-sync')
      }
    }
  }
})
