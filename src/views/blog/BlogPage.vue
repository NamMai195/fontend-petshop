<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
       <h1 class="mb-0">Tất cả bài viết Blog</h1>
       <button @click="goBack" class="btn btn-outline-secondary btn-sm">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left me-1" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
          </svg>
         Quay lại
       </button>
     </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Đang tải danh sách bài viết...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Lỗi tải bài viết</h4>
      <p>{{ error }}</p>
    </div>

     <div v-else-if="posts.length === 0" class="text-center text-muted my-5">
        <p>Chưa có bài viết nào được đăng.</p>
     </div>

    <div v-else class="row g-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="col-lg-4 col-md-6"
      >
        <BlogPostCard :post="post" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Thêm useRouter để sử dụng chức năng điều hướng
import { useRouter } from 'vue-router';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import BlogPostCard from '../components/UI/BlogPostCard.vue';

const BLOG_COLLECTION_NAME = 'blogPosts';

// Lấy instance của router
const router = useRouter();

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchAllPosts = async () => {
  loading.value = true;
  error.value = null;
  const fetchedPosts = [];

  try {
    const postsCollectionRef = collection(db, BLOG_COLLECTION_NAME);
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));

    console.log(`[BlogPage] Đang lấy tất cả bài viết từ collection '${BLOG_COLLECTION_NAME}'...`);
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedPosts.push({
        id: doc.id,
        title: data.title || 'Tiêu đề không có',
        excerpt: data.excerpt || '',
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        slug: data.slug || null
      });
    });

    posts.value = fetchedPosts;
    console.log(`[BlogPage] Đã tải ${fetchedPosts.length} bài viết.`);

  } catch (err) {
    console.error("[BlogPage] Lỗi khi lấy danh sách bài viết:", err);
    error.value = 'Không thể tải danh sách bài viết. Vui lòng thử lại sau.';
     console.error("[BlogPage] Chi tiết lỗi:", JSON.stringify(err, null, 2));
  } finally {
    loading.value = false;
  }
};

// Hàm xử lý sự kiện click nút Quay lại
const goBack = () => {
  router.back(); // Điều hướng về trang trước đó trong lịch sử trình duyệt
  // Hoặc router.go(-1);
};

onMounted(() => {
  fetchAllPosts();
});
</script>

<style scoped>
h1 {
  font-weight: 600;
  color: #333;
}
.row {
    display: flex;
    flex-wrap: wrap;
}
.col-lg-4, .col-md-6 {
    display: flex;
    flex-direction: column;
}
.col-lg-4 > :deep(.card-container),
.col-md-6 > :deep(.card-container) {
    flex-grow: 1;
}

/* Style cho nút quay lại (tùy chỉnh nếu cần) */
.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}
</style>