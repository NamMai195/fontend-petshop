<script setup>
// *** THÊM IMPORT NÀY ***
import { Icon } from '@iconify/vue';

defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  userDisplayIdentifier: {
    type: String,
    default: null
  },
  cartCount: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['logout-requested']);

const handleLogout = () => {
  emit('logout-requested');
};
</script>

<template>
    <li class="nav-item dropdown">
      <a href="#" class="mx-3 dropdown-toggle header-icon-link d-flex align-items-center" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Tài khoản người dùng">
        <Icon icon="tabler:user" class="fs-4" />
        <template v-if="isLoggedIn && userDisplayIdentifier">
          <span class="ms-2 user-identifier text-truncate">{{ userDisplayIdentifier }}</span>
        </template>
      </a>
      <ul class="dropdown-menu dropdown-menu-end">
        <template v-if="isLoggedIn">
          <li><router-link :to="{ name: 'account-info' }" class="dropdown-item">Xem tài khoản</router-link></li>
          <li><router-link :to="{ name: 'myOrders' }" class="dropdown-item">Đơn hàng của tôi</router-link></li>
          <li><hr class="dropdown-divider"></li>
          <li><button @click="handleLogout" type="button" class="dropdown-item btn-logout">Đăng xuất</button></li>
        </template>
        <template v-else>
          <li><router-link :to="{ name: 'login' }" class="dropdown-item">Đăng nhập</router-link></li>
          <li><router-link :to="{ name: 'register' }" class="dropdown-item">Đăng ký</router-link></li>
        </template>
      </ul>
    </li>

    <li>
      <router-link :to="{ name: 'wishlist' }" class="mx-3 header-icon-link" aria-label="Danh sách yêu thích">
        <Icon icon="tabler:heart" class="fs-4" />
      </router-link>
    </li>

    <li>
      <a href="#" class="mx-3 header-icon-link position-relative" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart" aria-label="Giỏ hàng">
        <Icon icon="tabler:shopping-cart" class="fs-4" />
        <span v-if="isLoggedIn && cartCount > 0" class="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-circle bg-primary pt-2">
            {{ cartCount }}
            <span class="visually-hidden">mặt hàng trong giỏ</span>
        </span>
      </a>
    </li>
</template>

<style scoped>
.dropdown-item.btn-logout {
    background: none; border: none; padding: var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);
    color: var(--bs-dropdown-link-color); text-align: left; width: 100%; cursor: pointer;
}
.dropdown-item.btn-logout:hover, .dropdown-item.btn-logout:focus {
    color: var(--bs-dropdown-link-hover-color); background-color: var(--bs-dropdown-link-hover-bg); outline: none;
}
.dropdown-menu { margin-top: 0.5rem; box-shadow: var(--bs-box-shadow-sm); }
.dropdown-item.active, .dropdown-item.router-link-exact-active {
    font-weight: bold; background-color: transparent; color: var(--bs-primary) !important;
}
.user-identifier {
    max-width: 100px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    display: inline-block; vertical-align: middle; line-height: 1.2; color: var(--bs-body-color);
    font-size: 0.9em;
}
.header-icon-link {
    color: var(--bs-body-color); transition: color 0.2s ease-in-out; vertical-align: middle;
    text-decoration: none; display: inline-flex; align-items: center;
}
.header-icon-link:hover, .header-icon-link:hover .user-identifier, .header-icon-link:hover svg {
    color: var(--bs-primary);
}


.cart-link-wrapper {
  display: inline-flex;
}

.cart-badge.badge.rounded-circle {
    font-size: 0.65em; line-height: 1; padding: 0.3em 0.4em; min-width: 1.6em; height: 1.6em;
    display: inline-flex; justify-content: center; align-items: center; box-sizing: border-box;
     /* transform: translate(-40%, -40%); */
}
.header-icon-link.dropdown-toggle::after {
    display: none;
}

</style>
