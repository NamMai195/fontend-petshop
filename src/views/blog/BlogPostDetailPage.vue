<template>
  <div class="container py-5">
    <div class="mb-4"> 
       <button @click="goBack" class="btn btn-outline-secondary btn-sm">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left me-1" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
          </svg>
         Quay lại
       </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <p>Đang tải bài viết...</p>
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <h1>Lỗi tải bài viết</h1>
      <p>{{ error }}</p>
      <p><i>Vui lòng kiểm tra Console (F12) để biết chi tiết lỗi.</i></p>
    </div>

    <div v-else-if="post" class="blog-post">
      <h1 class="mb-3">{{ post.title }}</h1>
      <div class="blog-post-meta text-muted mb-4">
        <span v-if="post.author" class="me-3">
          <i class="bi bi-person"></i> {{ post.author }}
        </span>
        <span v-if="post.createdAt">
          <i class="bi bi-calendar"></i> {{ formatDate(post.createdAt) }}
        </span>
      </div>
      <img
        v-if="post.imageUrl"
        :src="post.imageUrl"
        :alt="post.title"
        class="img-fluid rounded mb-4 blog-post-image"
      />
      <div v-html="post.content" class="blog-post-content"></div>
    </div>

    <div v-else class="alert alert-warning">
      <h1>Không tìm thấy bài viết</h1>
      <p>Rất tiếc, không tìm thấy bài viết nào với ID "{{ props.id || 'ID không xác định' }}".</p>
      <p><i>Hãy kiểm tra lại ID trong URL và dữ liệu trên Firestore.</i></p>
      <router-link to="/blog" class="btn btn-primary">Quay lại danh sách Blog</router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const post = ref(null);
const loading = ref(true);
const error = ref(null);

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const goBack = () => {
  router.back();
};

const fetchPost = async (id) => {
  loading.value = true;
  error.value = null;
  
  try {
    const docRef = doc(db, 'blogPosts', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      post.value = {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      error.value = 'Không tìm thấy bài viết';
    }
  } catch (err) {
    console.error('Error fetching post:', err);
    error.value = 'Có lỗi xảy ra khi tải bài viết';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.params.id) {
    fetchPost(route.params.id);
  } else {
    error.value = 'ID bài viết không hợp lệ';
    loading.value = false;
  }
});
</script>

<style scoped>
.blog-post {
  max-width: 800px;
  margin: 0 auto;
}

.blog-post-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
}

.blog-post-content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.blog-post-meta {
  font-size: 0.9rem;
}

.blog-post-meta i {
  margin-right: 0.3rem;
}
</style>