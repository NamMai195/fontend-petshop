<template>
  <div class="d-flex align-center justify-center" style="height: 100vh;">
    <VProgressCircular
      indeterminate
      color="primary"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

onMounted(async () => {
  try {
    // Lấy code từ URL
    const code = route.query.code

    if (!code) {
      window.opener.postMessage({
        type: 'GOOGLE_LOGIN_ERROR',
        error: 'No authorization code received'
      }, window.location.origin)
      return
    }

    // Gửi code về backend để xác thực
    const response = await axios.post('/api/v1/auth/google/callback', { code })

    // Gửi token về cho window opener
    window.opener.postMessage({
      type: 'GOOGLE_LOGIN_SUCCESS',
      token: response.data.token
    }, window.location.origin)

  } catch (error) {
    console.error('Google callback error:', error)
    window.opener.postMessage({
      type: 'GOOGLE_LOGIN_ERROR',
      error: error.response?.data?.message || 'Authentication failed'
    }, window.location.origin)
  }
})
</script> 