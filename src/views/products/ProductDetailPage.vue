<template>
  <div class="product-detail-page container py-4 py-md-5">
    <div v-if="loadingProduct" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Đang tải thông tin sản phẩm...</p>
    </div>

    <div v-else-if="errorProduct" class="alert alert-danger text-center" role="alert">
      {{ errorProduct }}
    </div>

    <div v-else-if="product">
      <div class="row g-4 g-lg-5">
        <div class="col-md-6">
          <div class="product-images">
            <div class="main-image mb-3 text-center">
              <img
                :src="selectedImage || '/placeholder-image.png'"
                class="img-fluid rounded shadow-sm"
                :alt="product.name"
                @error="onImageError(true)"
                style="max-height: 500px; object-fit: contain;"
              >
            </div>
            <div v-if="product.imageURLs && product.imageURLs.length > 1" class="thumbnails d-flex flex-wrap justify-content-center gap-2">
              <img
                v-for="(imgUrl, index) in product.imageURLs"
                :key="index"
                :src="imgUrl"
                class="img-thumbnail rounded"
                :class="{ 'active': imgUrl === selectedImage }"
                :alt="`${product.name} - thumbnail ${index + 1}`"
                @click="selectThumbnail(imgUrl)"
                @error="onImageError(false)"
                style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;"
              >
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="product-info">
            <h1 class="product-title mb-3">{{ product.name }}</h1>
            <div class="product-meta mb-3 text-muted small">
              <span v-if="product.sku">SKU: {{ product.sku }}</span>
              <span v-if="product.category" class="ms-3">Danh mục: {{ product.category.name }}</span>
            </div>
            <p class="product-price h3 text-primary mb-3">{{ formatPrice(product.price) }}</p>

             <div class="product-stock mb-3" :class="product.stockQuantity > 0 ? 'text-success' : 'text-danger'">
              <strong v-if="product.stockQuantity > 0">Còn hàng ({{ product.stockQuantity }} sản phẩm)</strong>
              <strong v-else>Hết hàng</strong>
            </div>

            <p class="product-description mb-4">{{ product.description }}</p>

            <div class="quantity-selector d-flex align-items-center mb-4">
              <label for="quantity" class="form-label me-3 mb-0">Số lượng:</label>
              <div class="input-group" style="max-width: 150px;">
                <button class="btn btn-outline-secondary" type="button" @click="decrementQuantity" :disabled="quantity <= 1">-</button>
                <input
                  type="number"
                  class="form-control text-center"
                  id="quantity"
                  v-model.number="quantity"
                  min="1"
                  :max="product.stockQuantity > 0 ? product.stockQuantity : 1"
                  :readonly="product.stockQuantity <= 0"
                  aria-label="Quantity"
                >
                <button class="btn btn-outline-secondary" type="button" @click="incrementQuantity" :disabled="quantity >= product.stockQuantity || product.stockQuantity <= 0">+</button>
              </div>
            </div>

            <div class="action-buttons">
              <button
                class="btn btn-primary btn-lg me-2"
                @click="handleAddToCart"
                :disabled="isAddingToCart || product.stockQuantity <= 0"
              >
                <span v-if="isAddingToCart" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-else>Thêm vào giỏ hàng</span>
              </button>
              <button class="btn btn-outline-danger btn-lg" title="Thêm vào yêu thích" @click="handleAddToWishlist">
                 <iconify-icon icon="fluent:heart-28-regular"></iconify-icon>
               </button>
            </div>
             <div v-if="addToCartSuccess" class="alert alert-success mt-3 small">Đã thêm vào giỏ hàng!</div>
             <div v-if="addToCartError" class="alert alert-danger mt-3 small">{{ addToCartError }}</div>
          </div>
        </div>
      </div>

      <hr class="my-5">

      <div class="reviews-section">
        <h2 class="mb-4">Đánh giá sản phẩm ({{ totalReviews }})</h2>

        <div v-if="isUserLoggedIn" class="review-form card mb-4">
           <div class="card-body">
             <h5 class="card-title">Viết đánh giá của bạn</h5>
             <div class="mb-3">
               <label class="form-label">Đánh giá:</label>
               <div>
                 <span v-for="star in 5" :key="star"
                       @click="newReview.rating = star"
                       style="cursor: pointer; font-size: 1.5rem; margin-right: 5px;"
                       :class="{'text-warning': star <= newReview.rating, 'text-muted': star > newReview.rating}">
                   ★
                 </span>
               </div>
             </div>
             <div class="mb-3">
               <label for="reviewComment" class="form-label">Bình luận:</label>
               <textarea
                 class="form-control"
                 id="reviewComment"
                 rows="3"
                 v-model="newReview.comment"
                 placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
               ></textarea>
             </div>
             <button
                class="btn btn-success"
                @click="handleSubmitReview"
                :disabled="isSubmittingReview || newReview.rating === 0">
                <span v-if="isSubmittingReview" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-else>Gửi đánh giá</span>
             </button>
             <div v-if="submitReviewError" class="alert alert-danger mt-3 small">{{ submitReviewError }}</div>
             <div v-if="submitReviewSuccess" class="alert alert-success mt-3 small">Gửi đánh giá thành công!</div>
           </div>
        </div>
        <div v-else class="alert alert-info">
          Vui lòng <router-link :to="{ name: 'login' }">đăng nhập</router-link> để viết đánh giá.
        </div>

        <div class="review-list">
          <div v-if="loadingReviews" class="text-center">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span class="ms-2">Đang tải đánh giá...</span>
          </div>
          <div v-else-if="errorReviews" class="alert alert-warning">{{ errorReviews }}</div>
          <div v-else-if="reviews.length === 0" class="text-center text-muted">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
          <div v-else>
            <div v-for="review in reviews" :key="review.reviewId" class="review-item border-bottom pb-3 mb-3">
              <div class="review-author d-flex align-items-center mb-2">
                <strong class="me-2">{{ review.user?.username || 'Ẩn danh' }}</strong>
                <span class="text-muted small">- {{ formatDate(review.createdAt) }}</span>
              </div>
              <div class="review-rating mb-2">
                <span v-for="star in 5" :key="star" class="me-1"
                      :class="{'text-warning': star <= review.rating, 'text-light': star > review.rating}"
                      style="font-size: 1rem;">★</span>
              </div>
              <p class="review-comment mb-0">{{ review.comment }}</p>
            </div>

            <nav v-if="reviewPageInfo.totalPages > 1" aria-label="Review pagination">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: reviewPageInfo.currentPage === 0 }">
                  <a class="page-link" href="#" @click.prevent="changeReviewPage(reviewPageInfo.currentPage - 1)">Trước</a>
                </li>
                <li class="page-item" v-for="pageNumber in reviewPageInfo.totalPages" :key="pageNumber" :class="{ active: pageNumber - 1 === reviewPageInfo.currentPage }">
                  <a class="page-link" href="#" @click.prevent="changeReviewPage(pageNumber - 1)">{{ pageNumber }}</a>
                </li>
                <li class="page-item" :class="{ disabled: reviewPageInfo.currentPage === reviewPageInfo.totalPages - 1 }">
                  <a class="page-link" href="#" @click.prevent="changeReviewPage(reviewPageInfo.currentPage + 1)">Sau</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Thêm useRouter nếu cần điều hướng
