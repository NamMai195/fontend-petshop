// src/api/axiosInstance.js
import axios from 'axios';
// Giả sử bạn có store auth để quản lý token và trạng thái đăng nhập
// Đường dẫn có thể cần điều chỉnh nếu store auth của bạn nằm ở khác
import { useAuthStore } from '@/stores/authStore'; // *** Đảm bảo bạn đã tạo store này ***

const API_BASE_URL = 'http://localhost:8080'; // Base URL từ OpenAPI spec

// Tạo một instance Axios mới với cấu hình
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động thêm token vào header trước mỗi request
api.interceptors.request.use(
  (config) => {
    // Chỉ lấy store khi interceptor chạy, tránh lỗi khi import vòng tròn
    // hoặc lỗi khi store chưa sẵn sàng lúc module được load lần đầu
    const authStore = useAuthStore();
    const token = authStore.accessToken; // Lấy accessToken từ state của authStore

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Xử lý lỗi request
    return Promise.reject(error);
  }
);

// Response Interceptor (Tùy chọn - nâng cao): Xử lý lỗi token hết hạn, refresh token...
api.interceptors.response.use(
  (response) => {
    // Bất kỳ status code nào nằm trong khoảng 2xx đều đi vào đây
    return response;
  },
  async (error) => {
    // Bất kỳ status code nào ngoài khoảng 2xx đều đi vào đây
    const originalRequest = error.config;

    // Xử lý lỗi 401 (Unauthorized) - thường do token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu request này đã thử lại 1 lần
      console.warn('Access token expired or invalid. Attempting to refresh...');
      try {
        const authStore = useAuthStore();
        // Gọi action để refresh token (bạn cần tạo action này trong authStore)
        await authStore.refreshTokenAction(); // Giả định action tên là refreshTokenAction

        // Nếu refresh thành công, cập nhật header cho request gốc và thử lại
        const newToken = authStore.accessToken;
        if (newToken) {
           console.log('Token refreshed successfully. Retrying original request.');
           api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Cập nhật header mặc định (tùy chọn)
           originalRequest.headers['Authorization'] = `Bearer ${newToken}`; // Cập nhật header của request gốc
           return api(originalRequest); // Thực hiện lại request gốc với token mới
        } else {
           console.error('Failed to get new token after refresh.');
           // Nếu không lấy được token mới, logout hoặc xử lý phù hợp
           authStore.logoutAction(); // Gọi action logout
           // Redirect về trang login
           // window.location.href = '/login'; // Hoặc dùng router.push('/login') nếu có router
           return Promise.reject(error); // Từ chối promise gốc
        }

      } catch (refreshError) {
        console.error('Unable to refresh token:', refreshError);
        const authStore = useAuthStore();
        authStore.logoutAction(); // Logout nếu refresh thất bại
         // Redirect về trang login
        // window.location.href = '/login';
        return Promise.reject(refreshError); // Từ chối promise gốc
      }
    }

    // Xử lý các lỗi khác (vd: 403 Forbidden, 404 Not Found, 500 Internal Server Error...)
    console.error('API response error:', error.response?.status, error.response?.data || error.message);

    return Promise.reject(error); // Trả về lỗi để nơi gọi API có thể bắt và xử lý
  }
);

// Export instance đã cấu hình để các file khác có thể import và sử dụng
export default api;