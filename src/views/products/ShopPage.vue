<template>
  <div class="container py-5">
    <h1 v-if="currentSearchTerm" class="mb-4">Kết quả tìm kiếm cho: "{{ currentSearchTerm }}"</h1>
    <h1 v-else class="mb-4">Cửa hàng</h1>

    <div class="row">
      <div class="col-lg-3 col-md-4 mb-4 mb-md-0">
        <h5 class="mb-3">Danh mục</h5>
        <div v-if="loadingCategories" class="text-muted small">Đang tải danh mục...</div>
        <div v-else-if="errorCategories" class="text-danger small">{{ errorCategories }}</div>
        <ul v-else class="list-group category-list">
          <li
            class="list-group-item list-group-item-action"
            :class="{ active: selectedCategoryId === null && !currentSearchTerm }"
            @click="selectCategory(null)"
          >
            Tất cả sản phẩm
          </li>
          <li
            v-for="category in parentCategories"
            :key="category.id"
            class="list-group-item list-group-item-action"
            :class="{ active: selectedCategoryId === category.id && !currentSearchTerm }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>

      <div class="col-lg-9 col-md-8">
        <div v-if="loadingProducts" class="text-center my-5 py-5">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Đang tải sản phẩm...</p>
        </div>

        <div v-else-if="errorProducts" class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Lỗi tải sản phẩm</h4>
          <p>{{ errorProducts }}</p>
        </div>

        <div v-else-if="products.length === 0" class="text-center text-muted my-5 py-5">
            <p v-if="currentSearchTerm">Không tìm thấy sản phẩm nào khớp với từ khóa "{{ currentSearchTerm }}".</p>
            <p v-else>Không có sản phẩm nào trong danh mục này.</p>
        </div>

        <div v-else>
          <div class="row g-3">
            <div
              v-for="product in products"
              :key="product.id"
              class="col-6 col-lg-4"
            >
              <ProductCard :product="product" />
            </div>
          </div>

          <nav v-if="totalPages > 1" aria-label="Product pagination" class="mt-5 d-flex justify-content-center">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" href="#" aria-label="Previous" @click.prevent="changePage(currentPage - 1)">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li
                v-for="pageNumber in totalPages"
                :key="pageNumber"
                class="page-item"
                :class="{ active: pageNumber - 1 === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(pageNumber - 1)">{{ pageNumber }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
                <a class="page-link" href="#" aria-label="Next" @click.prevent="changePage(currentPage + 1)">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ProductCard from '../components/UI/ProductCard.vue'; // Đảm bảo đường dẫn đúng

const products = ref([]);
const parentCategories = ref([]);
const selectedCategoryId = ref(null);
const currentSearchTerm = ref(''); // Thêm state cho từ khóa tìm kiếm

const loadingProducts = ref(true);
const loadingCategories = ref(true);
const errorProducts = ref(null);
const errorCategories = ref(null);

const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = ref(12); // Có thể tăng nếu muốn

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // Sử dụng biến môi trường
const apiClient = axios.create({ baseURL: API_BASE_URL });

// Thêm interceptor để gửi token nếu có
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


const route = useRoute();
const router = useRouter();

const fetchParentCategories = async () => {
  // Giữ nguyên hàm fetchParentCategories
  loadingCategories.value = true;
  errorCategories.value = null;
  try {
    console.log("[ShopPage] Fetching categories...");
    const response = await apiClient.get('/api/v1/categories', { params: { size: 200 } });

     let allCategories = [];
     if (Array.isArray(response.data)) {
       allCategories = response.data;
     } else if (response.data && Array.isArray(response.data.content)) {
       allCategories = response.data.content;
     } else {
        console.warn("[ShopPage] Unexpected Category API response structure:", response.data);
        throw new Error("Invalid category data format");
     }
    parentCategories.value = allCategories.filter(cat => !cat.parentCategoryId);
    console.log(`[ShopPage] Found ${parentCategories.value.length} parent categories.`);
  } catch (err) {
    console.error("[ShopPage] Error fetching categories:", err);
    errorCategories.value = 'Không thể tải danh mục.';
  } finally {
    loadingCategories.value = false;
  }
};

// Sửa hàm fetchProducts để nhận searchTerm
const fetchProducts = async (categoryId = null, page = 0, searchTerm = null, size = pageSize.value) => {
  loadingProducts.value = true;
  errorProducts.value = null;
  currentSearchTerm.value = searchTerm || ''; // Cập nhật search term hiện tại

  const params = {
      page,
      size,
      sort: 'createdAt,desc' // Giữ lại sort hoặc thay đổi nếu cần
  };

  // Ưu tiên searchTerm hơn categoryId
  if (searchTerm) {
    params.keyword = searchTerm;
    console.log(`[ShopPage] Fetching products with SEARCH TERM: "${searchTerm}", Page: ${page}`);
  } else if (categoryId !== null) {
    params.categoryId = categoryId;
    console.log(`[ShopPage] Fetching products for CATEGORY: ${categoryId}, Page: ${page}`);
  } else {
     console.log(`[ShopPage] Fetching ALL products, Page: ${page}`);
  }

  try {
    const response = await apiClient.get('/api/v1/products', { params });

    if (response.data && typeof response.data === 'object') {
      products.value = response.data.content || [];
      totalPages.value = response.data.totalPages || 0;
      currentPage.value = response.data.number || 0;
      console.log(`[ShopPage] Loaded ${products.value.length} products. Total pages: ${totalPages.value}`);

      // Cập nhật lại selectedCategoryId dựa trên kết quả fetch
      // Nếu đang tìm kiếm, bỏ chọn category
      if (searchTerm) {
          selectedCategoryId.value = null;
      } else {
          selectedCategoryId.value = categoryId;
      }

    } else {
      console.warn("[ShopPage] Unexpected Product API response structure:", response.data);
      throw new Error("Invalid product data format");
    }

  } catch (err) {
    console.error("[ShopPage] Error fetching products:", err);
    errorProducts.value = 'Không thể tải danh sách sản phẩm.';
     if (err.response) {
       console.error("API Error Data:", err.response.data);
       errorProducts.value += ` (Lỗi: ${err.response.status})`;
     }
     products.value = [];
     totalPages.value = 0;
     currentPage.value = 0; // Reset page khi có lỗi
  } finally {
    loadingProducts.value = false;
  }
};

// Sửa hàm selectCategory để xóa search term khỏi URL
const selectCategory = (categoryId) => {
  console.log('[ShopPage] Category selected:', categoryId);
  // Chỉ fetch lại nếu category thay đổi VÀ không phải đang chọn category hiện tại
  if (selectedCategoryId.value !== categoryId || currentSearchTerm.value) {
    fetchProducts(categoryId, 0, null, pageSize.value); // Fetch theo category mới, bỏ search term

    // Cập nhật URL, xóa search và page
    const query = { ...route.query };
    delete query.search;
    delete query.page;
    if (categoryId !== null) {
      query.category = categoryId;
    } else {
      delete query.category;
    }
    router.push({ query });
  }
};

// Sửa hàm changePage để truyền đúng searchTerm hoặc categoryId
const changePage = (pageNumber) => {
  if (pageNumber >= 0 && pageNumber < totalPages.value && pageNumber !== currentPage.value) {
    console.log(`[ShopPage] Changing to page ${pageNumber}`);
    // Fetch lại với categoryId hiện tại HOẶC searchTerm hiện tại
    fetchProducts(selectedCategoryId.value, pageNumber, currentSearchTerm.value || null, pageSize.value);

    // Cập nhật URL, giữ nguyên search hoặc category
    router.push({ query: { ...route.query, page: pageNumber } });
    // Cuộn lên đầu trang (tùy chọn)
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Sửa onMounted để đọc cả search term ban đầu
onMounted(() => {
  const initialSearch = route.query.search || null;
  const initialCategory = route.query.category;
  const initialPage = parseInt(route.query.page) || 0;
  const categoryIdToLoad = initialSearch ? null : (initialCategory ? parseInt(initialCategory) : null);

  console.log(`[ShopPage] Mounting. Initial search: "${initialSearch}", category: ${initialCategory}, page: ${initialPage}`);

  // Fetch categories luôn cần thiết
  fetchParentCategories();
  // Fetch products dựa trên URL ban đầu
  fetchProducts(categoryIdToLoad, initialPage, initialSearch, pageSize.value);
});

// Sửa watch để xử lý cả search, category và page
watch(() => route.query, (newQuery, oldQuery) => {
   console.log('[ShopPage] Route query changed:', newQuery);

   const newSearch = newQuery.search || null;
   const newCategory = newQuery.category || null;
   const newPage = parseInt(newQuery.page) || 0;

   const oldSearch = oldQuery.search || null;
   const oldCategory = oldQuery.category || null;
   const oldPage = parseInt(oldQuery.page) || 0;

   // Chỉ fetch lại nếu search, category hoặc page thực sự thay đổi
   if (newSearch !== oldSearch || newCategory !== oldCategory || newPage !== oldPage) {
       console.log('[ShopPage] Query change detected, refetching products...');
       const categoryIdToFetch = newSearch ? null : (newCategory ? parseInt(newCategory) : null);
       fetchProducts(categoryIdToFetch, newPage, newSearch, pageSize.value);
   } else {
        console.log('[ShopPage] Query change detected, but relevant parameters are the same. No refetch.');
   }
}, { deep: true }); // deep: true vẫn cần thiết để phát hiện thay đổi trong object query

</script>

<style scoped>
/* Style giữ nguyên như trước */
h1, h5 { font-weight: 600; color: #4E342E; }
.category-list .list-group-item { cursor: pointer; font-size: 0.95rem; border: none; padding: 0.5rem 0.75rem; background-color: transparent; transition: background-color 0.2s ease, color 0.2s ease; color: #4E342E; }
.category-list .list-group-item:hover { background-color: #F5F1EE; color: #4E342E; }
.category-list .list-group-item.active { color: #4E342E; background-color: #BCAAA4; font-weight: 600; border-radius: 0.25rem; }
.shop-spinner { color: #BCAAA4; }
.col-6, .col-lg-4 { display: flex; }
.col-6 > :deep(.card-container), .col-lg-4 > :deep(.card-container) { flex-grow : 1; display: flex; flex-direction: column; height: 100%; }
.pagination .page-link { cursor: pointer; color: #8D6E63; border: 1px solid #D7CCC8; margin: 0 2px; border-radius: 0.25rem; }
.pagination .page-item.disabled .page-link { cursor: default; color: #A1887F; background-color: transparent; border-color: #D7CCC8; }
.pagination .page-item.active .page-link { z-index: 3; color: #4E342E; background-color: #BCAAA4; border-color: #BCAAA4; }
.pagination .page-link:hover { background-color: #F5F1EE; color: #4E342E; border-color: #D7CCC8; }
.pagination .page-item.active .page-link:hover { background-color: #BCAAA4; border-color: #BCAAA4; color: #4E342E; }
</style>