import axios from 'axios';
// Giả sử bạn dùng Pinia cho auth và cart
// import { useAuthStore } from '@/stores/auth';
// import { useCartStore } from '@/stores/cart';

// --- Stores (Ví dụ) ---
// const authStore = useAuthStore();
// const cartStore = useCartStore();
// const isUserLoggedIn = computed(() => authStore.isLoggedIn);
// Tạm thời giả định:
const isUserLoggedIn = ref(false); // <<<<=== THAY BẰNG LOGIC KIỂM TRA ĐĂNG NHẬP THỰC TẾ
// Kiểm tra đăng nhập khi component mount (ví dụ đơn giản)
onMounted(() => {
    // Ví dụ: kiểm tra token trong localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
        isUserLoggedIn.value = true;
        // Bạn có thể thêm bước validate token ở đây nếu cần
    }
});


// --- Axios Client ---
// Tạo instance gốc, header Authorization sẽ thêm khi cần
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
});

// Hàm thêm Auth Header động
const getAuthHeaders = () => {
  // Ví dụ lấy token từ localStorage
  const token = localStorage.getItem('accessToken');
  // Hoặc: const token = authStore.accessToken; // Nếu dùng Pinia
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};


// --- Route & Router ---
const route = useRoute();
const router = useRouter(); // Dùng để điều hướng, ví dụ khi chưa đăng nhập

// --- State ---
const product = ref(null);
const reviews = ref([]);
const totalReviews = ref(0);
const reviewPageInfo = ref({ currentPage: 0, totalPages: 0, size: 5 }); // Size nhỏ hơn để dễ test pagination
const selectedImage = ref('');
const quantity = ref(1);
const newReview = reactive({ rating: 0, comment: '' });

