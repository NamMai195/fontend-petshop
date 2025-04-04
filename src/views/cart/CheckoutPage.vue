<template>
  <div class="container py-5">
    <h1 class="mb-4">Thanh toán</h1>

    <div v-if="cartLoading || authProfileLoading" class="text-center my-5 py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"><span class="visually-hidden">Đang tải...</span></div>
        <p class="mt-3 text-muted">Đang tải dữ liệu...</p>
    </div>
    <div v-else-if="cartError || authProfileError || authError" class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Lỗi</h4>
        <p>{{ cartError || authProfileError || authError }}</p>
        <p v-if="!isLoggedIn">Có thể bạn cần <router-link :to="{ name: 'login', query: { redirect: '/checkout' }}">đăng nhập</router-link>.</p>
        <button v-else class="btn btn-sm btn-danger me-2" @click="cartStore.fetchCart()">Tải lại giỏ hàng</button>
        <button v-if="isLoggedIn && !currentUser?.firstName" class="btn btn-sm btn-warning" @click="authStore.fetchUserProfile(authStore.user?.id)">Tải lại thông tin user</button>
    </div>
    <div v-else-if="items.length === 0" class="text-center text-muted my-5 py-5">
        <Icon icon="tabler:shopping-cart-off" class="display-1 text-light mb-3" />
        <h2>Giỏ hàng trống</h2>
        <button class="btn btn-primary mt-3" @click="goToShop"><Icon icon="tabler:arrow-left" class="me-1"/> Tiếp tục mua sắm</button>
    </div>
    <div v-else-if="!isLoggedIn" class="alert alert-warning text-center my-5 py-5">
        <h2>Vui lòng đăng nhập</h2>
        <router-link :to="{ name: 'login', query: { redirect: '/checkout' }}" class="btn btn-primary mt-3">Đăng nhập để thanh toán</router-link>
    </div>

    <div v-else class="row g-4">

      <div class="col-lg-7 order-lg-1">
        <h4 class="mb-3">Thông tin giao hàng</h4>
        <form class="needs-validation" novalidate @submit.prevent="handlePlaceOrder">

          <div class="address-section mb-4">
            <div v-if="userAddresses.length > 0">
              <h5 class="mb-3">Chọn địa chỉ giao hàng:</h5>
              <select class="form-select mb-3" v-model="selectedShippingAddressId" required aria-label="Chọn địa chỉ giao hàng">
                    <option :value="null" disabled>-- Vui lòng chọn địa chỉ --</option>
                    <option v-for="address in userAddresses" :key="address.id" :value="address.id">
                        {{ formatAddress(address) }} ({{ getAddressTypeLabel(address.addressType) }})
                    </option>
              </select>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="goToAddressManagement">
                 <Icon icon="tabler:edit" class="me-1"/> Quản lý địa chỉ
              </button>
            </div>
            <div v-else class="alert alert-info">
              <p class="mb-2">Bạn chưa có địa chỉ giao hàng nào được lưu.</p>
              <p class="mb-0">Vui lòng thêm địa chỉ trong trang tài khoản để tiếp tục.</p>
              <button type="button" class="btn btn-sm btn-primary mt-2" @click="goToAddressManagement">
                <Icon icon="tabler:plus" class="me-1"/> Thêm địa chỉ mới
              </button>
            </div>
            <div v-if="addressError" class="alert alert-danger small p-2 mt-3 mb-0">{{ addressError }}</div>
          </div>

          <hr class="my-4">
          <h4 class="mb-3">Thông tin liên hệ</h4>
           <div class="row g-3">
                <div class="col-sm-6"><label for="firstName" class="form-label">Tên</label><input type="text" class="form-control" id="firstName" v-model="contactInfo.firstName" required></div>
                <div class="col-sm-6"><label for="lastName" class="form-label">Họ</label><input type="text" class="form-control" id="lastName" v-model="contactInfo.lastName" required></div>
                <div class="col-12"><label for="email" class="form-label">Email</label><input type="email" class="form-control" id="email" v-model="contactInfo.email" required></div>
                <div class="col-12"><label for="phone" class="form-label">Số điện thoại</label><input type="tel" class="form-control" id="phone" v-model="contactInfo.phone" required></div>
                <div class="col-12"><label for="notes" class="form-label">Ghi chú <span class="text-muted">(Tùy chọn)</span></label><textarea class="form-control" id="notes" rows="3" v-model="orderNotes"></textarea></div>
           </div>

          <hr class="my-4">
          <h4 class="mb-3">Phương thức thanh toán</h4>
          <div class="my-3">
               <div class="form-check"><input id="cod" name="paymentMethod" type="radio" class="form-check-input" required value="COD" v-model="selectedPaymentMethod"><label class="form-check-label" for="cod">COD</label></div>
               <div class="form-check"><input id="bankTransfer" name="paymentMethod" type="radio" class="form-check-input" required value="BANK_TRANSFER" v-model="selectedPaymentMethod"><label class="form-check-label" for="bankTransfer">Chuyển khoản</label></div>
               <div v-if="!selectedPaymentMethod && !isPlacingOrder" class="text-danger small mt-2">Vui lòng chọn phương thức thanh toán.</div>
          </div>

           <hr class="my-4">
           <div v-if="placeOrderError" class="alert alert-danger small p-2 mb-3">{{ placeOrderError }}</div>
           <button class="w-100 btn btn-primary btn-lg" type="submit" :disabled="isPlacingOrder || !canPlaceOrder">
              <span v-if="isPlacingOrder" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isPlacingOrder ? 'Đang xử lý...' : 'Đặt Hàng' }}
           </button>
        </form>
      </div>

      <div class="col-lg-5 order-lg-2">
         <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Đơn hàng của bạn</span>
            <span class="badge bg-primary rounded-pill">{{ totalQuantity }}</span>
          </h4>
          <ul class="list-group mb-3">
             <li v-for="item in items" :key="item.id" class="list-group-item d-flex justify-content-between lh-sm">
                <div class="d-flex align-items-center overflow-hidden me-2">
                  <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" width="40" height="40" class="me-2 rounded object-fit-cover flex-shrink-0" @error="handleImageError">
                   <img v-else src="/src/assets/images/logo.png" width="40" height="40" class="me-2 rounded object-fit-contain p-1 bg-light flex-shrink-0" alt="N/A">
                  <div>
                    <h6 class="my-0 text-truncate">{{ item.name }}</h6>
                    <small class="text-body-secondary">Số lượng: {{ item.quantity }}</small>
                  </div>
               </div>
                <span class="text-body-secondary text-nowrap">{{ formatItemSubtotal(item) }}</span>
             </li>
             <li class="list-group-item d-flex justify-content-between">
               <span class="fw-bold">Tổng cộng (VND)</span>
               <strong>{{ formattedTotalPrice }}</strong>
             </li>
          </ul>
          </div>
    </div></div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';
