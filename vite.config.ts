import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Si 3000 está ocupado, Vite usa 3001+; el backend ya permite cualquier localhost.
    port: 3000,
    strictPort: false,
  },
})