const loadingProduct = ref(true);
const loadingReviews = ref(false);
const isAddingToCart = ref(false);
const isSubmittingReview = ref(false);

const errorProduct = ref(null);
const errorReviews = ref(null);
const addToCartError = ref(null);
const submitReviewError = ref(null);
const addToCartSuccess = ref(false);
const submitReviewSuccess = ref(false);


// --- Computed Properties ---
const productId = computed(() => route.params.id);

// --- Functions ---

// Lấy chi tiết sản phẩm
const fetchProductDetails = async (id) => {
  loadingProduct.value = true;
  errorProduct.value = null;
  product.value = null; // Reset product data
  try {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    product.value = response.data;
    // Đặt ảnh đầu tiên làm ảnh chính mặc định
    if (product.value?.imageURLs && product.value.imageURLs.length > 0) {
      selectedImage.value = product.value.imageURLs[0];
    } else {
         selectedImage.value = ''; // Không có ảnh
    }
    quantity.value = 1; // Reset số lượng về 1 khi tải sản phẩm mới
  } catch (err) {
    console.error(`Lỗi khi lấy chi tiết sản phẩm ${id}:`, err);
    errorProduct.value = "Không thể tải thông tin sản phẩm. Vui lòng thử lại.";
  } finally {
    loadingProduct.value = false;
  }
};

// Lấy đánh giá sản phẩm (có phân trang)
const fetchProductReviews = async (id, page = 0, size = 5) => {
  loadingReviews.value = true;
  errorReviews.value = null;
  try {
      // API này có thể public hoặc không, thử gọi không cần token trước
    const response = await apiClient.get(`/api/v1/products/${id}/reviews`, {
      params: { page, size, sort: 'createdAt,desc' } // Sắp xếp mới nhất trước
    });
    // API trả về PageReviewResponse
    reviews.value = response.data.content || [];
    totalReviews.value = response.data.totalElements || 0;
    reviewPageInfo.value = {
        currentPage: response.data.number || 0,
        totalPages: response.data.totalPages || 0,
        size: response.data.size || size,
    };

  } catch (err) {
    console.error(`Lỗi khi lấy đánh giá sản phẩm ${id}:`, err);
     if (err.response && err.response.status === 401) {
        // Nếu lỗi 401, có thể API reviews yêu cầu đăng nhập để xem? Hoặc API lỗi.
        errorReviews.value = "Lỗi tải đánh giá (Có thể cần đăng nhập?).";
     } else {
        errorReviews.value = "Không thể tải đánh giá sản phẩm.";
     }
     reviews.value = []; // Đảm bảo là mảng rỗng khi lỗi
     totalReviews.value = 0;
  } finally {
    loadingReviews.value = false;
  }
};

// Chọn ảnh thumbnail
const selectThumbnail = (imageUrl) => {
  selectedImage.value = imageUrl;
};

// Tăng/giảm số lượng
const incrementQuantity = () => {
  if (product.value && quantity.value < product.value.stockQuantity) {
    quantity.value++;
  }
};
const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Xử lý thêm vào giỏ hàng
const handleAddToCart = async () => {
  if (!isUserLoggedIn.value) {
    // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
    router.push({ name: 'login' }); // Giả sử có route tên 'login'
    return;
  }
  if (!product.value || product.value.stockQuantity <= 0) return;

  isAddingToCart.value = true;
  addToCartError.value = null;
  addToCartSuccess.value = false;

  try {
    const payload = {
      productId: product.value.id,
      quantity: quantity.value
    };
    await apiClient.post('/api/v1/cart/items', payload, {
       headers: getAuthHeaders() // Thêm header Authorization
    });
    // Thành công -> có thể cập nhật state giỏ hàng (nếu dùng store)
    // cartStore.fetchCart(); // Ví dụ
    addToCartSuccess.value = true;
    setTimeout(() => { addToCartSuccess.value = false }, 3000); // Ẩn thông báo sau 3s

  } catch (err) {
    console.error("Lỗi khi thêm vào giỏ hàng:", err);
     if (err.response && err.response.status === 401) {
        addToCartError.value = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        // Có thể logout user hoặc điều hướng login
     } else {
        addToCartError.value = "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.";
     }
     setTimeout(() => { addToCartError.value = null }, 5000); // Ẩn lỗi sau 5s
  } finally {
    isAddingToCart.value = false;
  }
};

