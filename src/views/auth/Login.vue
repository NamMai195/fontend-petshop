<template>
  <VCard class="auth-card pa-4 pt-7">
    <VCardItem class="justify-center">
      <VCardTitle class="text-2xl font-weight-bold">
        Welcome back! 👋
      </VCardTitle>
      <VCardSubtitle>
        Please sign-in to your account
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VForm @submit.prevent="onSubmit">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="formData.username"
              label="Username"
              type="text"
              :error-messages="errors.username"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="formData.password"
              label="Password"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              :error-messages="errors.password"
            />
          </VCol>

          <VCol cols="12" class="d-flex align-center justify-space-between flex-wrap gap-3">
            <VCheckbox
              v-model="formData.rememberMe"
              label="Remember me"
            />
            <NuxtLink
              class="text-primary ms-2"
              to="/forgot-password"
            >
              Forgot Password?
            </NuxtLink>
          </VCol>

          <VCol cols="12">
            <VBtn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
            >
              Sign in
            </VBtn>
          </VCol>

          <!-- Thêm nút đăng nhập Google -->
          <VCol cols="12">
            <VDivider class="mb-3">
              <span class="text-medium-emphasis">or</span>
            </VDivider>
            <VBtn
              block
              color="error"
              size="large"
              @click="loginWithGoogle"
              :loading="googleLoading"
            >
              <VIcon start icon="mdi-google" />
              Sign in with Google
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const router = useRouter()
const loading = ref(false)
const googleLoading = ref(false)
const isPasswordVisible = ref(false)

const formData = ref({
  username: '',
  password: '',
  rememberMe: false
})

const errors = ref({
  username: '',
  password: ''
})

// Hàm xử lý đăng nhập thông thường
const onSubmit = async () => {
  loading.value = true
  errors.value = { username: '', password: '' }

  try {
    const response = await axios.post('/api/v1/auth/login', {
      username: formData.value.username,
      password: formData.value.password
    })

    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token)
      toast.success('Login successful!')
      router.push('/')
    }
  } catch (error) {
    console.error('Login error:', error)
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error('Login failed. Please try again.')
    }
  } finally {
    loading.value = false
  }
}

// Hàm xử lý đăng nhập bằng Google
const loginWithGoogle = async () => {
  googleLoading.value = true
  try {
    // Tạo URL đăng nhập Google
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}` +
      `&response_type=code` +
      `&scope=email profile` +
      `&access_type=offline`

    // Mở popup đăng nhập Google
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      googleAuthUrl,
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // Lắng nghe message từ popup
    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        const { token } = event.data
        localStorage.setItem('accessToken', token)
        toast.success('Login with Google successful!')
        router.push('/')
        popup.close()
      } else if (event.data.type === 'GOOGLE_LOGIN_ERROR') {
        toast.error(event.data.error || 'Login with Google failed')
        popup.close()
      }
    })
  } catch (error) {
    console.error('Google login error:', error)
    toast.error('Failed to initialize Google login')
  } finally {
    googleLoading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 0 auto;
}
</style> 