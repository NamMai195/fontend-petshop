<template>
  <div>
    <Preloader />
    <OffcanvasCart />
    <OffcanvasSearch />
    <TheHeader />
    <main>
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
// *** THÊM IMPORT onMounted TỪ VUE ***
import { onMounted } from 'vue';
// *** THÊM IMPORT AUTH STORE ***
import { useAuthStore } from '@/stores/authStore'; // Đảm bảo đường dẫn đúng

import TheHeader from '@/components/Layout/TheHeader.vue';
import TheFooter from '@/components/Layout/TheFooter.vue';
import Preloader from '@/components/UI/Preloader.vue';
import OffcanvasCart from '@/components/UI/OffcanvasCart.vue';
import OffcanvasSearch from '@/components/UI/OffcanvasSearch.vue';

// *** KHỞI TẠO AUTH STORE ***
const authStore = useAuthStore();

// *** GỌI checkAuthStatus KHI APP MOUNT ***
onMounted(() => {
  console.log('[App.vue] Mounted. Checking auth status...');
  authStore.checkAuthStatus();
});

</script>

<style>
/* Có thể thêm global styles ở đây nếu cần */
</style>