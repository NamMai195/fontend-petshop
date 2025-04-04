<template>
  <section id="bestselling" class="my-5 overflow-hidden">
    <div class="container py-5 mb-5">

      <div class="section-header d-md-flex justify-content-between align-items-center mb-3">
        <h2 class="display-3 fw-normal">Best selling products</h2>
        <div>
          <a href="#" class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
            shop now
            <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
              <use xlink:href="#arrow-right"></use>
            </svg>
          </a>
        </div>
      </div>

      <div v-if="loading" class="text-center">
        <p>Loading products...</p>
        </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if='products.length > 0' class="swiper bestselling-swiper">
        <div class="swiper-wrapper">
          <div
            class="swiper-slide"
            v-for="product in products"
            :key="product.id"
          >
            <ProductCard :product="product" />
            </div>
        </div>
        </div>

       <div v-else class="text-center">
          <p>No best-selling products found at the moment.</p>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import ProductCard from '@/components/common/ProductCard.vue'; // Đường dẫn tới ProductCard component

// --- State Variables ---
const products = ref([]); // Holds the array of products from API
const loading = ref(false); // Tracks loading state
const error = ref(null); // Stores any API error message

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8080'; // Your API base URL
const BESTSELLING_LIMIT = 8; // Number of products to fetch

// --- Fetch Products Function ---
const fetchBestsellingProducts = async () => {
  loading.value = true;
  error.value = null;
  products.value = []; // Clear previous products

  try {
    // Construct the API URL with query parameters
    const apiUrl = `${API_BASE_URL}/api/v1/products`;
    const response = await axios.get(apiUrl, {
      params: {
        size: BESTSELLING_LIMIT,
        page: 0
      }
    });

    if (Array.isArray(response.data)) {
       products.value = response.data;
    } else if (response.data && Array.isArray(response.data.content)) {
      // Hoặc nếu API trả về dạng trang (Page) như trong Spring Pageable
      products.value = response.data.content;
    } else {
      console.warn("Unexpected API response structure:", response.data);
      products.value = []; // Đảm bảo products là mảng
    }

    await nextTick();
    initializeOrUpdateSwiper(); 

  } catch (err) {
    console.error("Error fetching bestselling products:", err);
    if (err.response) {
      error.value = `Error: ${err.response.status} - ${err.response.data.message || 'Could not load products.'}`;
    } else if (err.request) {
      error.value = 'Network Error: Could not connect to the server.';
    } else {
      error.value = 'An unexpected error occurred.';
    }
    products.value = []; 
  } finally {
    loading.value = false; 
  }
};


const initializeOrUpdateSwiper = () => {
  console.log("Attempting to initialize/update Swiper...");
};

// --- Lifecycle Hook ---
onMounted(() => {
  fetchBestsellingProducts(); 
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