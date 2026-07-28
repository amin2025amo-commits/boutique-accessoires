import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dès que React appelle '/api_zr', Vite fait la passerelle vers ZR Express
      '/api_zr': {
        target: 'https://procolis.com',
        changeOrigin: true,
        secure: false, // Évite les blocages liés aux certificats SSL en local
        rewrite: (path) => path.replace(/^\/api_zr/, '')
      }
    }
  }
})