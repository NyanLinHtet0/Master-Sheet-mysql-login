import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Any request that starts with /api will be forwarded to Express
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})