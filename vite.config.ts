import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), imagetools()],
  build: {
    assetsInlineLimit: 1024,
  },
  server: {
    port: 3005,
    strictPort: true,
  },
  preview: {
    port: 3005,
    strictPort: true,
  },
})
