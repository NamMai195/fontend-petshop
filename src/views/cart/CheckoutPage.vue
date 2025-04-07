<template>
  <div class="container py-5">
    <h1 class="mb-4">Thanh toán</h1>

    <div v-if="cartLoading || authProfileLoading" class="text-center my-5 py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải dữ liệu...</p>
    </div>
    <div v-else-if="cartError || authProfileError || authError" class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Lỗi</h4>
      <p>{{ cartError || authProfileError || authError }}</p>
      <p v-if="!isLoggedIn">Có thể bạn cần <router-link :to="{ name: 'login', query: { redirect: '/checkout' }}">đăng nhập</router-link>.</p>
      <button v-else class="btn btn-sm btn-danger me-2" @click="cartStore.fetchCart()">Tải lại giỏ hàng</button>
      <button v-if="isLoggedIn && (!currentUser?.firstName || !currentUser?.addresses)" class="btn btn-sm btn-warning" @click="authStore.fetchUserProfile(currentUser?.id)">Tải lại thông tin user</button>
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
            <div class="col-sm-6">
              <label for="firstName" class="form-label">Tên</label>
              <input type="text" class="form-control" id="firstName" v-model="contactInfo.firstName" required>
            </div>
            <div class="col-sm-6">
              <label for="lastName" class="form-label">Họ</label>
              <input type="text" class="form-control" id="lastName" v-model="contactInfo.lastName" required>
            </div>
            <div class="col-12">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="contactInfo.email" required>
            </div>
            <div class="col-12">
              <label for="phone" class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" id="phone" v-model="contactInfo.phone" required>
            </div>
            <div class="col-12">
              <label for="notes" class="form-label">Ghi chú <span class="text-muted">(Tùy chọn)</span></label>
              <textarea class="form-control" id="notes" rows="3" v-model="orderNotes"></textarea>
            </div>
           </div>

          <hr class="my-4">

          <h4 class="mb-3">Phương thức thanh toán</h4>
          <div class="my-3">
            <div class="form-check">
              <input id="cod" name="paymentMethod" type="radio" class="form-check-input" required value="COD" v-model="selectedPaymentMethod">
              <label class="form-check-label" for="cod">COD</label>
            </div>
            <div class="form-check">
              <input id="bankTransfer" name="paymentMethod" type="radio" class="form-check-input" required value="BANK_TRANSFER" v-model="selectedPaymentMethod">
              <label class="form-check-label" for="bankTransfer">Chuyển khoản</label>
            </div>
            <div v-if="!selectedPaymentMethod && !isPlacingOrder && isLoggedIn && items.length > 0" class="text-danger small mt-2">Vui lòng chọn phương thức thanh toán.</div>
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
      </div></div></div></template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

// *** API CLIENT (giữ nguyên) ***
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
});
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));


// --- State & Getters (giữ nguyên) ---
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

// --- State Form (giữ nguyên) ---
const selectedShippingAddressId = ref(null);
const contactInfo = ref({ firstName: '', lastName: '', email: '', phone: '' });
const selectedPaymentMethod = ref('COD'); // Mặc định chọn COD
const orderNotes = ref('');
const addressError = ref(null);
const placeOrderError = ref(null);
const isPlacingOrder = ref(false);

// --- Computed: Can Place Order (Kiểm tra kỹ hơn) ---
const canPlaceOrder = computed(() => {
    if (!isLoggedIn.value || items.value.length === 0 || authProfileLoading.value || isPlacingOrder.value) {
        return false;
    }
    // Quan trọng: Phải có địa chỉ và đã chọn địa chỉ HOẶC không có địa chỉ nào được lưu (trường hợp này không nên xảy ra nếu bắt buộc thêm ở profile)
    const addressSelected = userAddresses.value.length > 0 && selectedShippingAddressId.value !== null;
    const noAddressesExist = userAddresses.value.length === 0; // Check nếu user chưa có địa chỉ nào
    // Nếu bắt buộc phải có địa chỉ thì check `!noAddressesExist && addressSelected`
    // Nếu cho phép đặt hàng mà không cần địa chỉ lưu trước (ít gặp) thì chỉ cần `addressSelected`
    if (noAddressesExist) {
      console.log("canPlaceOrder: User has no saved addresses.");
      // Quyết định xem có cho đặt hàng không khi user chưa có địa chỉ nào
      // Thường là không nên cho, nên return false;
      return false;
    }
    if (!addressSelected) {
      console.log("canPlaceOrder: No address selected.");
      return false;
    }

    // Check thông tin liên hệ đã điền đủ
    const contactFilled = !!(contactInfo.value.firstName && contactInfo.value.lastName && contactInfo.value.email && contactInfo.value.phone);
    if (!contactFilled) {
        console.log("canPlaceOrder: Contact info not filled");
        return false;
    }
    // Check đã chọn phương thức thanh toán
    if (!selectedPaymentMethod.value) {
         console.log("canPlaceOrder: No payment method selected");
         return false;
    }

    console.log("canPlaceOrder: Yes");
    return true;
});


