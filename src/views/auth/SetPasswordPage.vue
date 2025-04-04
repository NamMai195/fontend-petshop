<template>
    <div class="set-password-page container d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow-lg" style="width: 100%; max-width: 450px;">
        <div class="card-body p-4 p-md-5">
          <h2 class="card-title text-center mb-4">Đặt Mật Khẩu Mới</h2>
  
          <div v-if="verifyingToken" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang kiểm tra token...</span>
            </div>
            <p class="mt-2">Đang kiểm tra tính hợp lệ của token...</p>
          </div>
  
          <div v-else-if="initialError" class="alert alert-danger" role="alert">
            <p class="fw-bold">Lỗi Xác Thực Token:</p>
            <p>{{ initialError }}</p>
            <p class="mb-0">Vui lòng kiểm tra lại link xác thực hoặc
              <router-link :to="{ name: 'register' }" class="alert-link">đăng ký lại</router-link>.
            </p>
          </div>
  
          <form v-else-if="isTokenVerified" @submit.prevent="handleSetPassword">
            <div class="alert alert-info small p-2 mb-3" role="alert">
              Token hợp lệ. Vui lòng nhập mật khẩu mới của bạn.
            </div>
            <div v-if="error" class="alert alert-danger small p-2 mb-3" role="alert">
              {{ error }}
            </div>
            <div v-if="successMessage" class="alert alert-success small p-2 mb-3" role="alert">
              {{ successMessage }} Bạn có thể
              <router-link :to="{ name: 'login' }" class="alert-link">đăng nhập</router-link> ngay bây giờ.
            </div>
  
            <div class="form-floating mb-3">
              <input
                type="password"
                class="form-control"
                id="password"
                placeholder="Mật khẩu mới"
                v-model="password"
                required
                minlength="8"
                :disabled="loading || !!successMessage"
                aria-describedby="passwordHelp"
              >
              <label for="password">Mật khẩu mới</label>
              <div id="passwordHelp" class="form-text">Ít nhất 8 ký tự.</div>
               <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
            </div>
  
            <div class="form-floating mb-4">
              <input
                type="password"
                class="form-control"
                id="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                v-model="confirmPassword"
                required
                :disabled="loading || !!successMessage"
              >
              <label for="confirmPassword">Xác nhận mật khẩu mới</label>
               <div v-if="errors.confirmPassword" class="invalid-feedback d-block">{{ errors.confirmPassword }}</div>
            </div>
  
            <div class="d-grid">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading || !!successMessage"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span v-else>Đặt Mật Khẩu</span>
              </button>
            </div>
          </form>
  
           <div v-else class="alert alert-warning" role="alert">
              Không thể tải form đặt mật khẩu.
           </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router'; // Import useRoute
  import axios from 'axios';
  
  // --- Router ---
  const router = useRouter();
  const route = useRoute(); // Lấy route hiện tại để lấy token
  
  // --- State ---
  const token = ref(route.query.token || null); // Lấy token từ query params
  const password = ref('');
  const confirmPassword = ref('');
  const loading = ref(false); // Loading cho việc submit mật khẩu
  const verifyingToken = ref(false); // Loading cho việc kiểm tra token ban đầu
  const isTokenVerified = ref(false); // Trạng thái token đã được xác thực thành công
  const error = ref(null); // Lỗi chung khi submit mật khẩu
  const errors = reactive({}); // Lỗi chi tiết validation khi submit
  const successMessage = ref(null); // Thông báo thành công khi submit
  const initialError = ref(null); // Lỗi ban đầu nếu token không hợp lệ/thiếu
  
  // --- Axios Client ---
  const apiClient = axios.create({
    baseURL: 'http://localhost:8080', // Thay đổi nếu cần
    headers: { 'Content-Type': 'application/json' }
  });
  
  // --- Methods ---
  
  // Hàm kiểm tra token khi component được mount
  const verifyToken = async () => {
    if (!token.value) {
      initialError.value = "Token xác thực bị thiếu trong đường dẫn.";
      console.error("Token is missing from the route query parameters.");
      return;
    }
  
    verifyingToken.value = true;
    initialError.value = null; // Reset lỗi cũ
  
    try {
      console.log("Verifying token:", token.value);
      // Gọi API GET /api/v1/users/verify?token=<token>
      await apiClient.get('/api/v1/users/verify', {
        params: { token: token.value }
      });
      // Nếu không có lỗi ném ra (status 2xx), token hợp lệ
      isTokenVerified.value = true;
      console.log("Token verified successfully.");
  
    } catch (err) {
      console.error("Lỗi khi xác thực token:", err);
      isTokenVerified.value = false; // Đánh dấu token không hợp lệ
      if (err.response) {
          // Lỗi từ backend (404: token không tìm thấy, 400: token không hợp lệ/hết hạn...)
          initialError.value = err.response.data?.error || err.response.data?.message || "Token không hợp lệ hoặc đã hết hạn.";
          if (err.response.status === 404) {
               initialError.value = "Token không tồn tại hoặc đã được sử dụng.";
          }
      } else if (err.request) {
        initialError.value = "Không thể kết nối đến máy chủ để xác thực token. Vui lòng kiểm tra mạng.";
      } else {
        initialError.value = "Đã xảy ra lỗi không mong muốn khi xác thực token.";
      }
    } finally {
      verifyingToken.value = false;
    }
  };
  
  // Hàm validate form đặt mật khẩu
  const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key]); // Clear previous errors
      let isValid = true;
  
      if (!password.value) {
          errors.password = "Mật khẩu không được để trống.";
          isValid = false;
      } else if (password.value.length < 8) {
           errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
           isValid = false;
      }
  
      if (!confirmPassword.value) {
          errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
          isValid = false;
      } else if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
          errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
          isValid = false;
      }
      return isValid;
  }
  
  // Hàm xử lý submit form đặt mật khẩu
  const handleSetPassword = async () => {
    // Chỉ thực hiện nếu token đã được xác thực thành công
    if (!isTokenVerified.value) {
        error.value = "Không thể đặt mật khẩu do token không hợp lệ.";
        return;
    }
  
    error.value = null;
    successMessage.value = null;
  
    if (!validateForm()) {
        return; // Dừng nếu validation frontend thất bại
    }
  
    loading.value = true;
  
    try {
      const payload = {
        // API của bạn yêu cầu 'emailOrToken', nhưng trong ngữ cảnh này,
        // chúng ta biết đó là token sau khi đã verify.
        // Nếu API *thực sự* cần cả email, bạn sẽ cần lấy email đó từ đâu đó
        // (có thể là từ response của /verify nếu nó trả về) hoặc thay đổi API.
        // Giả sử API /set-initial-password chỉ cần token và password:
        token: token.value,
        password: password.value,
        confirmPassword: confirmPassword.value // Gửi cả confirm password nếu backend cần
      };
      console.log("Submitting set initial password with payload:", payload);
  
      // Gọi API POST /api/v1/users/set-initial-password (Public)
      const response = await apiClient.post('/api/v1/users/set-initial-password', payload);
  
      // --- Xử lý thành công ---
      console.log("Đặt mật khẩu thành công:", response.data);
      successMessage.value = response.data?.message || "Đặt mật khẩu thành công!";
      password.value = '';
      confirmPassword.value = '';
  
      // Optional: Tự động chuyển hướng sau vài giây
      setTimeout(() => {
          router.push({ name: 'login' });
      }, 3000);
  
    } catch (err) {
      console.error("Lỗi khi đặt mật khẩu:", err);
       if (err.response) {
          // Lỗi từ backend khi submit (có thể là password không khớp phía server,
          // hoặc token lại bị kiểm tra và hết hạn đúng lúc đó,...)
          error.value = err.response.data?.error || err.response.data?.message || `Lỗi ${err.response.status}: Không thể đặt mật khẩu.`;
      } else if (err.request) {
        error.value = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
      } else {
        error.value = "Đã xảy ra lỗi không mong muốn.";
      }
    } finally {
      loading.value = false;
    }
  };
  
  // --- Lifecycle Hook ---
  onMounted(() => {
    // Gọi hàm kiểm tra token ngay khi component được tạo
    verifyToken();
  });
  
  </script>
  
  <style scoped>
  .set-password-page {
    background-color: #f8f9fa;
  }
  .card {
    border: none;
  }
  .invalid-feedback {
      font-size: 0.875em;
  }
  .form-text {
      font-size: 0.875em;
  }
  </style>