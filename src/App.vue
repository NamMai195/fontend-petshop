<template>
  <div>
    <template v-if="!isAdminRoute">
      <Preloader />
      <OffcanvasCart />
      <OffcanvasSearch />
      <TheHeader />
      <main>
        <router-view /> {/* Các trang user sẽ vào đây */}
      </main>
      <TheFooter />
    </template>

    <template v-else>
      <router-view /> {/* AdminLayout sẽ vào đây */}
    </template>
  </div>
</template>

<script setup>
// *** THÊM IMPORT TỪ VUE VÀ VUE-ROUTER ***
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute

// *** THÊM IMPORT AUTH STORE ***
import { useAuthStore } from '@/stores/authStore'; // Đảm bảo đường dẫn đúng

// Import các component layout như cũ
import TheHeader from '@/components/Layout/TheHeader.vue';
import TheFooter from '@/components/Layout/TheFooter.vue';
import Preloader from '@/components/UI/Preloader.vue';
import OffcanvasCart from '@/components/UI/OffcanvasCart.vue';
import OffcanvasSearch from '@/components/UI/OffcanvasSearch.vue';

// *** KHỞI TẠO AUTH STORE ***
const authStore = useAuthStore();

// *** LẤY ROUTE HIỆN TẠI ***
const route = useRoute();

// *** TẠO COMPUTED ĐỂ KIỂM TRA CÓ PHẢI ADMIN ROUTE KHÔNG ***
const isAdminRoute = computed(() => {
  // Kiểm tra xem có bất kỳ route nào trong chuỗi matched routes (bao gồm cả cha)
  // có path bắt đầu bằng '/admin' hoặc có meta.isAdmin = true (nếu dùng)
  return route.matched.some(record => record.path.startsWith('/admin') || record.meta.isAdminLayout);
  // Hoặc đơn giản hơn nếu chắc chắn mọi route admin đều bắt đầu bằng /admin:
  // return route.path.startsWith('/admin');
});

// *** GỌI checkAuthStatus KHI APP MOUNT ***
onMounted(() => {
  console.log('[App.vue] Mounted. Checking auth status...');
  authStore.checkAuthStatus();
});

</script>

<style>
/* Có thể thêm global styles ở đây nếu cần */
</style>