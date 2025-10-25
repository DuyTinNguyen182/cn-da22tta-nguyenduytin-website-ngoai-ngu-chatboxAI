import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Cấu hình proxy để chuyển tiếp các yêu cầu API đến backend
    proxy: {
      // Bất kỳ yêu cầu nào bắt đầu bằng /api sẽ được chuyển đến target
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        // Xóa /api khỏi đường dẫn trước khi gửi đến backend
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})