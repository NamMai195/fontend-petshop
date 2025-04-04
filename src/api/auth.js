// src/api/auth.js
import api from './axiosInstance';

// Đăng nhập (Lấy Access Token và Refresh Token)
// POST /auth/access-token
export const login = async (signInRequest) => {
  // signInRequest: { username, password }
  try {
    const response = await api.post('/auth/access-token', signInRequest);
    return response.data; // Trả về TokenResponse { accessToken, refreshToken }
  } catch (error) {
    console.error('API Error - Login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng ký người dùng mới
// POST /api/v1/users
export const register = async (userCreationRequest) => {
  // userCreationRequest: { firstName, lastName, email, password... }
  try {
    const response = await api.post('/api/v1/users', userCreationRequest);
    return response.data; // Trả về UserResponse
  } catch (error) {
    console.error('API Error - Registration failed:', error.response?.data || error.message);
    throw error;
  }
};

// Làm mới Access Token bằng Refresh Token
// POST /auth/refresh-token
export const refreshToken = async (refreshTokenString) => {
   try {
     // Gửi refresh token dạng string trong body
     const response = await api.post('/auth/refresh-token', refreshTokenString, {
       headers: { 'Content-Type': 'application/json' } // Đảm bảo đúng content type
     });
     return response.data; // Trả về TokenResponse { accessToken, refreshToken }
   } catch (error) {
     console.error('API Error - Token refresh failed:', error.response?.data || error.message);
     throw error;
   }
};

// Thêm các hàm API khác nếu cần: fetchUserProfile, logoutAPI...
// export const fetchUserProfile = async () => { ... }
// export const logoutAPI = async () => { ... }