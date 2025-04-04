<script setup>
// Import các thành phần cần thiết từ Vue và Vue Router
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// *** IMPORT CÁC STORE TỪ PINIA ***
import { useAuthStore } from '@/stores/authStore'; // Đảm bảo đường dẫn đúng
import { useCartStore } from '@/stores/cartStore'; // Đảm bảo đường dẫn đúng và file cartStore.js đã tồn tại

// Import component con và Icon
import UserActionsMenu from './UserActionsMenu.vue'; // Đảm bảo đường dẫn đúng
import { Icon } from '@iconify/vue'; // Đảm bảo đã cài @iconify/vue

const router = useRouter();
// *** KHỞI TẠO CÁC STORE ***
const authStore = useAuthStore();
const cartStore = useCartStore(); // Khởi tạo cartStore để lấy totalQuantity

// --- Logic tìm kiếm giữ nguyên ---
const searchQuery = ref('');
const handleSearchSubmit = () => {
  const searchTerm = searchQuery.value.trim();
  if (!searchTerm) return;
  console.log('[Header] Performing search for:', searchTerm);
  router.push({ name: 'shop', query: { search: searchTerm } });
  searchQuery.value = '';

  // Đóng offcanvas search nếu đang mở
  const offcanvasSearchEl = document.getElementById('offcanvasSearch');
  if (offcanvasSearchEl) {
    try {
      // Cần đảm bảo biến 'bootstrap' có sẵn toàn cục hoặc được import nếu dùng cách này
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasSearchEl);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    } catch (e) {
      console.warn("[Header] Bootstrap JS or Offcanvas instance not found:", e);
    }
  }
};

// --- Hàm Logout gọi action từ store ---
const logout = () => {
  authStore.logout(); // Gọi action logout từ authStore
  // authStore.logout() đã xử lý việc xóa token và state, bao gồm cả cart state thông qua clearCartLocally()
  console.log('[Header] Logout action dispatched.');
  // Điều hướng về trang login
  router.push({ name: 'login' }).catch(err => {
    console.error("[Header] Navigation error during logout:", err);
    // Fallback nếu router push lỗi
    window.location.href = '/login';
  });
};

// --- Các logic cũ (apiClient, isLoggedIn, userDisplayIdentifier, cartCount, fetchCartCount, onMounted, watch) đã được loại bỏ ---
// Việc fetch cart và kiểm tra auth sẽ được xử lý bởi store và App.vue

</script>

