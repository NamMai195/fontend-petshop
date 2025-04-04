<template>
  <div class="login-page container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg" style="width: 100%; max-width: 450px;">
      <div class="card-body p-4 p-md-5">
        <h2 class="card-title text-center mb-4">Đăng nhập</h2>
        <form @submit.prevent="handleLogin">
          <div v-if="error" class="alert alert-danger small p-2 mb-3" role="alert">
            {{ error }}
          </div>

          <div class="form-floating mb-3">
            <input
              type="text"
              class="form-control"
              id="username"
              placeholder="Tên đăng nhập"
              v-model="username"
              required
              :disabled="loading" aria-describedby="usernameHelp"
            >
            <label for="username">Tên đăng nhập</label>
            </div>

          <div class="form-floating mb-4">
            <input
              type="password"
              class="form-control"
              id="password"
              placeholder="Mật khẩu"
              v-model="password"
              required
              :disabled="loading" >
            <label for="password">Mật khẩu</label>
          </div>

          <div class="d-grid">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              :disabled="loading" >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-else>Đăng nhập</span>
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <p class="small">Chưa có tài khoản? <router-link :to="{ name: 'register' }">Đăng ký ngay</router-link></p>
           </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'; // Thêm computed
import { useRoute, useRouter } from 'vue-router';
// *** BỎ IMPORT KHÔNG CẦN THIẾT ***
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// *** IMPORT AUTH STORE ***
import { useAuthStore } from '@/stores/authStore'; // Đảm bảo đường dẫn đúng

const router = useRouter();
const route = useRoute();
// *** KHỞI TẠO AUTH STORE ***
const authStore = useAuthStore();

const username = ref('');
const password = ref('');

// *** SỬ DỤNG STATE TỪ STORE ***
// Lấy trạng thái loading và error từ store qua computed properties
const loading = computed(() => authStore.status === 'loading');
const error = computed(() => authStore.error); // error message sẽ được quản lý bởi store

// *** BỎ API CLIENT CỤC BỘ (STORE SẼ GỌI API) ***
// const apiClient = axios.create({...});

// *** SỬA HÀM LOGIN ĐỂ GỌI ACTION CỦA STORE ***
const handleLogin = async () => {
  // Không cần set loading/error ở đây nữa, store action sẽ làm

  // Gọi action login từ store
  const success = await authStore.login({
    username: username.value,
    password: password.value,
  });

  if (success) {
    // Đăng nhập thành công (store đã lưu token và user info)
    console.log('[LoginPage] Login action successful.');
    // Thực hiện điều hướng sau khi đăng nhập thành công
    try {
        // Lấy vai trò từ store (đã được cập nhật sau khi login thành công)
        const isAdmin = authStore.isAdmin; // Sử dụng getter từ store

        if (isAdmin) {
            console.log('[LoginPage] Redirecting to admin dashboard...');
            await router.push({ name: 'admin-dashboard' });
        } else {
            const targetPath = route.query.redirect || '/'; // Lấy redirect path từ URL hoặc về trang chủ
            console.log(`[LoginPage] Redirecting to: ${targetPath}`);
            await router.push(targetPath);
        }
    } catch (navError) {
       console.error("[LoginPage] Lỗi điều hướng sau khi đăng nhập:", navError);
       // Hiển thị lỗi nếu không điều hướng được (mặc dù đăng nhập thành công)
       // authStore.error = "Đăng nhập OK nhưng không thể chuyển trang."; // Có thể cập nhật lỗi vào store
    }
  } else {
     // Đăng nhập thất bại
     // Không cần làm gì thêm ở đây vì `error` computed đã tự động cập nhật
     // từ `authStore.error` được set trong action login thất bại.
     console.log('[LoginPage] Login action failed.');
  }
};
</script>

<style scoped>
/* Style giữ nguyên */
.login-page {
  background-color: #f8f9fa; /* Thêm màu nền nhẹ nhàng */
}
</style>