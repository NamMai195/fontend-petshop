<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-medium">
        {{ totalItems }} products with reviews
      </h1>
    </div>

    <!-- Filters -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="3">
            <VTextField
              v-model="filters.keyword"
              label="Search by product name/SKU"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="fetchProducts"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filters.rating"
              label="Filter by rating"
              variant="outlined"
              density="compact"
              clearable
              :items="[
                { title: '5 stars', value: 5 },
                { title: '4 stars', value: 4 },
                { title: '3 stars', value: 3 },
                { title: '2 stars', value: 2 },
                { title: '1 star', value: 1 }
              ]"
              @update:model-value="fetchProducts"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filters.sortBy"
              label="Sort by"
              variant="outlined"
              density="compact"
              :items="[
                { title: 'Newest first', value: 'newest' },
                { title: 'Oldest first', value: 'oldest' },
                { title: 'Highest rating', value: 'highest' },
                { title: 'Lowest rating', value: 'lowest' }
              ]"
              @update:model-value="fetchProducts"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Statistics -->
    <VCard class="mb-6">
      <VCardTitle class="text-h6 pa-4">
        Review Statistics
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" sm="6" md="3">
            <VCard variant="outlined">
              <VCardText class="text-center">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ statistics.averageRating.toFixed(1) }}
                </div>
                <div class="text-caption">Average Rating</div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VCard variant="outlined">
              <VCardText class="text-center">
                <div class="text-h4 font-weight-bold text-success">
                  {{ calculatePositiveReviewsPercentage() }}%
                </div>
                <div class="text-caption">Positive Reviews</div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VCard variant="outlined">
              <VCardText class="text-center">
                <div class="text-h4 font-weight-bold text-warning">
                  {{ calculateNeutralReviewsPercentage() }}%
                </div>
                <div class="text-caption">Neutral Reviews</div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VCard variant="outlined">
              <VCardText class="text-center">
                <div class="text-h4 font-weight-bold text-error">
                  {{ calculateNegativeReviewsPercentage() }}%
                </div>
                <div class="text-caption">Negative Reviews</div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Rating Distribution Chart -->
        <VRow class="mt-4">
          <VCol cols="12">
            <VCard variant="outlined">
              <VCardText>
                <div class="text-h6 mb-4">Rating Distribution</div>
                <div class="d-flex flex-column gap-2">
                  <div v-for="rating in 5" :key="rating" class="d-flex align-center">
                    <div class="d-flex align-center" style="width: 100px">
                      <VRating
                        :model-value="rating"
                        readonly
                        density="compact"
                        size="small"
                        color="warning"
                        active-color="warning"
                      />
                    </div>
                    <div class="flex-grow-1 mx-2">
                      <VProgressLinear
                        :model-value="(statistics.ratingDistribution[rating] / statistics.totalReviews) * 100"
                        color="warning"
                        height="20"
                        rounded
                      >
                        <template v-slot:default="{ value }">
                          <span class="text-white font-weight-medium">{{ Math.round(value) }}%</span>
                        </template>
                      </VProgressLinear>
                    </div>
                    <div style="width: 60px" class="text-right">
                      {{ statistics.ratingDistribution[rating] }}
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Products Table -->
    <VCard>
      <VCardText>
        <VProgressLinear
          v-if="loading"
          indeterminate
          color="primary"
        ></VProgressLinear>

        <VTable v-else>
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Reviews</th>
              <th>Average Rating</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <div class="d-flex align-center">
                  <VAvatar size="40" class="me-2">
                    <VImg :src="product.imageURLs && product.imageURLs.length > 0 ? product.imageURLs[0] : '/images/placeholder.png'" />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">{{ product.name }}</div>
                    <div class="text-caption">SKU: {{ product.sku }}</div>
                  </div>
                </div>
              </td>
              <td>{{ product.totalReviews || 0 }}</td>
              <td>
                <div class="d-flex align-center">
                  <VRating
                    v-model="product.averageRating"
                    readonly
                    density="compact"
                    size="small"
                    color="warning"
                    active-color="warning"
                  />
                  <span class="ms-2">{{ calculateAverageRating(product) }}/5</span>
                </div>
              </td>
              <td class="text-center">
                <VBtn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="openProductReviews(product)"
                >
                  View Reviews
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Empty State -->
        <div
          v-if="!loading && (!products || products.length === 0)"
          class="text-center py-4"
        >
          <VIcon
            icon="mdi-package-variant"
            size="48"
            color="grey-lighten-1"
            class="mb-2"
          />
          <p class="text-medium-emphasis">No products found</p>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-end mt-4">
          <VPagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Product Reviews Dialog -->
    <VDialog
      v-model="reviewsDialog"
      max-width="1000"
    >
      <VCard v-if="selectedProduct">
        <VCardTitle class="text-h5 pa-4 d-flex justify-space-between align-center">
          <span>Reviews for {{ selectedProduct.name }}</span>
          <VBtn
            icon
            variant="text"
            @click="reviewsDialog = false"
          >
            <VIcon icon="mdi-close" />
          </VBtn>
        </VCardTitle>

        <VCardText class="pt-4">
          <!-- Product Info -->
          <div class="d-flex align-center mb-6">
            <VAvatar size="64" class="me-3">
              <VImg :src="selectedProduct.imageURLs && selectedProduct.imageURLs.length > 0 ? selectedProduct.imageURLs[0] : '/images/placeholder.png'" />
            </VAvatar>
            <div>
              <div class="text-h6">{{ selectedProduct.name }}</div>
              <div class="text-caption">SKU: {{ selectedProduct.sku }}</div>
              <div class="d-flex align-center mt-2">
                <VRating
                  v-model="selectedProduct.averageRating"
                  readonly
                  density="compact"
                  size="small"
                  color="warning"
                  active-color="warning"
                />
                <span class="ms-2">{{ calculateAverageRating(selectedProduct) }}/5</span>
                <span class="ms-2">({{ selectedProduct.totalReviews || 0 }} reviews)</span>
              </div>
            </div>
          </div>

          <!-- Reviews List -->
          <div v-if="productReviews.length > 0">
            <div v-for="review in productReviews" :key="review.reviewId" class="mb-4 pb-4 border-bottom">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="d-flex align-center">
                  <VAvatar size="32" class="me-2">
                    <VIcon icon="mdi-account" />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">{{ review.user?.username }}</div>
                    <div class="text-caption">{{ formatDate(review.createdAt) }}</div>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <VRating
                    v-model="review.rating"
                    readonly
                    density="compact"
                    size="small"
                    color="warning"
                    active-color="warning"
                  />
                </div>
              </div>
              <p class="text-body-1">{{ review.comment || 'No comment' }}</p>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-medium-emphasis">No reviews for this product</p>
          </div>

          <!-- Reviews Pagination -->
          <div class="d-flex justify-end mt-4">
            <VPagination
              v-if="totalReviewPages > 1"
              v-model="reviewPage"
              :length="totalReviewPages"
              :total-visible="7"
              @update:model-value="fetchProductReviews(selectedProduct.id)"
            />
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '../../plugins/axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const loading = ref(false)
const updating = ref(false)
const deleting = ref(false)
const valid = ref(false)
const products = ref([])
const productReviews = ref([])
const totalItems = ref(0)
const totalPages = ref(0)
const page = ref(1)
const reviewPage = ref(1)
const totalReviewPages = ref(0)
const reviewsDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedProduct = ref(null)
const selectedReview = ref(null)
const editedReview = ref(null)
const form = ref(null)
const filters = ref({
  keyword: null,
  rating: null,
  sortBy: 'newest'
})