<template>
  <header>
    <div class="container py-2">
      <div class="row py-4 pb-0 pb-sm-4 align-items-center ">
        <div class="col-sm-4 col-lg-3 text-center text-sm-start">
          <div class="main-logo">
            <router-link to="/">
              <img src="/src/assets/images/logo.png" alt="logo" class="img-fluid">
            </router-link>
          </div>
        </div>

        <div class="col-sm-6 offset-sm-2 offset-md-0 col-lg-5 d-none d-lg-block">
          <div class="search-bar border rounded-2 px-3 border-dark-subtle">
            <form id="search-form" class="text-center d-flex align-items-center" @submit.prevent="handleSearchSubmit">
              <input type="text" class="form-control border-0 bg-transparent" placeholder="Search..." v-model="searchQuery" />
              <button type="submit" aria-label="Search" class="btn border-0 bg-transparent p-0">
                 <Icon icon="tabler:search" class="fs-4 text-secondary" />
              </button>
            </form>
          </div>
        </div>

        <div class="col-sm-8 col-lg-4 d-flex justify-content-end gap-5 align-items-center mt-4 mt-sm-0 justify-content-center justify-content-sm-end">
          <div class="support-box text-end d-none d-xl-block">
            <span class="fs-6 secondary-font text-muted">Phone</span>
            <h5 class="mb-0">+980-34984089</h5>
          </div>
          <div class="support-box text-end d-none d-xl-block">
            <span class="fs-6 secondary-font text-muted">Email</span>
            <h5 class="mb-0">waggy@gmail.com</h5>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid"><hr class="m-0"></div>

    <div class="container">
      <nav class="main-menu d-flex navbar navbar-expand-lg ">

        <div class="d-flex d-lg-none align-items-center mt-3">
           <ul class="d-flex justify-content-end list-unstyled m-0 align-items-center">
               <UserActionsMenu
                 :is-logged-in="authStore.isLoggedIn"
                 :user-display-identifier="authStore.userDisplayIdentifier"
                 :cart-count="cartStore.totalQuantity"
                 @logout-requested="logout"
               />
               <li class="d-lg-none">
                    <a href="#" class="mx-3 header-icon-link" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSearch" aria-controls="offcanvasSearch" aria-label="Tìm kiếm">
                        <Icon icon="tabler:search" class="fs-4" />
                    </a>
                </li>
           </ul>
        </div>

        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div class="offcanvas-header justify-content-center">
                 <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body justify-content-between">
              <ul class="navbar-nav menu-list list-unstyled d-flex flex-column flex-lg-row gap-md-3 mb-0">
                 <li class="nav-item"><router-link to="/" class="nav-link" active-class="active">Home</router-link></li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" id="pagesDropdown" data-bs-toggle="dropdown" aria-expanded="false">Pages</a>
                  <ul class="dropdown-menu" aria-labelledby="pagesDropdown">
                    <li><router-link to="/about" class="dropdown-item" active-class="active">About Us</router-link></li>
                    <li><router-link to="/shop" class="dropdown-item" active-class="active">Shop</router-link></li>
                    <li><router-link :to="{ name: 'cart' }" class="dropdown-item" active-class="active">Cart</router-link></li>
                    <li><router-link :to="{ name: 'wishlist' }" class="dropdown-item" active-class="active">Wishlist</router-link></li>
                    <li><router-link :to="{ name: 'checkout' }" class="dropdown-item" active-class="active">Checkout</router-link></li>
                    <li><router-link :to="{ name: 'blog' }" class="dropdown-item" active-class="active">Blog</router-link></li>
                    <li><router-link :to="{ name: 'contact' }" class="dropdown-item" active-class="active">Contact</router-link></li>
                    <li><router-link :to="{ name: 'faq' }" class="dropdown-item" active-class="active">FAQs</router-link></li>
                  </ul>
                </li>
                 <li class="nav-item"><router-link to="/shop" class="nav-link" active-class="active">Shop</router-link></li>
                 <li class="nav-item"><router-link to="/blog" class="nav-link" active-class="active">Blog</router-link></li>
                 <li class="nav-item"><router-link to="/contact" class="nav-link" active-class="active">Contact</router-link></li>
              </ul>

              <div class="d-none d-lg-flex align-items-center">
                 <ul class="d-flex justify-content-end list-unstyled m-0 align-items-center">
                    <UserActionsMenu
                       :is-logged-in="authStore.isLoggedIn"
                       :user-display-identifier="authStore.userDisplayIdentifier"
                       :cart-count="cartStore.totalQuantity"
                       @logout-requested="logout"
                     />
                 </ul>
              </div>
            </div>
        </div>
      </nav>

      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasSearch" aria-labelledby="offcanvasSearchLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasSearchLabel">Tìm kiếm</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="search-bar border rounded-2 px-3 border-dark-subtle">
             <form id="search-form-offcanvas" class="text-center d-flex align-items-center" @submit.prevent="handleSearchSubmit">
              <input type="text" class="form-control border-0 bg-transparent" placeholder="Search..." v-model="searchQuery" />
              <button type="submit" aria-label="Search" class="btn border-0 bg-transparent p-0">
                 <Icon icon="tabler:search" class="fs-4 text-secondary" />
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  </header>
</template>

<style scoped>
/* Bên trong thẻ <style> của TheHeader.vue */

header {
  position: sticky;
  top: 0;
  z-index: 1020;
  background-color: #ffffff; /* <-- Nhớ thay bằng màu nền đúng của header */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */ /* Bật dòng này nếu muốn có bóng đổ */
}
</style>