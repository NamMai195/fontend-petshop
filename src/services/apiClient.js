// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
         'Content-Type': 'application/json',
         // Có thể thêm các header mặc định khác ở đây
    }
});

// Interceptor để tự động thêm Authorization header vào mỗi request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken'); // Lấy token từ localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  // Xử lý lỗi request interceptor nếu cần
  console.error("API Request Interceptor Error:", error);
  return Promise.reject(error);
});

// Interceptor cho response (tùy chọn, ví dụ để xử lý lỗi 401 chung)
// apiClient.interceptors.response.use(
//   response => response, // Trả về response nếu thành công
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Xử lý khi token hết hạn hoặc không hợp lệ
//       console.error("API Response Interceptor: Unauthorized (401).");
//       // Có thể gọi action logout của authStore ở đây
//       // import { useAuthStore } from '@/stores/authStore'; // Import trong hàm nếu cần
//       // const authStore = useAuthStore();
//       // authStore.logout();
//       // Hoặc redirect về login
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error); // Quan trọng: trả về reject để nơi gọi biết là có lỗi
//   }
// );


export default apiClient; // Export instance đã cấu hình