// Thêm state cho thống kê
const statistics = ref({
  totalReviews: 0,
  averageRating: 0,
  ratingDistribution: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  }
})

// Methods
const calculateStatistics = () => {
  // Reset statistics
  statistics.value = {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  }

  // Tính toán từ tất cả sản phẩm
  products.value.forEach(product => {
    if (product.reviews && product.reviews.length > 0) {
      // Cộng dồn số lượng review
      statistics.value.totalReviews += product.reviews.length

      // Cộng dồn phân bố số sao
      product.reviews.forEach(review => {
        statistics.value.ratingDistribution[review.rating]++
      })
    }
  })

  // Tính điểm trung bình
  if (statistics.value.totalReviews > 0) {
    let totalRating = 0
    for (let rating = 1; rating <= 5; rating++) {
      totalRating += rating * statistics.value.ratingDistribution[rating]
    }
    statistics.value.averageRating = totalRating / statistics.value.totalReviews
  }
}

const calculateAverageRating = (product) => {
  if (!product || product.totalReviews === 0) {
    return '0.0'
  }
  
  return product.averageRating.toFixed(1)
}

const calculatePositiveReviewsPercentage = () => {
  if (!statistics.value.totalReviews) return 0
  
  const positiveReviews = statistics.value.ratingDistribution[5] + statistics.value.ratingDistribution[4]
  return Math.round((positiveReviews / statistics.value.totalReviews) * 100)
}

