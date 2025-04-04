<template>
  <section id="foodies" class="my-5">
    <div class="container my-5 py-5">

      <div class="section-header d-md-flex justify-content-between align-items-center">
        <h2 class="display-3 fw-normal">Pet Foodies</h2>
        <div>
          <p class="m-0">
            <button
              class="filter-button me-4"
              :class="{ 'active': selectedCategoryId === null }"
              @click="filterProducts(null)"
            >ALL</button>
            <button
              class="filter-button me-4"
              :class="{ 'active': selectedCategoryId === categoryMap.CAT }"
              @click="filterProducts(categoryMap.CAT)"
            >CAT</button>
            <button
              class="filter-button me-4"
              :class="{ 'active': selectedCategoryId === categoryMap.DOG }"
              @click="filterProducts(categoryMap.DOG)"
            >DOG</button>
            <button
              class="filter-button me-4"
              :class="{ 'active': selectedCategoryId === categoryMap.BIRD }"
              @click="filterProducts(categoryMap.BIRD)"
            >BIRD</button>
          </p>
        </div>
        <div>
          <a href="#" class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
            shop now
            <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
              <use xlink:href="#arrow-right"></use>
            </svg>
          </a>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <p>Loading pet food...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if="products.length > 0" class="row">
        <div
          v-for="product in products"
          :key="product.id"
          class="col-md-4 col-lg-3 my-4"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <div v-else class="text-center py-5">
          <p>No pet food found matching the criteria.</p>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ProductCard from '@/components/common/ProductCard.vue';

const products = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedCategoryId = ref(null); // null = ALL

const API_BASE_URL = 'http://localhost:8080';
const PRODUCTS_PER_PAGE = 12;

// QUAN TRỌNG: Cần thay thế bằng ID category thực tế từ DB của bạn
const categoryMap = {
  CAT: 7,
  DOG: 8,
  BIRD: 9
};
// const FOOD_CATEGORY_ID_PARENT = 6; // Có thể dùng ID cha cho nút ALL nếu có

const fetchFoodieProducts = async (categoryId = null) => {
  loading.value = true;
  error.value = null;

  let effectiveCategoryId = categoryId;
  // Bỏ qua categoryId nếu filter là ALL (null) để lấy tất cả sản phẩm (có thể cần logic khác nếu chỉ muốn food)
  if (categoryId === null) {
      effectiveCategoryId = undefined;
  }

  try {
    const apiUrl = `${API_BASE_URL}/api/v1/products`;
    const params = {
      size: PRODUCTS_PER_PAGE,
      page: 0
    };
    if (effectiveCategoryId !== undefined) {
      params.categoryId = effectiveCategoryId;
    }

    console.log("Fetching products with params:", params);
    const response = await axios.get(apiUrl, { params });

    if (response.data && Array.isArray(response.data.content)) {
      products.value = response.data.content;
    } else if (Array.isArray(response.data)) {
       products.value = response.data;
    } else {
      console.warn("Unexpected API response structure:", response.data);
      products.value = [];
    }

  } catch (err) {
    console.error(`Error fetching foodie products (Category ID: ${categoryId}):`, err);
    if (err.response) {
      error.value = `Error: ${err.response.status} - ${err.response.data.message || 'Could not load products.'}`;
    } else if (err.request) {
      error.value = 'Network Error: Could not connect.';
    } else {
      error.value = 'An unexpected error occurred.';
    }
     products.value = [];
  } finally {
    loading.value = false;
  }
};

const filterProducts = (categoryId) => {
  selectedCategoryId.value = categoryId;
  fetchFoodieProducts(categoryId);
};

onMounted(() => {
  fetchFoodieProducts(null); // Load initial products (ALL)
});

</script>

<style scoped>
.alert {
  margin: 20px 0;
}

.filter-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.3s ease;
  text-transform: uppercase;
  font-weight: 600;
}

.filter-button:hover {
  color: #343a40;
}

.filter-button.active {
  color: var(--bs-primary);
  font-weight: 700;
  border-bottom: 2px solid var(--bs-primary);
  padding-bottom: 2px;
}

.row > [class*='col-'] {
    padding-left: 1rem;
    padding-right: 1rem;
}
</style>