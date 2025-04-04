<template>
    <div class="container py-4 py-lg-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8">
          <button @click="goBack" class="btn btn-link mb-3 ps-0">
            <iconify-icon icon="mdi:arrow-left" class="me-1"></iconify-icon>
            Quay lại Thông tin tài khoản
          </button>

          <div class="card shadow-sm">
            <div class="card-header bg-light py-3">
              <h1 class="mb-0 h4">Đổi mật khẩu</h1>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="changePassword">
                <div v-if="authError" class="alert alert-danger small p-2 mb-3">{{ authError }}</div>
                <div v-if="passwordSuccess" class="alert alert-success small p-2 mb-3">{{ passwordSuccess }}</div>
                <div v-if="passwordError" class="alert alert-danger small p-2 mb-3">{{ passwordError }}</div>

                <div class="form-floating mb-3">
                  <input
                    type="password"
                    class="form-control"
                    id="currentPassword"
                    placeholder="Mật khẩu hiện tại"
                    v-model="passwordData.currentPassword"
                    required
                    :disabled="passwordLoading || !!authError">
                  <label for="currentPassword">Mật khẩu hiện tại</label>
                </div>
                <div class="form-floating mb-3">
                  <input
                    type="password"
                    class="form-control"
                    id="newPassword"
                    placeholder="Mật khẩu mới"
                    v-model="passwordData.password"
                    required
                    :disabled="passwordLoading || !!authError">
                  <label for="newPassword">Mật khẩu mới</label>
                   <small class="form-text text-muted">Ít nhất 6 ký tự.</small>
                </div>
                <div class="form-floating mb-3">
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    placeholder="Xác nhận mật khẩu mới"
                    v-model="passwordData.confirmPassword"
                    required
                    :disabled="passwordLoading || !!authError">
                  <label for="confirmPassword">Xác nhận mật khẩu mới</label>
                </div>
                <button type="submit" class="btn btn-danger" :disabled="passwordLoading || !!authError">
                  <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <iconify-icon v-else icon="mdi:lock-reset" class="me-1"></iconify-icon>
                  Xác nhận đổi mật khẩu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

const passwordData = reactive({
    currentPassword: '',
    password: '',
    confirmPassword: ''
});
const passwordLoading = ref(false);
const passwordError = ref(null);
const passwordSuccess = ref(null);
const authError = ref(null);

const toast = useToast();
const router = useRouter();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
let currentUserId = null;

const getAuthApiClient = () => {
    const token = localStorage.getItem('accessToken');
    authError.value = null;
    if (!token) {
      authError.value = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
      return null;
    }
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        authError.value = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      }
       currentUserId = decoded.userId || decoded.sub;
        if (!currentUserId) {
             authError.value = "Thông tin định danh người dùng không hợp lệ. Không thể đổi mật khẩu.";
              return null;
        }
    } catch (e) {
       authError.value = "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
       localStorage.removeItem('accessToken');
       localStorage.removeItem('refreshToken');
       return null;
    }

    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
};

const changePassword = async () => {
    const apiClient = getAuthApiClient();
    if (!apiClient || !currentUserId) {
        passwordError.value = authError.value || "Lỗi xác thực. Không thể đổi mật khẩu.";
        passwordSuccess.value = null;
        return;
    }

    passwordError.value = null;
    passwordSuccess.value = null;

    if (!passwordData.currentPassword) {
        passwordError.value = "Vui lòng nhập mật khẩu hiện tại.";
        return;
    }

    if (!passwordData.password || !passwordData.confirmPassword) {
        passwordError.value = "Vui lòng nhập cả mật khẩu mới và xác nhận mật khẩu.";
        return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      passwordError.value = "Mật khẩu xác nhận không khớp.";
      return;
    }
    if (passwordData.password.length < 6) {
      passwordError.value = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      return;
    }
    if (passwordData.password === passwordData.currentPassword) {
        passwordError.value = "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
        return;
    }

    passwordLoading.value = true;

    const passwordRequestData = {
        id: currentUserId,
        currentPassword: passwordData.currentPassword,
        password: passwordData.password,
        confirmPassword: passwordData.confirmPassword
    };

    try {
      await apiClient.put(`/api/v1/users/${currentUserId}/password`, passwordRequestData);
      passwordSuccess.value = "Đổi mật khẩu thành công!";
      toast.success("Đổi mật khẩu thành công!");

      passwordData.currentPassword = '';
      passwordData.password = '';
      passwordData.confirmPassword = '';

    } catch (err) {
      passwordSuccess.value = null;
      if (err.response) {
         if (err.response.status === 400 && err.response.data?.message?.toLowerCase().includes('incorrect current password')) {
             passwordError.value = "Mật khẩu hiện tại không chính xác.";
         } else {
             passwordError.value = `Lỗi ${err.response.status}: ${err.response.data?.message || 'Không thể đổi mật khẩu.'}`;
         }
         if(err.response.data?.errors) {
             console.error("Password Change Validation Errors:", err.response.data.errors);
         }
      } else if (err.request) {
          passwordError.value = "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else {
        passwordError.value = "Lỗi không xác định khi đổi mật khẩu.";
        console.error("Change Password Error:", err);
      }
    } finally {
      passwordLoading.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'account-info' });
};

onMounted(() => {
    getAuthApiClient();
});

</script>

<style scoped>
  .card { margin-top: 1rem; }
  .form-floating > label {
      font-size: 0.9rem;
  }
  .btn-link {
      text-decoration: none;
  }
</style>