const calculateNeutralReviewsPercentage = () => {
  if (!statistics.value.totalReviews) return 0
  
  return Math.round((statistics.value.ratingDistribution[3] / statistics.value.totalReviews) * 100)
}

const calculateNegativeReviewsPercentage = () => {
  if (!statistics.value.totalReviews) return 0
  
  const negativeReviews = statistics.value.ratingDistribution[2] + statistics.value.ratingDistribution[1]
  return Math.round((negativeReviews / statistics.value.totalReviews) * 100)
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/v1/products', {
      params: {
        page: page.value - 1,
        size: 10,
        keyword: filters.value.keyword
      }
    })

    console.log('Products response:', response.data) // Log để kiểm tra response

    if (response.data) {
      // Kiểm tra cấu trúc response và lấy danh sách sản phẩm
      const productsData = response.data.content || response.data || []
      
      // Lấy thông tin review cho từng sản phẩm
      const productsWithReviews = await Promise.all(
        productsData.map(async (product) => {
          try {
            const reviewsResponse = await axios.get(`/api/v1/products/${product.id}/reviews`, {
              params: {
                page: 0,
                size: 100, // Lấy nhiều reviews hơn để tính chính xác
                sort: 'createdAt,desc'
              }
            });
            
            const reviews = reviewsResponse.data.content || [];
            const totalReviews = reviewsResponse.data.totalElements || 0;
            
            // Tính điểm trung bình
            let averageRating = 0;
            if (totalReviews > 0) {
              const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
              averageRating = totalRating / totalReviews;
            }
            
            return {
              ...product,
              reviews,
              totalReviews,
              averageRating
            };
          } catch (error) {
            console.error(`Error fetching reviews for product ${product.id}:`, error);
            return {
              ...product,
              reviews: [],
              totalReviews: 0,
              averageRating: 0
            };
          }
        })
      );
      
      // Lọc sản phẩm theo rating nếu có
      let filteredProducts = productsWithReviews;
      if (filters.value.rating) {
        filteredProducts = productsWithReviews.filter(product => 
          Math.round(product.averageRating) === filters.value.rating
        );
      }
      
      // Sắp xếp sản phẩm
      switch (filters.value.sortBy) {
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'highest':
          filteredProducts.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case 'lowest':
          filteredProducts.sort((a, b) => a.averageRating - b.averageRating);
          break;
      }
      
      products.value = filteredProducts;
      totalItems.value = filteredProducts.length;
      totalPages.value = Math.ceil(totalItems.value / 10);

      // Tính toán thống kê sau khi có dữ liệu
      calculateStatistics();
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    if (error.response?.status === 403) {
      toast.error('Access denied. Please check your permissions.')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    } else {
      toast.error('Failed to load products')
    }
  } finally {
    loading.value = false
  }
}

const fetchProductReviews = async (productId) => {
  if (!productId) {
    console.error('Product ID is undefined')
    return
  }
  
  try {
    console.log('Fetching reviews for product:', productId) // Log để kiểm tra productId
    const response = await axios.get(`/api/v1/products/${productId}/reviews`, {
      params: {
        page: reviewPage.value - 1,
        size: 10,
        sort: 'createdAt,desc'
      }
    })

    console.log('Reviews response:', response.data) // Log để kiểm tra response

    if (response.data) {
      productReviews.value = response.data.content || []
      totalReviewPages.value = response.data.totalPages || 0
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    if (error.response?.status === 403) {
      toast.error('Access denied. Cannot view reviews.')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    } else {
      toast.error('Failed to load reviews')
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openProductReviews = async (product) => {
  if (!product || !product.id) {
    console.error('Invalid product:', product) // Log để kiểm tra product
    toast.error('Invalid product information')
    return
  }
  
  console.log('Opening reviews for product:', product) // Log để kiểm tra product
  selectedProduct.value = product
  reviewsDialog.value = true
  reviewPage.value = 1
  await fetchProductReviews(product.id)
}

// Watchers
watch(page, () => {
  fetchProducts()
})

watch(filters, () => {
  page.value = 1
  fetchProducts()
}, { deep: true })

// Lifecycle
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}
</style> 