// Xử lý thêm vào Wishlist (Ví dụ)
const handleAddToWishlist = () => {
   if (!isUserLoggedIn.value) {
    alert("Vui lòng đăng nhập để thêm vào yêu thích.");
    router.push({ name: 'login' });
    return;
  }
   if (!product.value) return;
   console.log('Adding to wishlist (logic chưa implement):', product.value.id);
   alert('Chức năng yêu thích chưa được cài đặt!');
   // TODO: Implement Wishlist API call
}

// Xử lý gửi đánh giá
const handleSubmitReview = async () => {
  if (!isUserLoggedIn.value || !product.value || newReview.rating === 0) return;

  isSubmittingReview.value = true;
  submitReviewError.value = null;
  submitReviewSuccess.value = false;

  try {
    const payload = {
      rating: newReview.rating,
      comment: newReview.comment
    };
    const response = await apiClient.post(`/api/v1/products/${product.value.id}/reviews`, payload, {
       headers: getAuthHeaders() // Thêm header Authorization
    });

    // Thành công: Thêm review mới vào đầu danh sách và reset form
    reviews.value.unshift(response.data); // Thêm vào đầu mảng
    totalReviews.value++;
    newReview.rating = 0;
    newReview.comment = '';
    submitReviewSuccess.value = true;
    setTimeout(() => { submitReviewSuccess.value = false }, 3000);

  } catch (err) {
    console.error("Lỗi khi gửi đánh giá:", err);
    if (err.response && err.response.status === 401) {
        submitReviewError.value = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
     } else if (err.response && err.response.data?.message) {
         submitReviewError.value = `Lỗi: ${err.response.data.message}`;
     }
     else {
        submitReviewError.value = "Gửi đánh giá thất bại. Vui lòng thử lại.";
     }
     setTimeout(() => { submitReviewError.value = null }, 5000);
  } finally {
    isSubmittingReview.value = false;
  }
};

// Đổi trang review
const changeReviewPage = (page) => {
    if(page >= 0 && page < reviewPageInfo.value.totalPages && page !== reviewPageInfo.value.currentPage) {
        fetchProductReviews(productId.value, page, reviewPageInfo.value.size);
    }
}


// --- Helpers ---
const formatPrice = (price) => {
  if (price === null || price === undefined) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};


const onImageError = (isMainImage = false, event) => {
  console.warn("Lỗi tải ảnh:", event?.target?.src);
  const placeholder = '/placeholder-image.png';
  if (event && event.target) {
    event.target.src = placeholder;
  }
   // Nếu ảnh chính bị lỗi và chưa được đặt thành placeholder, thì đặt nó
   if(isMainImage && selectedImage.value !== placeholder) {
       selectedImage.value = placeholder;
   }
};


// --- Initial Data Load ---
const loadData = (id) => {
  if (!id) {
      errorProduct.value = "ID sản phẩm không hợp lệ.";
      loadingProduct.value = false;
      return;
  }
  // Gọi đồng thời fetch product và fetch reviews trang đầu tiên
  Promise.all([
    fetchProductDetails(id),
    fetchProductReviews(id, 0, reviewPageInfo.value.size) // Lấy trang đầu tiên
  ]);
};


// --- Lifecycle and Watchers ---
onMounted(() => {
  loadData(productId.value);
});

watch(productId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadData(newId);
  }
});

</script>

<style scoped>
.product-detail-page {
  /* Thêm style tổng thể nếu cần */
}

/* Image Gallery */
.main-image img {
  max-width: 100%;
  height: auto;
  border: 1px solid #eee;
}
.thumbnails img {
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}
.thumbnails img:hover {
  border-color: #ccc;
}
.thumbnails img.active {
  border-color: #0d6efd; /* Bootstrap primary color */
}

/* Product Info */
.product-title {
  font-weight: 600;
}
.product-price {
  font-weight: 700;
}
.product-stock strong {
    font-weight: 600;
}

/* Quantity Selector */
.quantity-selector .form-control {
    /* Tùy chỉnh giao diện nếu cần */
    border-left: none;
    border-right: none;
    box-shadow: none;
}
.quantity-selector .btn {
    z-index: 1; /* Để nút không bị input đè lên */
}


/* Reviews Section */
.reviews-section h2 {
  font-weight: 600;
  color: #444;
}
.review-form .card {
    background-color: #f8f9fa;
}

.review-item {
    /* Style cho từng review */
}
.review-author strong {
    font-weight: 600;
}
.pagination .page-link {
    cursor: pointer;
}
</style>