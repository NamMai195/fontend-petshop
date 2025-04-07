<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
    <div class="text-center">
      <!-- Loading spinner -->
      <div v-if="!error" class="mb-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang xử lý...</span>
        </div>
        <p class="mt-3">Đang xử lý đăng nhập...</p>
      </div>

      <!-- Error alert -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
        <div class="mt-3">
          <button class="btn btn-outline-danger" @click="goToLogin">
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const error = ref(null);

const goToLogin = () => {
  router.push('/login');
};

onMounted(async () => {
  try {
    // Lấy token từ URL (được backend redirect về với token trong query params)
    const token = route.query.token;
    
    if (!token) {
      throw new Error('Không tìm thấy token trong URL');
    }

    // Lưu token vào store
    await authStore.setToken(token);
    
    // Kiểm tra role và điều hướng
    const isAdmin = authStore.isAdmin;
    const redirectPath = route.query.redirect || (isAdmin ? '/admin' : '/');
    
    // Chuyển hướng người dùng
    await router.push(redirectPath);
    
  } catch (err) {
    console.error('Lỗi xử lý callback:', err);
    error.value = err.message || 'Đã có lỗi xảy ra khi xử lý đăng nhập';
  }
});
</script>

<style scoped>
.alert {
  max-width: 400px;
  margin: 0 auto;
}
</style> 