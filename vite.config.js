// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // Đảm bảo bạn đã import path

export default defineConfig({
  plugins: [vue()],
  resolve: { // <-- Thêm hoặc cập nhật phần này
    alias: {
      // Dòng này định nghĩa '@' sẽ trỏ đến thư mục 'src'
      '@': path.resolve(__dirname, './src'),
      // Hoặc dùng cách này nếu không có __dirname (khuyến nghị cho Vite mới hơn)
      // '@': new URL('./src', import.meta.url).pathname
    }
  },
  // Các cấu hình khác của bạn có thể giữ nguyên...

});