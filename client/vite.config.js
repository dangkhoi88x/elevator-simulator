import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Server chỉ cho phép (CORS) đúng địa chỉ này: cổng bận thì báo lỗi, không tự đổi sang 5174
    strictPort: true,
  },
})
