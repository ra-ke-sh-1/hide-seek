import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Enable polling for WSL2 file watching
    },
    host: true, // Listen on all addresses (allows access from Windows)
  },
})