import axios from 'axios'; // Import axios

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

// *** TẠO API CLIENT DÙNG CHUNG TRONG SCRIPT SETUP ***
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
});
// Thêm interceptor để tự động gắn token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken'); // Lấy token mới nhất
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));


// --- State & Getters ---
const items = computed(() => cartStore.items);
const cartLoading = computed(() => cartStore.loading);
const cartError = computed(() => cartStore.error);
const totalQuantity = computed(() => cartStore.totalQuantity);
const formattedTotalPrice = computed(() => cartStore.formattedTotalPrice);
const currentUser = computed(() => authStore.user);
const isLoggedIn = computed(() => authStore.isLoggedIn);
const authProfileLoading = computed(() => authStore.profileLoading);
const authProfileError = computed(() => authStore.profileError);
const authError = computed(() => authStore.error);
const userAddresses = computed(() => authStore.user?.addresses || []);

// --- State Form ---
const selectedShippingAddressId = ref(null);
const contactInfo = ref({ firstName: '', lastName: '', email: '', phone: '' });
const selectedPaymentMethod = ref('COD');
const orderNotes = ref('');
const addressError = ref(null);
const placeOrderError = ref(null);
const isPlacingOrder = ref(false);

// --- Computed: Can Place Order ---
const canPlaceOrder = computed(() => {
    const hasAddress = userAddresses.value.length > 0;
    const addressSelected = selectedShippingAddressId.value !== null;
    const contactFilled = !!(contactInfo.value.firstName && contactInfo.value.lastName && contactInfo.value.email && contactInfo.value.phone);
    return hasAddress && addressSelected && contactFilled && !!selectedPaymentMethod.value;
});

