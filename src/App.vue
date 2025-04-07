<template>
  <div>
    <template v-if="!isAdminRoute">
      <Preloader />
      <OffcanvasCart />
      <OffcanvasSearch />
      <TheHeader />
      <main>
        <router-view />
      </main>
      <TheFooter />
    </template>

    <template v-else>
      <router-view /> 
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
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import Preloader from '@/components/common/Preloader.vue';
import OffcanvasCart from '@/components/common/OffcanvasCart.vue';
import OffcanvasSearch from '@/components/common/OffcanvasSearch.vue';

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
onMounted(async () => {
  // Kiểm tra trạng thái đăng nhập khi tải trang
  await authStore.checkAuth();
});

</script>

<style>
/* Có thể thêm global styles ở đây nếu cần */
</style>