import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cấu hình Vite cho môi trường phát triển (npm run dev)
// Khi chạy Docker, Nginx sẽ xử lý proxy thay cho cấu hình này
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy: Chuyển tiếp request /api sang Backend khi chạy dev
    // Giúp tránh lỗi CORS trong quá trình phát triển
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      }
    }
  }
})
