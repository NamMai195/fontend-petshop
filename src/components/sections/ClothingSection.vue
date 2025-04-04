<template>
  <section id="clothing" class="my-5 overflow-hidden">
    <div class="container pb-5">

      <div class="section-header d-md-flex justify-content-between align-items-center mb-3">
        <h2 class="display-3 fw-normal">Pet Clothing</h2>
        <div>
          <router-link
             :to="{ name: 'category-products', params: { categoryId: CLOTHING_CATEGORY_ID } }"
             class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1"
          >
             shop now
             <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
               <use xlink:href="#arrow-right"></use>
             </svg>
           </router-link>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading clothing products...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if="products.length > 0">
          <div class="products-carousel swiper" ref="swiperContainer">
            <div class="swiper-wrapper">
              <div
                class="swiper-slide h-auto"
                v-for="product in products"
                :key="product.id"
              >
                <ProductCard :product="product" class="h-100"/>
              </div>
            </div>

            <div class="swiper-pagination mt-3 position-relative"></div>

            </div>
      </div>

       <div v-else class="text-center py-5">
          <p>No clothing products found at the moment.</p>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import ProductCard from '@/components/common/ProductCard.vue';

// --- State ---
const products = ref([]);
const loading = ref(true);
const error = ref(null);
const swiperContainer = ref(null);
let swiperInstance = null;

// --- Config ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // Nên dùng biến môi trường
const CLOTHING_CATEGORY_ID = 1; // **QUAN TRỌNG: Xác nhận lại ID này!**
const CLOTHING_LIMIT = 8; // Số lượng sản phẩm fetch

// --- Fetch Data ---
const fetchClothingProducts = async () => {
  error.value = null;
  products.value = []; // Xóa sản phẩm cũ

  try {
    const apiUrl = `${API_BASE_URL}/api/v1/products`;
    const response = await axios.get(apiUrl, {
      params: {
        categoryId: CLOTHING_CATEGORY_ID,
        size: CLOTHING_LIMIT,
        page: 0
      }
    });

    // Xử lý response (ưu tiên .content nếu có)
    const fetchedProducts = response.data?.content ?? (Array.isArray(response.data) ? response.data : []);
    if (Array.isArray(fetchedProducts)) {
         products.value = fetchedProducts;
         console.log(`Workspaceed ${products.value.length} clothing products.`);
         if(products.value.length > 0) {
            await nextTick(); // Đợi DOM cập nhật
            initializeOrUpdateSwiper();
         }
    } else {
        console.warn("Unexpected API response structure:", response.data);
        products.value = [];
    }

  } catch (err) {
    console.error(`Error fetching clothing products (Category ID: ${CLOTHING_CATEGORY_ID}):`, err);
    if (err.response) {
      error.value = `Error ${err.response.status}: Could not load products.`;
    } else if (err.request) {
      error.value = 'Network Error: Unable to connect.';
    } else {
      error.value = 'An unexpected error occurred.';
    }
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// --- Swiper ---
const initializeOrUpdateSwiper = () => {
  if (!swiperContainer.value) {
      console.warn("Swiper container ref not found.");
      return;
  }

  // Chỉ chạy ở client-side
  if (typeof window !== 'undefined') {
      try {
        import('swiper/bundle').then(({ default: Swiper }) => {
          // QUAN TRỌNG: Import CSS Swiper đã được thực hiện tĩnh ở component khác (HeroSlider)
          // import('swiper/css/bundle'); // 1. Toàn bộ bundle - ĐÃ XÓA
          // import 'swiper/css';            // 2. Hoặc từng module cần thiết
          // import 'swiper/css/navigation';
          // import 'swiper/css/pagination';

          if (swiperInstance) {
            swiperInstance.update(); // Cập nhật nếu đã có
            console.log("Swiper instance updated.");
          } else {
            // Khởi tạo mới
            swiperInstance = new Swiper(swiperContainer.value, {
              slidesPerView: 2, // Mobile
              spaceBetween: 15,
              // loop: products.value.length > 5, // Tùy chọn: Bật loop

              pagination: { // Tùy chọn: Pagination
                 el: '.swiper-pagination',
                 clickable: true,
               },
              // navigation: { // Tùy chọn: Navigation
              //   nextEl: '.swiper-button-next',
              //   prevEl: '.swiper-button-prev',
              // },
              breakpoints: { // Responsive
                576: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                992: { slidesPerView: 4, spaceBetween: 30 },
                1200: { slidesPerView: 5, spaceBetween: 30 }
              }
            });
            console.log("Swiper instance created.");
          }
        }).catch(err => console.error("Failed to load Swiper:", err));
      } catch (e) {
          console.error("Error initializing Swiper:", e);
      }
  }
};

// --- Lifecycle ---
onMounted(() => {
  fetchClothingProducts();
});

onUnmounted(() => {
  if (swiperInstance) {
    swiperInstance.destroy(true, true); // Hủy Swiper khi component mất
    swiperInstance = null;
    console.log("Swiper instance destroyed.");
  }
});

</script>

<style scoped>
/* --- Basic Styling --- */
.section-header h2 {
  font-size: 2rem;
}
@media (min-width: 768px) {
  .section-header h2 { font-size: 2.5rem; }
}
.alert { margin: 20px 0; }

/* --- Swiper Customization --- */
.swiper {
  padding-bottom: 40px; /* Khoảng trống cho pagination */
}

/* Style pagination dots */
:deep(.swiper-pagination) { bottom: 0 !important; }
:deep(.swiper-pagination-bullet) { background-color: #adb5bd; opacity: 0.8; width: 10px; height: 10px; }
:deep(.swiper-pagination-bullet-active) { background-color: var(--bs-primary, #0d6efd); opacity: 1; }

/* Style nút Prev/Next (Nếu bật) */
/* :deep(.swiper-button-prev), :deep(.swiper-button-next) { color: var(--bs-primary, #0d6efd); } */

/* Đảm bảo slide có chiều cao phù hợp */
.swiper-slide { display: flex; }
</style>
