<template>
    <div class="register-page container d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow-lg" style="width: 100%; max-width: 550px;">
        <div class="card-body p-4 p-md-5">
          <h2 class="card-title text-center mb-4">Đăng ký tài khoản</h2>
  
          <!-- Thêm nút đăng nhập bằng Google ở đầu form -->
          <div class="d-grid mb-4">
            <button
              type="button"
              class="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
              @click="goToLogin"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google"
                style="width: 20px; height: 20px;"
              />
              <span>Đăng nhập bằng tài khoản Google</span>
            </button>
          </div>
  
          <!-- Divider -->
          <div class="divider d-flex align-items-center my-4">
            <p class="text-center fw-bold mx-3 mb-0 text-muted">HOẶC</p>
          </div>
  
          <form @submit.prevent="handleRegister">
            <div v-if="error" class="alert alert-danger small p-2 mb-3" role="alert">
              {{ error }}
            </div>
            <div v-if="successMessage" class="alert alert-success small p-2 mb-3" role="alert">
              {{ successMessage }} Vui lòng kiểm tra email để xác thực và đặt mật khẩu.
              <router-link :to="{ name: 'login' }" class="alert-link">Đi đến trang đăng nhập</router-link>.
            </div>
  
            <div class="row g-3 mb-3">
              <div class="col-md-6 form-floating">
                <input type="text" class="form-control" id="firstName" placeholder="Tên" v-model.trim="formData.firstName" required :disabled="loading || !!successMessage">
                <label for="firstName">Tên *</label>
              </div>
              <div class="col-md-6 form-floating">
                <input type="text" class="form-control" id="lastName" placeholder="Họ" v-model.trim="formData.lastName" required :disabled="loading || !!successMessage">
                <label for="lastName">Họ *</label>
              </div>
            </div>
  
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="username" placeholder="Tên đăng nhập" v-model.trim="formData.username" required :disabled="loading || !!successMessage">
              <label for="username">Tên đăng nhập *</label>
              <div v-if="errors.username" class="invalid-feedback d-block">{{ errors.username }}</div>
            </div>
  
            <div class="form-floating mb-3">
              <input type="email" class="form-control" id="email" placeholder="Địa chỉ Email" v-model.trim="formData.email" required :disabled="loading || !!successMessage">
              <label for="email">Địa chỉ Email *</label>
              <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
            </div>
  
            <div class="form-floating mb-4">
              <input type="tel" class="form-control" id="phone" placeholder="Số điện thoại" v-model.trim="formData.phone" :disabled="loading || !!successMessage">
              <label for="phone">Số điện thoại (Tùy chọn)</label>
              <div v-if="errors.phone" class="invalid-feedback d-block">{{ errors.phone }}</div>
            </div>
  
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || !!successMessage">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span v-else>Đăng ký</span>
              </button>
            </div>
          </form>
  
          <div class="text-center mt-4">
            <p class="small">Đã có tài khoản? <router-link :to="{ name: 'login' }">Đăng nhập ngay</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import { useAuthStore } from '@/stores/authStore';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  // --- State ---
  const formData = reactive({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    gender: null,
    birthday: null,
    type: 'USER',
    addresses: []
  });
  
  const loading = ref(false);
  const error = ref(null);
  const errors = reactive({});
  const successMessage = ref(null);
  
  const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Hàm chuyển hướng đến trang đăng nhập
  const goToLogin = () => {
    router.push({ name: 'login' });
  };
  
  const handleRegister = async () => {
    error.value = null;
    successMessage.value = null;
    Object.keys(errors).forEach(key => delete errors[key]);
  
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email) {
      error.value = "Vui lòng điền đầy đủ các trường bắt buộc (*).";
      return;
    }
    if (!isValidEmail(formData.email)) {
      errors.email = "Định dạng email không hợp lệ.";
      return;
    }
  
    // === XỬ LÝ DỮ LIỆU TRƯỚC KHI GỬI ===
    // Tạo một bản sao của formData để gửi đi, tránh thay đổi trực tiếp state
    const payload = { ...formData };
  
    // Xử lý birthday: API cần ISO string, input type="date" trả về 'YYYY-MM-DD'
    if (payload.birthday) {
         // Nếu input chỉ là YYYY-MM-DD, cách đơn giản nhất là gửi như vậy và hy vọng backend chấp nhận
         // Hoặc nếu backend bắt buộc ISO string:
         // payload.birthday = new Date(payload.birthday).toISOString(); // Chuyển thành ISO string
         // Tuy nhiên, nếu không nhập birthday thì payload.birthday là null, không cần chuyển đổi.
    }
  
    // Đảm bảo gender là null nếu không chọn (nếu bạn dùng select input)
    if (payload.gender === null || payload.gender === '') {
        payload.gender = null; // Hoặc loại bỏ nếu API không cho phép null
    }
  
    loading.value = true;
  
    try {
      // Gửi đối tượng payload đã được chuẩn bị
      const response = await apiClient.post('/api/v1/users', payload); // Sử dụng payload
  
      console.log("Đăng ký thành công:", response.data);
      successMessage.value = `Đăng ký thành công tài khoản "${payload.username}"!`; // Dùng payload username
  
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      if (err.response) {
        if (err.response.status === 400) {
          if (typeof err.response.data === 'object' && err.response.data !== null) {
            if (err.response.data.message) {
              error.value = err.response.data.message;
            } else {
              Object.assign(errors, err.response.data);
              error.value = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.";
            }
          } else {
            error.value = err.response.data || "Dữ liệu gửi lên không hợp lệ.";
          }
        } else {
          error.value = `Lỗi ${err.response.status}: Đăng ký thất bại. Vui lòng thử lại.`;
        }
      } else if (err.request) {
        error.value = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
      } else {
        error.value = "Đã xảy ra lỗi không mong muốn khi đăng ký.";
      }
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .register-page { background-color: #f8f9fa; }
  .card { border: none; }
  .invalid-feedback { font-size: 0.875em; }
  .divider:after,
  .divider:before {
    content: "";
    flex: 1;
    height: 1px;
    background: #eee;
  }
  </style>