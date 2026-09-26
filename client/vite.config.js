import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Chunk BuildingScene chứa three.js (~250 kB gzip) và đã được lazy-load
    chunkSizeWarningLimit: 1000,
  },
})
