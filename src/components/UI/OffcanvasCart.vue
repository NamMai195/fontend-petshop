<script setup>
// Import các hàm cần thiết từ Vue và Vue Router
import { computed, onMounted } from 'vue'; // Bỏ ref nếu không dùng thêm state cục bộ
import { useRouter } from 'vue-router';
// *** THÊM IMPORT CART STORE ***
import { useCartStore } from '@/stores/cartStore'; // Đảm bảo đường dẫn đúng
// Import toast nếu muốn hiển thị thông báo lỗi khi xóa
import { useToast } from 'vue-toastification';

const router = useRouter();
// *** KHỞI TẠO STORE ***
const cartStore = useCartStore();
const toast = useToast(); // Khởi tạo toast

// *** SỬ DỤNG STATE VÀ GETTERS TỪ STORE ***
const loading = computed(() => cartStore.loading);
const error = computed(() => cartStore.error); // Lỗi sẽ do store quản lý
const cartItems = computed(() => cartStore.items); // Lấy danh sách items từ store

// Sử dụng computed properties (getters) đã định nghĩa trong store
const cartTotalQuantity = computed(() => cartStore.totalQuantity);
const formattedCartTotal = computed(() => cartStore.formattedTotalPrice);

// *** SỬA HÀM XÓA ITEM ĐỂ GỌI ACTION CỦA STORE ***
const removeItemFromCart = async (itemId) => {
  console.log(`[OffcanvasCart] Requesting remove item: ${itemId}`);
  // Gọi action removeItem từ store
  const result = await cartStore.removeItem(itemId);
  if (!result.success) {
      // Hiển thị toast báo lỗi nếu action trả về lỗi
      toast.error(result.message || "Lỗi khi xóa sản phẩm.");
  }
  // Không cần gọi fetchCart() ở đây nữa, vì store đã tự cập nhật state sau khi xóa thành công
};

// *** GỌI fetchCart TỪ STORE KHI COMPONENT MOUNT ***
// Điều này đảm bảo giỏ hàng được tải khi component được tạo lần đầu
// (Việc cập nhật sau đó sẽ tự động nhờ reactivity của Pinia)
onMounted(() => {
  // Chỉ fetch nếu trong store chưa có items (hoặc luôn fetch tùy logic)
  // if (cartStore.items.length === 0) {
    cartStore.fetchCart();
  // }
});


// --- Các hàm format cục bộ (có thể giữ lại hoặc chuyển vào store/utils) ---
const formatCurrencyVND = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { // Kiểm tra NaN
    return '';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatItemSubtotal = (item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return '';
    }
    // Tính toán và format ngay tại đây
    const subtotal = item.price * item.quantity;
    return formatCurrencyVND(subtotal);
}


// *** SỬA HÀM CHUYỂN TRANG GIỎ HÀNG ***
const goToCartDetails = () => {
  // Đóng offcanvas trước khi chuyển trang (tùy chọn)
   const offcanvasElement = document.getElementById('offcanvasCart');
   if (offcanvasElement) {
     try {
       const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
       if (bsOffcanvas) { bsOffcanvas.hide(); }
     } catch(e) { console.warn("Bootstrap/Offcanvas error on hide:", e); }
   }
  // Sử dụng tên route 'cart' đã định nghĩa trong router
  router.push({ name: 'cart' });
};

// --- Các ref cục bộ và apiClient đã được loại bỏ ---
// const cartTotalPrice = computed(() => ...); // Đã dùng getter từ store
// const apiClient = axios.create({...});
// const fetchCart = async () => {...}; // Đã chuyển vào store
</script>

<template>
  <div class="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasCart" aria-labelledby="offcanvasCartLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasCartLabel">Giỏ hàng của bạn</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else>
        <div v-if="cartItems.length > 0" class="order-md-last d-flex flex-column h-100">
          <div>
              <h4 class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-primary">Sản phẩm</span>
                <span class="badge bg-primary rounded-circle pt-2">{{ cartTotalQuantity }}</span>
              </h4>
              <ul class="list-group mb-3">
                <li v-for="item in cartItems" :key="item.id" class="list-group-item d-flex justify-content-between lh-sm">
                  <div class="d-flex align-items-center">
                     <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" width="50" height="50" class="me-3 rounded object-fit-cover">
                     <div class="flex-grow-1">
                        <h6 class="my-0">{{ item.name }} <span v-if="item.quantity > 1" class="text-muted">x{{ item.quantity }}</span></h6>
                     </div>
                  </div>
                  <div class="d-flex align-items-center flex-shrink-0">
                    <span class="text-body-secondary me-2">{{ formatItemSubtotal(item) }}</span>
                    <button @click="removeItemFromCart(item.id)" class="btn btn-sm btn-outline-danger border-0 p-0 lh-1" title="Xóa sản phẩm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>
                    </button>
                  </div>
                </li>
              </ul>
          </div>

          <div class="mt-auto pt-3 border-top">
              <div class="d-flex justify-content-between mb-3">
                <span class="fw-bold">Tổng cộng (VND)</span>
                <strong>{{ formattedCartTotal }}</strong>
              </div>
               <button @click="goToCartDetails" class="w-100 btn btn-primary btn-lg" type="button">
                Xem giỏ hàng & Thanh toán
              </button>
          </div>

        </div>
        <div v-else class="text-center text-muted mt-5">
          <p>Giỏ hàng của bạn đang trống.</p>
           <button class="btn btn-outline-primary mt-2" data-bs-dismiss="offcanvas" @click="router.push({ name: 'shop' })">
               Tiếp tục mua sắm
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style giữ nguyên */
/* ... */
</style> 