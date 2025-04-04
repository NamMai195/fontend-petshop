<template>
  <div class="container py-5">
    <h1 class="mb-4">Giỏ Hàng Của Bạn</h1>

    <div v-if="loading" class="text-center my-5 py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Đang tải giỏ hàng...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải giỏ hàng...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Lỗi</h4>
      <p>{{ error }}</p>
      <button class="btn btn-sm btn-danger" @click="cartStore.fetchCart()">Thử lại</button>
    </div>

    <div v-else-if="items.length === 0" class="text-center text-muted my-5 py-5">
      <Icon icon="tabler:shopping-cart-off" class="display-1 text-light mb-3" />
      <h2>Giỏ hàng của bạn đang trống</h2>
      <p>Hãy khám phá cửa hàng và thêm sản phẩm bạn yêu thích nhé!</p>
      <button class="btn btn-primary mt-3" @click="goToShop">
         <Icon icon="tabler:arrow-left" class="me-1" /> Tiếp tục mua sắm
      </button>
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table align-middle cart-table">
          <thead class="table-light">
            <tr>
              <th scope="col" style="width: 10%;">Ảnh</th>
              <th scope="col" style="width: 35%;">Sản phẩm</th>
              <th scope="col" style="width: 15%;" class="text-end">Đơn giá</th>
              <th scope="col" style="width: 15%;" class="text-center">Số lượng</th>
              <th scope="col" style="width: 15%;" class="text-end">Thành tiền</th>
              <th scope="col" style="width: 10%;" class="text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  width="70" height="70"
                  class="img-fluid rounded object-fit-cover"
                  @error="handleImageError"
                >
                 <img
                   v-else
                   src="/src/assets/images/logo.png"
                   width="70" height="70"
                   class="img-fluid rounded object-fit-contain p-1 bg-light"
                   alt="N/A"
                 >
              </td>
              <td>
                 <router-link :to="{ name: 'product-detail', params: { id: item.productId } }" class="text-dark fw-medium text-decoration-none product-name">
                     {{ item.name }}
                 </router-link>
                 </td>
              <td class="text-end">{{ formatCurrencyVND(item.price) }}</td>
              <td class="text-center">
                <div class="input-group input-group-sm justify-content-center quantity-control">
                  <button
                    class="btn btn-outline-secondary" type="button"
                    @click="handleQuantityChange(item, -1)"
                    :disabled="item.quantity <= 1 || updatingItemId === item.id"
                    aria-label="Giảm số lượng"
                   >
                    <Icon icon="tabler:minus" />
                  </button>
                  <input
                     type="text"
                     class="form-control text-center"
                     :value="item.quantity" readonly
                     style="max-width: 45px; background-color: #fff;"
                    aria-label="Số lượng sản phẩm"
                   >
                  <button
                     class="btn btn-outline-secondary" type="button"
                     @click="handleQuantityChange(item, 1)"
                    :disabled="updatingItemId === item.id"
                    aria-label="Tăng số lượng"
                  >
                     <Icon icon="tabler:plus" />
                  </button>
                </div>
              </td>
              <td class="text-end fw-medium">{{ formatItemSubtotal(item) }}</td>
              <td class="text-center">
                <button
                   class="btn btn-sm btn-outline-danger border-0 p-1"
                   @click="handleRemoveItem(item.id)"
                   :disabled="removingItemId === item.id"
                   title="Xóa sản phẩm"
                 >
                  <Icon icon="tabler:trash" class="fs-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="row justify-content-end mt-4">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Tổng cộng giỏ hàng</h5>
              <div class="d-flex justify-content-between mb-2">
                <span>Tổng sản phẩm:</span>
                <span>{{ totalQuantity }}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Tổng tiền:</span>
                <span>{{ formattedTotalPrice }}</span>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-primary btn-lg" @click="goToCheckout">
                  Tiến hành thanh toán <Icon icon="tabler:arrow-right" />
                </button>
                <button class="btn btn-outline-secondary" @click="goToShop">
                  <Icon icon="tabler:arrow-left" /> Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div> </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore'; // Import cart store
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue'; // Import Iconify

const router = useRouter();
const cartStore = useCartStore();
const toast = useToast();

// --- Lấy state và getters từ store ---
const items = computed(() => cartStore.items);
const loading = computed(() => cartStore.loading);
const error = computed(() => cartStore.error);
const updatingItemId = computed(() => cartStore.updatingItemId); // Theo dõi item đang cập nhật
const removingItemId = computed(() => cartStore.removingItemId); // Theo dõi item đang xóa (cần thêm vào state/action của store nếu muốn)
const totalQuantity = computed(() => cartStore.totalQuantity);
const formattedTotalPrice = computed(() => cartStore.formattedTotalPrice);

// --- Hàm xử lý ---
const handleQuantityChange = async (item, change) => {
  const newQuantity = item.quantity + change;
  if (newQuantity < 1) {
    // Optionally ask for confirmation before removing if quantity becomes 0
    // For now, just prevent going below 1
    return;
  }
  console.log(`[CartPage] Updating quantity for item ${item.id} to ${newQuantity}`);
  const result = await cartStore.updateItemQuantity(item.id, newQuantity);
  if (!result.success) {
    toast.error(result.message || "Lỗi cập nhật số lượng.");
  }
};

const handleRemoveItem = async (itemId) => {
   // Optional: Add confirmation dialog
   // if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

   console.log(`[CartPage] Removing item ${itemId}`);
   const result = await cartStore.removeItem(itemId);
   if (result.success) {
       toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
   } else {
       toast.error(result.message || "Lỗi khi xóa sản phẩm.");
   }
};

const goToCheckout = () => {
  router.push({ name: 'checkout' }); // Đảm bảo route 'checkout' tồn tại
};

const goToShop = () => {
    router.push({ name: 'shop' });
}

// --- Hàm tiện ích ---
const formatCurrencyVND = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatItemSubtotal = (item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') return '';
    return formatCurrencyVND(item.price * item.quantity);
}

const handleImageError = (event) => {
  event.target.src = '/src/assets/images/logo.png'; // Đường dẫn ảnh mặc định
  event.target.style.objectFit = 'contain';
  event.target.style.padding = '5px';
  event.target.classList.add('bg-light');
};


// --- Lifecycle Hook ---
onMounted(() => {
  // Gọi fetchCart khi component mount để đảm bảo dữ liệu mới nhất
  // Store sẽ kiểm tra token và trạng thái loading bên trong
  cartStore.fetchCart();
});
</script>

<style scoped>
.cart-table th {
  font-weight: 600;
  color: var(--bs-secondary-color);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cart-table td {
  vertical-align: middle;
}
.product-name {
  font-size: 0.95rem;
}
.product-name:hover {
  color: var(--bs-primary) !important;
}
.quantity-control .form-control {
    border-left: none;
    border-right: none;
    box-shadow: none !important;
    padding-left: 0.3rem;
    padding-right: 0.3rem;
}
.quantity-control .btn {
    z-index: 1; /* Đảm bảo nút không bị input đè lên */
}
.object-fit-cover { object-fit: cover; }
.object-fit-contain { object-fit: contain; }

.text-light { color: #adb5bd !important; } /* Màu cho icon giỏ hàng trống */
.display-1 { font-size: 5rem; }
</style>