// --- Format Functions (giữ nguyên) ---
const formatCurrencyVND = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const formatItemSubtotal = (item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') return '';
    return formatCurrencyVND(item.price * item.quantity);
};
const handleImageError = (event) => {
    event.target.src = '/src/assets/images/logo.png';
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
    const parts = [
        `${addr.streetNumber || ''} ${addr.street || ''}`.trim(),
        addr.ward,
        addr.district,
        addr.city,
        addr.country
    ].filter(part => part && String(part).trim()); // Lọc bỏ phần tử rỗng hoặc null/undefined
    const formatted = parts.join(', ');
    return formatted || `Địa chỉ ID: ${addr.id || 'N/A'}`;
};

// --- Navigation (giữ nguyên) ---
const goToShop = () => { router.push({ name: 'shop' }); };
const goToAddressManagement = () => { router.push({ name: 'account-info' }); };


// --- Order Placement (giữ nguyên logic xử lý submit) ---
const handlePlaceOrder = async () => {
  placeOrderError.value = null; addressError.value = null;

  // Validate lại lần cuối trước khi gửi
  let validationError = null;
  if (userAddresses.value.length === 0) { validationError = 'Vui lòng thêm địa chỉ giao hàng trong tài khoản.'; addressError.value = validationError; }
  else if (!selectedShippingAddressId.value) { validationError = 'Vui lòng chọn địa chỉ giao hàng.'; addressError.value = validationError; }
  if (!contactInfo.value.firstName || !contactInfo.value.lastName || !contactInfo.value.email || !contactInfo.value.phone) { validationError = validationError || 'Vui lòng điền đầy đủ thông tin liên hệ.'; placeOrderError.value = 'Vui lòng điền đầy đủ thông tin liên hệ.'; }
  if (!selectedPaymentMethod.value) { validationError = validationError || 'Vui lòng chọn phương thức thanh toán.'; placeOrderError.value = placeOrderError.value || 'Vui lòng chọn phương thức thanh toán.';}

  if (validationError || !canPlaceOrder.value) { // Check cả canPlaceOrderเผื่อ có trường hợp khác
    toast.error(validationError || 'Không thể đặt hàng. Vui lòng kiểm tra lại thông tin.');
    return;
  }

  isPlacingOrder.value = true;
  console.log('[CheckoutPage] Placing order...');

  const orderData = {
      shippingAddressId: selectedShippingAddressId.value,
      paymentMethod: selectedPaymentMethod.value,
      notes: orderNotes.value.trim() || null,
  };
  console.log("[CheckoutPage] Order Data to be sent:", orderData);

   try {
     const response = await apiClient.post('/api/v1/orders', orderData);
     toast.success("Đặt hàng thành công!");
     await cartStore.clearCartLocally();
     await cartStore.fetchCart();
      if (response.data?.id) {
           router.push({ name: 'orderDetails', params: { orderId: response.data.id } });
      } else {
           router.push({ name: 'myOrders' });
      }
   } catch (err) {
     console.error("[CheckoutPage] Error placing order:", err);
     let errorMessage = "Đặt hàng thất bại. Vui lòng thử lại.";
     if (err.response) {
          errorMessage = err.response.data?.message || `Lỗi ${err.response.status}: Đã có lỗi xảy ra.`;
         if (err.response.status === 401) {
             errorMessage = "Phiên đăng nhập hết hạn. Đang chuyển đến trang đăng nhập...";
             setTimeout(() => router.push({ name: 'login', query: { redirect: '/checkout' } }), 2000);
         } else if (err.response.data?.errors) { // Hiển thị lỗi validation chi tiết nếu có
             errorMessage = Object.values(err.response.data.errors).flat().join(' ');
         }
     }
     placeOrderError.value = errorMessage;
     toast.error(errorMessage);
   } finally {
     isPlacingOrder.value = false;
   }
};


