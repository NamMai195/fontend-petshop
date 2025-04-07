<template>
  <div class="login-page container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg" style="width: 100%; max-width: 450px;">
      <div class="card-body p-4 p-md-5">
        <h2 class="card-title text-center mb-4">Đăng nhập</h2>

        <!-- Nút đăng nhập và đăng ký bằng Google -->
        <div class="d-grid gap-3 mb-4">
          <button
            type="button"
            class="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
            @click="handleGoogleLogin"
            :disabled="loading"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google"
              style="width: 20px; height: 20px;"
            />
            <span>Đăng ký đăng nhập bằng Google</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="divider d-flex align-items-center my-4">
          <p class="text-center fw-bold mx-3 mb-0 text-muted">HOẶC</p>
        </div>

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
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const googleLoading = ref(false);

const loading = computed(() => authStore.status === 'loading');
const error = computed(() => authStore.error);

const handleLogin = async () => {
  const success = await authStore.login({
    username: username.value,
    password: password.value,
  });

  if (success) {
    console.log('[LoginPage] Login action successful.');
    try {
      const isAdmin = authStore.isAdmin;

      if (isAdmin) {
        console.log('[LoginPage] Redirecting to admin dashboard...');
        await router.push({ name: 'admin-dashboard' });
      } else {
        const targetPath = route.query.redirect || '/';
        console.log(`[LoginPage] Redirecting to: ${targetPath}`);
        await router.push(targetPath);
      }
    } catch (navError) {
      console.error("[LoginPage] Lỗi điều hướng sau khi đăng nhập:", navError);
    }
  } else {
    console.log('[LoginPage] Login action failed.');
  }
};

// Hàm xử lý đăng nhập Google
const handleGoogleLogin = () => {
  // Điều hướng đến endpoint OAuth2 của backend
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const redirectUri = encodeURIComponent(window.location.origin + '/logincallback');
  
  window.location.href = `${backendUrl}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
};

// Hàm chuyển hướng đến trang đăng ký
const goToRegister = () => {
  router.push({ name: 'register' });
};
</script>

<style scoped>
.login-page {
  background-color: #f8f9fa;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 600;
  color: #333;
}

.form-control {
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #ddd;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
  border-color: #86b7fe;
}

.btn {
  border-radius: 8px;
  padding: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
  transform: translateY(-2px);
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
  transform: translateY(-2px);
}

.btn-primary {
  background-color: rgb(222, 173, 111);
  border: none;
  box-shadow: 0 4px 6px rgb(222, 173, 111)
}

.btn-primary:hover {
  background-color: rgb(222, 173, 111)7;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgb(222, 173, 111)
}

.divider:after,
.divider:before {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}

.alert {
  border-radius: 8px;
  padding: 12px;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
}
</style>