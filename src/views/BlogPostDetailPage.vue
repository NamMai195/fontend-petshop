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

    <div v-else-if="post">
      <h1>{{ post.title }}</h1>
      <p class="text-muted fst-italic mb-3">
         <span v-if="post.createdAt">Đăng ngày: {{ formatDate(post.createdAt) }}</span>
      </p>
      <img
         v-if="post.imageUrl"
         :src="post.imageUrl"
         :alt="post.title"
         class="img-fluid rounded mb-4 blog-post-image"
      />
       {/* Đoạn này tôi sửa lại từ code cũ của bạn, dùng data.excerpt thay vì data.content bị thiếu */}
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
import { ref, onMounted, watch } from 'vue';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
// Import cả useRoute và useRouter
import { useRoute, useRouter } from 'vue-router';

const BLOG_COLLECTION_NAME = 'blogPosts';

const props = defineProps({
  id: {
    type: String,
    // required: true // Tạm thời bỏ required để debug
  }
});

const route = useRoute();
// Lấy router instance để dùng router.back()
const router = useRouter();

console.log('[BlogPostDetail] Props được định nghĩa. props.id:', props.id);
console.log('[BlogPostDetail] Route params id (từ URL):', route.params.id);

const post = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchPostData = async (docId) => {
  console.log('[BlogPostDetail] fetchPostData được gọi với docId:', docId);

  if (!docId) {
      const errorMsg = "ID bài viết không hợp lệ hoặc không được truyền vào component.";
      console.error('[BlogPostDetail]', errorMsg, 'Giá trị nhận được:', docId);
      error.value = errorMsg + " Vui lòng kiểm tra cấu hình Router (props: true) và URL.";
      loading.value = false;
      post.value = null;
      return;
  }

  loading.value = true;
  error.value = null;
  post.value = null;

  try {
    const docRef = doc(db, BLOG_COLLECTION_NAME, docId);
    console.log(`[BlogPostDetail] Đang lấy document từ Firestore (Collection: ${BLOG_COLLECTION_NAME}) với ID: ${docId}`);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[BlogPostDetail] Đã tìm thấy dữ liệu:", data);

      post.value = {
        id: docSnap.id,
        title: data.title || 'Tiêu đề không có',
        imageUrl: data.imageUrl || null,
         // *** LƯU Ý QUAN TRỌNG: ***
         // Dựa trên dữ liệu bạn cung cấp lần trước, bạn KHÔNG CÓ trường 'content'.
         // Tôi tạm thời dùng 'excerpt' ở đây để hiển thị cái gì đó.
         // BẠN CẦN THÊM trường 'content' vào Firestore hoặc sửa lại tên trường ở đây cho đúng.
        content: data.excerpt || '<p>Nội dung chi tiết không có sẵn. Vui lòng thêm trường "content" vào Firestore.</p>',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        slug: data.slug
      };
    } else {
      console.warn(`[BlogPostDetail] Không tìm thấy document với ID: ${docId} trong collection ${BLOG_COLLECTION_NAME}`);
      post.value = null;
    }

  } catch (err) {
    console.error("[BlogPostDetail] Lỗi khi lấy dữ liệu từ Firestore:", err);
    console.error("[BlogPostDetail] Chi tiết lỗi:", JSON.stringify(err, null, 2));
    error.value = 'Không thể tải dữ liệu bài viết. Lỗi kết nối hoặc quyền truy cập. Vui lòng kiểm tra Console.';
    post.value = null;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateObject) => {
  if (!dateObject) return '';
  try {
    return dateObject.toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    console.error("[BlogPostDetail] Lỗi định dạng ngày:", e);
    return dateObject.toString();
  }
};

// Hàm xử lý nút quay lại
const goBack = () => {
  router.back();
};

onMounted(() => {
  console.log('[BlogPostDetail] Component được mounted. props.id lúc này:', props.id);
  const idToFetch = props.id || route.params.id;
  console.log('[BlogPostDetail] Sẽ fetch dữ liệu với ID:', idToFetch);
  fetchPostData(idToFetch);
});

watch(() => props.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log(`[BlogPostDetail] prop id thay đổi từ ${oldId} sang ${newId}. Fetching lại...`);
    fetchPostData(newId);
  }
});

</script>

<style scoped>
/* CSS giữ nguyên */
.container {
  max-width: 800px;
}

.blog-post-image {
  max-height: 450px;
  width: 100%;
  object-fit: cover;
  margin-bottom: 1.5rem;
}

.blog-post-content {
  line-height: 1.7;
  text-align: justify;
}

.blog-post-content :deep(h2),
.blog-post-content :deep(h3) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.blog-post-content :deep(p) {
  margin-bottom: 1rem;
}

.blog-post-content :deep(ul),
.blog-post-content :deep(ol) {
  padding-left: 2rem;
  margin-bottom: 1rem;
}
.blog-post-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1rem 0;
}

.text-muted {
  color: #6c757d !important;
}
.fst-italic {
  font-style: italic !important;
}
.alert {
    margin-top: 2rem;
}
.btn-sm { /* Style cho nút quay lại nhỏ hơn */
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}
</style>