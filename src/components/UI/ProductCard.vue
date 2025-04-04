<template>
  <div class="card position-relative border-0 shadow-sm overflow-hidden rounded-4 h-100">
    <div class="position-relative">
      <router-link :to="{ name: 'product-detail', params: { id: product.id } }" class="text-decoration-none">
        <img
          v-if="product.imageURLs && product.imageURLs.length > 0"
          :src="product.imageURLs[0]"
          class="card-img-top rounded-0" :alt="product.name"
          @error="handleImageError"
           width="100px"
          height="300px"
        />
        <img
          v-else
          src="/src/assets/images/logo.png" class="card-img-top rounded-0"
          width="300px"
          height="300px"
          alt="Ảnh sản phẩm không có sẵn"
          style="aspect-ratio: 3 / 4; object-fit: contain; padding: 20px;" />
      </router-link>
      </div>

    <div class="card-body d-flex flex-column p-3">
       <router-link :to="{ name: 'product-detail', params: { id: product.id } }" class="text-decoration-none text-dark">
        <h3 class="card-title fs-6 fw-medium pt-2 mb-2 text-truncate-2">
           {{ product.name }}
        </h3>
      </router-link>

      <div class="card-text mt-auto">
        <h4 class="secondary-font text-primary fw-bold mb-3 fs-5">
            {{ formatPrice(product.price) }}
        </h4>

        <div class="d-flex flex-wrap justify-content-between align-items-center">
           <button
             type="button"
             class="btn btn-sm btn-primary text-uppercase flex-grow-1 me-2"
             @click.prevent="addToCart"
             :disabled="isAddingToCart"
            >
             <span v-if="isAddingToCart" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
             <small v-else>Thêm vào giỏ</small>
           </button>
           <button
              type="button"
              class="btn btn-sm btn-outline-danger px-2"
              @click.prevent="addToWishlist"
              :disabled="isAddingToWishlist"
            >
                <span v-if="isAddingToWishlist" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <Icon v-else icon="tabler:heart" class="fs-6 align-middle" />
           </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
// Import các thành phần cần thiết
import { ref } from 'vue'; // Bỏ computed nếu không dùng productLink
import { useToast } from 'vue-toastification';
// *** THÊM IMPORT CART STORE ***
import { useCartStore } from '@/stores/cartStore'; // Đảm bảo đường dẫn đúng
// Import Icon cho nút wishlist
import { Icon } from '@iconify/vue';
// *** Vẫn giữ axios/apiClient nếu addToWishlist cần dùng ***
import axios from 'axios';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const toast = useToast();
// *** KHỞI TẠO CART STORE ***
const cartStore = useCartStore();

const isAddingToCart = ref(false);
const isAddingToWishlist = ref(false);

// *** Vẫn giữ apiClient nếu addToWishlist cần ***
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
});
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
}, error => Promise.reject(error));


// *** Bỏ productLink nếu đã dùng router-link trong template ***
// const productLink = computed(() => { ... });

const formatPrice = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const handleImageError = (event) => {
  event.target.src = '/src/assets/images/logo.png';
  event.target.style.objectFit = 'contain';
  event.target.style.padding = '20px';
};

// *** HÀM addToCart ĐÃ SỬA ĐÚNG ĐỂ GỌI ACTION TỪ STORE ***
const addToCart = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng!');
    return;
  }
  if (!props.product || !props.product.id) {
      toast.error('Sản phẩm không hợp lệ!');
      return;
  }

  isAddingToCart.value = true; // Bắt đầu loading
  try {
    console.log(`[ProductCard] Calling cartStore.addItem for product ${props.product.id}`);
    // *** GỌI ACTION 'addItem' TỪ CART STORE ***
    const result = await cartStore.addItem(props.product.id, 1); // Mặc định thêm 1

    // Xử lý kết quả trả về từ action
    if (result.success) {
      toast.success("Đã thêm vào giỏ hàng!");
      // Store đã tự cập nhật state, Header và Offcanvas sẽ tự cập nhật
    } else {
      // Hiển thị lỗi trả về từ action (nếu có)
      toast.error(result.message || "Thêm vào giỏ hàng thất bại.");
    }
  } catch (err) {
    // Trường hợp action trong store bị lỗi và ném ra exception (ít xảy ra nếu action đã try...catch)
    console.error("Unexpected error calling addItem action:", err);
    toast.error("Đã xảy ra lỗi không mong muốn.");
  } finally {
    isAddingToCart.value = false; // Kết thúc loading
  }
};

// *** Hàm addToWishlist giữ nguyên logic cũ (tự gọi API) ***
const addToWishlist = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) { toast.info('Vui lòng đăng nhập để thêm vào yêu thích!'); return; }
  if (!props.product || !props.product.id) { toast.error('Sản phẩm không hợp lệ!'); return; }

  isAddingToWishlist.value = true;
  try {
    console.log('Adding to wishlist (using local API call):', props.product.id);
    // ***** LOGIC GỌI API WISHLIST CỦA ANH Ở ĐÂY *****
    // Ví dụ: await apiClient.post('/api/v1/wishlist/items', { productId: props.product.id });
    await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập API call
    toast.success("Đã thêm vào yêu thích!");
  } catch (err) {
     console.error("Error adding to wishlist:", err);
     let errorMessage = "Thêm vào yêu thích thất bại.";
      if (err.response && err.response.status === 401) { errorMessage = "Phiên đăng nhập hết hạn."; }
     toast.error(errorMessage);
  } finally {
     isAddingToWishlist.value = false;
  }
};

</script>

<style scoped>
/* CSS giữ nguyên */
.text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; min-height: 2.5em; line-height: 1.25em; }
.card-img-top { width: 100%; }
.card:hover { transform: translateY(-5px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important; transition: transform 0.3s ease, box-shadow 0.3s ease; }

/* Style cho nút khi loading */
.btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}
</style>