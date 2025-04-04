<template>
    <div class="category-products-page container py-5">
      <div v-if="loading" class="text-center">
        <p>Đang tải dữ liệu...</p>
        </div>
  
      <div v-else-if="error" class="alert alert-danger text-center" role="alert">
        {{ error }}
      </div>
  
      <div v-else>
        <h1 class="mb-4">{{ parentCategory?.name || 'Danh mục sản phẩm' }}</h1>
        <p v-if="parentCategory?.description">{{ parentCategory.description }}</p>
        <hr>
  
        <div v-if="subCategories.length === 0" class="text-center my-5">
          Không tìm thấy danh mục con nào.
        </div>
  
        <div v-else v-for="subCat in subCategories" :key="subCat.id" class="sub-category-section mb-5">
          <h2 class="sub-category-title">{{ subCat.name }}</h2>
  
          <div v-if="loadingProducts[subCat.id]" class="text-center text-muted small my-3">
            Đang tải sản phẩm cho {{ subCat.name }}...
          </div>
  
          <div v-else-if="productErrors[subCat.id]" class="alert alert-warning small" role="alert">
            Lỗi khi tải sản phẩm cho {{ subCat.name }}: {{ productErrors[subCat.id] }}
          </div>
  
          <div v-else-if="productsBySubCategory[subCat.id]?.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            <div v-for="product in productsBySubCategory[subCat.id]" :key="product.id" class="col">
              <div class="card h-100 product-card">
                <img
                  :src="product.imageURLs?.[0] || '/placeholder-image.png'"
                  class="card-img-top product-image"
                  :alt="product.name"
                  @error="onImageError"
                >
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title product-name">{{ product.name }}</h5>
                  <p class="card-text product-price mt-auto">{{ formatPrice(product.price) }}</p>
                  <router-link :to="{ name: 'product-detail', params: { productId: product.id } }" class="btn btn-primary btn-sm stretched-link">
                    Xem chi tiết
                  </router-link>
                </div>
              </div>
            </div>
          </div>
  
          <div v-else class="text-center text-muted my-3">
            Không có sản phẩm nào trong mục {{ subCat.name }}.
          </div>
          <hr v-if="subCategories.length > 1" class="mt-5"> </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, reactive } from 'vue';
  import { useRoute } from 'vue-router'; // Import useRoute
  import axios from 'axios';
  
  // --- Props (nếu bạn dùng props: true trong router) ---
  // const props = defineProps({
  //   categoryId: {
  //     type: [String, Number],
  //     required: true
  //   }
  // });
  
  // --- Axios Client ---
  const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  // --- Route ---
  const route = useRoute(); // Sử dụng route để lấy params
  
  // --- State ---
  const parentCategory = ref(null);        // Thông tin danh mục cha hiện tại
  const allCategories = ref([]);           // Lưu tất cả categories để tìm con
  const subCategories = ref([]);           // Danh sách các danh mục con trực tiếp
  const productsBySubCategory = reactive({}); // Object lưu sản phẩm theo ID danh mục con
  const loading = ref(true);               // Loading tổng thể (cho danh mục cha và con)
  const loadingProducts = reactive({});    // Object lưu trạng thái loading cho từng mục con
  const error = ref(null);                 // Lỗi tổng thể
  const productErrors = reactive({});      // Object lưu lỗi cho từng mục con
  
  // --- Functions ---
  
  // Lấy chi tiết danh mục (cha)
  const fetchCategoryDetails = async (id) => {
    try {
      const response = await apiClient.get(`/api/v1/categories/${id}`);
      parentCategory.value = response.data;
    } catch (err) {
      console.error(`Lỗi khi lấy chi tiết danh mục ${id}:`, err);
      // Có thể đặt lỗi cụ thể hơn nếu cần
      error.value = `Không thể tải thông tin danh mục chính (ID: ${id}).`;
      parentCategory.value = null; // Đảm bảo không hiển thị thông tin cũ
    }
  };
  
  // Lấy tất cả danh mục (để tìm con)
  const fetchAllCategories = async () => {
    try {
      const response = await apiClient.get('/api/v1/categories');
      allCategories.value = response.data;
    } catch (err) {
      console.error("Lỗi khi lấy tất cả danh mục:", err);
      error.value = "Không thể tải danh sách danh mục con.";
      allCategories.value = [];
    }
  };
  
  // Tìm danh mục con trực tiếp
  const findSubCategories = (parentId) => {
    const parentIdNum = Number(parentId); // Chắc chắn là số để so sánh
    subCategories.value = allCategories.value.filter(
      cat => cat.parentCategoryId === parentIdNum
    );
  };
  
  // Lấy sản phẩm cho một danh mục con cụ thể
  const fetchProductsForSubCategory = async (subCatId) => {
    loadingProducts[subCatId] = true; // Bắt đầu loading cho mục con này
    productErrors[subCatId] = null;   // Xóa lỗi cũ
    try {
      const response = await apiClient.get('/api/v1/products', {
        params: {
          categoryId: subCatId,
          page: 0, // Có thể thêm phân trang nếu cần
          size: 20 // Lấy 20 sản phẩm đầu tiên
        }
      });
      // API trả về mảng sản phẩm trực tiếp hoặc object phân trang?
      // Giả sử trả về mảng sản phẩm trực tiếp trong response.data
      productsBySubCategory[subCatId] = response.data;
      if (!Array.isArray(response.data)) {
           console.warn(`API /api/v1/products?categoryId=${subCatId} không trả về mảng như mong đợi.`);
           productsBySubCategory[subCatId] = []; // Đảm bảo là mảng
      }
  
    } catch (err) {
      console.error(`Lỗi khi lấy sản phẩm cho danh mục con ${subCatId}:`, err);
      productErrors[subCatId] = `Lỗi tải sản phẩm.`;
      productsBySubCategory[subCatId] = []; // Đảm bảo là mảng rỗng khi có lỗi
    } finally {
      loadingProducts[subCatId] = false; // Kết thúc loading cho mục con này
    }
  };
  
  // Hàm khởi tạo hoặc tải lại dữ liệu dựa trên categoryId
  const loadDataForCategory = async (categoryId) => {
    loading.value = true; // Bật loading tổng thể
    error.value = null;
    parentCategory.value = null;
    subCategories.value = [];
    // Xóa dữ liệu sản phẩm cũ
    for (const key in productsBySubCategory) {
      delete productsBySubCategory[key];
    }
     for (const key in productErrors) {
      delete productErrors[key];
    }
     for (const key in loadingProducts) {
      delete loadingProducts[key];
    }
  
  
    // 1. Lấy chi tiết danh mục cha
    await fetchCategoryDetails(categoryId);
    if (error.value) { // Nếu lỗi ngay từ đầu, dừng lại
        loading.value = false;
        return;
    }
  
    // 2. Lấy tất cả danh mục để tìm con
    await fetchAllCategories();
     if (error.value) { // Nếu lỗi khi lấy danh mục, dừng lại
        loading.value = false;
        return;
    }
  
  
    // 3. Tìm danh mục con
    findSubCategories(categoryId);
  
    // 4. Lấy sản phẩm cho từng danh mục con (chạy song song)
    if (subCategories.value.length > 0) {
      const productPromises = subCategories.value.map(subCat =>
        fetchProductsForSubCategory(subCat.id)
      );
      await Promise.all(productPromises); // Chờ tất cả các lệnh gọi API sản phẩm hoàn thành
    }
  
    loading.value = false; // Tắt loading tổng thể
  };
  
  // --- Helper Functions ---
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Xử lý lỗi tải ảnh
  const onImageError = (event) => {
    event.target.src = '/placeholder-image.png'; // Đường dẫn đến ảnh placeholder của bạn
  };
  
  
  // --- Lifecycle and Watchers ---
  onMounted(() => {
    const categoryId = route.params.categoryId; // Lấy ID từ route params
    // Hoặc: const categoryId = props.categoryId; // Nếu dùng props
    if (categoryId) {
      loadDataForCategory(categoryId);
    } else {
        error.value = "Không tìm thấy ID danh mục.";
        loading.value = false;
    }
  });
  
  // Theo dõi sự thay đổi của route param nếu người dùng điều hướng giữa các trang category
  watch(() => route.params.categoryId, (newCategoryId, oldCategoryId) => {
    if (newCategoryId && newCategoryId !== oldCategoryId) {
      loadDataForCategory(newCategoryId);
    }
  });
  
  </script>
  
  <style scoped>
  .category-products-page h1 {
    color: #333;
  }
  
  .sub-category-section {
    /* background-color: #f9f9f9; */
    padding: 20px 0;
    /* border-radius: 8px; */
  }
  
  .sub-category-title {
    color: #555;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 25px;
  }
  
  .product-card {
    border: 1px solid #eee;
    transition: box-shadow 0.3s ease-in-out;
  }
  .product-card:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    width: 100%;
    height: 200px; /* Điều chỉnh chiều cao cố định */
    object-fit: contain; /* Hoặc 'cover' tùy thiết kế */
    padding: 10px; /* Thêm padding để ảnh không bị sát viền */
    background-color: #fff; /* Nền trắng cho ảnh */
  }
  
  .product-name {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      /* Giới hạn 2 dòng */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      min-height: 2.4em; /* Đảm bảo chiều cao tối thiểu cho 2 dòng */
  }
  
  .product-price {
    font-weight: bold;
    color: #dc3545; /* Màu đỏ cho giá */
    font-size: 1.1rem;
  }
  .card-body {
      padding: 1rem;
  }
  .stretched-link::after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      content: "";
  }
  </style>