// --- Format Functions (ĐÃ BỎ COMMENT) ---
const formatCurrencyVND = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const formatItemSubtotal = (item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') return '';
    return formatCurrencyVND(item.price * item.quantity);
};
const handleImageError = (event) => {
    event.target.src = '/src/assets/images/logo.png'; // Đường dẫn ảnh mặc định
    event.target.style.objectFit = 'contain';
    event.target.style.padding = '5px';
    event.target.classList.add('bg-light');
};
const getAddressTypeLabel = (type) => {
    const typeNum = Number(type);
    if (typeNum === 1) return 'Nhà riêng';
    if (typeNum === 2) return 'Văn phòng';
    return 'Khác';
};
const formatAddress = (addr) => {
    if (!addr || typeof addr !== 'object') return 'Địa chỉ không hợp lệ';
    const parts = [ `${addr.streetNumber || ''} ${addr.street || ''}`.trim(), addr.ward, addr.district, addr.city, addr.country ];
    const formatted = parts.filter(part => part && String(part).trim()).join(', ');
    return formatted || `Địa chỉ ID: ${addr.id || 'N/A'}`;
};

// --- Navigation ---
const goToShop = () => { router.push({ name: 'shop' }); };
const goToAddressManagement = () => { router.push({ name: 'account-info' }); /* Sửa tên route nếu cần */ };

// --- Order Placement ---
const handlePlaceOrder = async () => {
  placeOrderError.value = null; addressError.value = null;
  // Validation
  if (!canPlaceOrder.value) { /* ... validation logic ... */ toast.error(addressError.value || placeOrderError.value || 'Vui lòng kiểm tra lại thông tin.'); return; }

  isPlacingOrder.value = true; console.log('Placing order...');
  const orderData = {
      shippingAddressId: selectedShippingAddressId.value,
      paymentMethod: selectedPaymentMethod.value,
      notes: orderNotes.value.trim() || null,
      // Gửi thêm contactInfo nếu API yêu cầu
      // recipientName: `${contactInfo.value.firstName} ${contactInfo.value.lastName}`,
      // recipientPhone: contactInfo.value.phone,
      // recipientEmail: contactInfo.value.email,
  };
  console.log("Order Data to be sent:", orderData);

   try {
     // *** SỬ DỤNG apiClient ĐÃ KHỞI TẠO Ở TRÊN ***
     const response = await apiClient.post('/api/v1/orders', orderData);
     toast.success("Đặt hàng thành công!");
     await cartStore.fetchCart(); // Chờ fetchCart xong
     // *** Chuyển hướng ***
     router.push({ name: 'myOrders' }); // Chuyển về trang danh sách đơn hàng (Placeholder)
     // Hoặc: router.push({ name: 'orderDetails', params: { orderId: response.data.id } });
   } catch (err) {
     console.error("Error placing order:", err);
     placeOrderError.value = err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
     toast.error(placeOrderError.value);
   } finally {
     isPlacingOrder.value = false;
   }
};

// --- Lifecycle Hooks ---
onMounted(() => {
    cartStore.fetchCart();
    if (currentUser.value && currentUser.value.id) {
        contactInfo.value.firstName = currentUser.value.firstName || '';
        contactInfo.value.lastName = currentUser.value.lastName || '';
        contactInfo.value.email = currentUser.value.email || '';
        contactInfo.value.phone = currentUser.value.phone || ''; // Lấy SĐT (nếu authStore có)
    }
    if (userAddresses.value.length > 0 && !selectedShippingAddressId.value) {
         if (userAddresses.value[0].id !== null) { selectedShippingAddressId.value = userAddresses.value[0].id; }
         else { console.warn("[CheckoutPage] First address has null ID..."); }
    }
});

watch(() => authStore.user, (newUser) => {
    // Cập nhật contactInfo và selectedShippingAddressId khi user load xong
    if (newUser && newUser.id) {
        contactInfo.value.firstName = newUser.firstName || '';
        contactInfo.value.lastName = newUser.lastName || '';
        contactInfo.value.email = newUser.email || '';
        contactInfo.value.phone = newUser.phone || ''; // Lấy SĐT (nếu authStore có)
    }
    if (newUser?.addresses?.length > 0 && selectedShippingAddressId.value === null) {
         if (newUser.addresses[0].id !== null) { selectedShippingAddressId.value = newUser.addresses[0].id; }
         else { console.warn("[CheckoutPage] First address has null ID via watch..."); }
    }
}, { immediate: true, deep: true });

</script>

<style scoped>
/* ... CSS ... */
.list-group-item img { object-fit: cover; }
.form-check-label { cursor: pointer; }
.text-truncate { /* Đảm bảo style này có */ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: inline-block; vertical-align: bottom;}
.list-group-item > div:first-child { /* Cho phép tên sản phẩm chiếm nhiều không gian hơn */ min-width: 0; }
.list-group-item h6 { margin-bottom: 0; }
</style>