<template>
  <section id="categories">
    <div class="container my-3 py-5">
      <div v-if="loading" class="text-center">
        Đang tải danh mục...
      </div>

      <div v-else-if="error" class="alert alert-danger text-center" role="alert">
        {{ error }}
      </div>

      <div v-else class="row my-5">
        <div v-if="categories.length === 0" class="col text-center">
           Không có danh mục chính nào để hiển thị.
        </div>
        <div v-else v-for="category in categories" :key="category.id" class="col text-center">
          <a :href="`/category/${category.id}`" class="categories-item">
            <iconify-icon
              class="category-icon"
              :icon="category.icon"
            ></iconify-icon>
            <h5>{{ category.name }}</h5>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Bỏ defineEmits
import axios from 'axios';

// --- Axios Client (Giữ nguyên) ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    // Không cần 'Authorization'
  }
});

// --- State (Giữ nguyên) ---
const allCategories = ref([]); // Lưu tất cả categories từ API
const loading = ref(true);
const error = ref(null);

// --- Icon Map (Giữ nguyên) ---
const categoryIconMap = {
  'Foodies': 'ph:bowl-food',
  'Bird Shop': 'ph:bird',
  'Dog Shop': 'ph:dog',
  'Fish Shop': 'ph:fish',
  'Cat Shop': 'ph:cat',
};
const defaultIcon = 'ph:package';

// --- Computed Property: Đổi tên thành 'categories' ---
// Vẫn lọc và xử lý categories cấp cao nhất
const categories = computed(() => {
  // Lọc ra những category không có parentCategoryId
  return allCategories.value
    .filter(category => category.parentCategoryId === null || typeof category.parentCategoryId === 'undefined')
    .map(category => ({ // Xử lý thêm icon cho các category đã lọc
      ...category,
      icon: categoryIconMap[category.id] || categoryIconMap[category.name] || defaultIcon
    }));
});



// --- Hàm gọi API (Giữ nguyên) ---
const fetchCategories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/api/v1/categories');
    allCategories.value = response.data;
  } catch (err) {
     console.error("Lỗi khi lấy danh sách categories:", err);
     if (err.response) {
       error.value = `Lỗi ${err.response.status}: Không thể tải danh mục.`;
     } else if (err.request) {
       error.value = "Không thể kết nối đến máy chủ.";
     } else {
       error.value = "Đã xảy ra lỗi khi gửi yêu cầu.";
     }
     allCategories.value = [];
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle Hook (Giữ nguyên) ---
onMounted(() => {
  fetchCategories();
});
</script>