// --- Lifecycle Hooks (Đã sửa) ---
onMounted(async () => {
    console.log("[CheckoutPage] Mounted");
    // Chỉ fetch giỏ hàng ở đây, watcher sẽ lo việc fetch profile
    await cartStore.fetchCart();
});

// --- Watch hook (Đã sửa - bỏ profileFetched, dùng store state) ---
watch(() => authStore.user, (newUser, oldUser) => {
    console.log("[CheckoutPage] Watch authStore.user triggered.");
    console.log("New user data in watcher:", JSON.parse(JSON.stringify(newUser || {})));
    const newUserId = newUser?.id;

    // 1. Cập nhật Contact Info (Giữ nguyên)
    if (newUser && newUserId) {
        contactInfo.value.firstName = newUser.firstName || '';
        contactInfo.value.lastName = newUser.lastName || '';
        contactInfo.value.email = newUser.email || '';
        contactInfo.value.phone = newUser.phone || '';
        console.log("[CheckoutPage] Contact info updated from watcher:", JSON.parse(JSON.stringify(contactInfo.value)));
    } else {
         if (contactInfo.value.email) { // Chỉ clear nếu trước đó có thông tin
            contactInfo.value = { firstName: '', lastName: '', email: '', phone: '' };
            console.log("[CheckoutPage] User seems logged out or lost ID, cleared contact info.");
         }
    }

    // 2. Cập nhật Địa chỉ mặc định (Giữ nguyên)
    const newAddresses = newUser?.addresses;
    if (Array.isArray(newAddresses) && newAddresses.length > 0) {
        // Chỉ set mặc định nếu chưa có cái nào được chọn VÀ địa chỉ đầu tiên có ID hợp lệ
        if (selectedShippingAddressId.value === null && newAddresses[0]?.id != null) {
             selectedShippingAddressId.value = newAddresses[0].id;
             console.log(`[CheckoutPage] Default shipping address set to ID: ${newAddresses[0].id} via watcher.`);
        } else if (selectedShippingAddressId.value === null) {
             console.warn("[CheckoutPage] Watcher: First address has null/undefined ID or watcher ran before addresses populated fully?");
        }
    } else {
        // Nếu user logout hoặc không có địa chỉ, reset lựa chọn
        if (selectedShippingAddressId.value !== null) {
             selectedShippingAddressId.value = null;
             console.log("[CheckoutPage] Watcher: User has no addresses or logged out, selectedShippingAddressId reset to null.");
         }
    }

    // 3. Gọi Fetch Profile nếu cần (Logic đã sửa)
    // Điều kiện: Có ID user, store không đang loading profile, và profile có vẻ chưa đủ
    // (ví dụ: chưa có addresses HOẶC chưa có firstName - tùy thuộc vào dữ liệu ban đầu của user)
    const profileSeemsIncomplete = !newUser?.addresses || newUser.addresses.length === 0 || !newUser?.firstName;
    const needsProfileFetch = newUserId && !authStore.profileLoading && profileSeemsIncomplete;

    if (needsProfileFetch) {
        console.log(`[CheckoutPage] Watcher triggering fetchUserProfile for ID: ${newUserId} (Profile seems incomplete or not fetched).`);
        // Gọi thẳng action của store. Action này cần tự xử lý loading state.
        authStore.fetchUserProfile(newUserId).catch(error => {
            console.error(`[CheckoutPage] Watcher: Error calling fetchUserProfile for ID: ${newUserId}:`, error);
            // Store nên tự set error state của nó, toast có thể hiển thị lỗi từ state đó ở template
        });
    } else if (newUserId && authStore.profileLoading) {
         console.log(`[CheckoutPage] Watcher: Profile fetch already in progress for ID: ${newUserId}.`);
    } else if (newUserId && !profileSeemsIncomplete) {
         console.log(`[CheckoutPage] Watcher: Profile seems complete for ID: ${newUserId}.`);
    }

}, { immediate: true, deep: true }); // immediate: true và deep: true rất quan trọng

</script>

<style scoped>
/* ... CSS của bạn giữ nguyên ... */
.list-group-item img { object-fit: cover; }
.form-check-label { cursor: pointer; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: inline-block; vertical-align: bottom; }
.list-group-item > div:first-child { min-width: 0; } /* Cho phép div chứa tên/sl chiếm nhiều không gian hơn */
.list-group-item h6 { margin-bottom: 0; } /* Giảm khoảng cách dưới h6 */
.form-select:disabled { background-color: #e9ecef; opacity: 1; } /* Có thể thêm style cho select bị disabled */
</style>