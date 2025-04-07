<template>
  <div class="card-container">
      <div v-if="formattedDate" class="date-badge z-1 position-absolute rounded-3 m-2 px-3 pt-1 bg-light">
        <h3 class="secondary-font text-primary m-0">{{ formattedDate.day }}</h3>
        <p class="secondary-font fs-6 m-0">{{ formattedDate.month }}</p>
      </div>

      <div class="card position-relative">
        <a :href="postLink">
          <img
            v-if="post.imageUrl"
            :src="post.imageUrl"
            class="img-fluid rounded-4 blog-post-image"
            :alt="post.title"
            @error="handleImageError"
           >
           <img
             v-else
             src="/src/assets/images/logo.png"
             class="img-fluid rounded-4 blog-post-image"
             alt="No image available"
           >
        </a>
        <div class="card-body p-0">
          <a :href="postLink">
            <h3 class="card-title pt-4 pb-3 m-0">{{ post.title }}</h3>
          </a>
          <div class="card-text">
            <p class="blog-paragraph fs-6">{{ post.excerpt }}</p>
            <a :href="postLink" class="blog-read">read more</a>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

// Định dạng ngày tháng từ JS Date (đã được chuyển đổi từ Firestore Timestamp)
const formattedDate = computed(() => {
  if (!props.post.createdAt) return null;
  
  const date = props.post.createdAt;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    day: date.getDate(),
    month: months[date.getMonth()]
  };
});

// Tạo link chi tiết bài viết bằng ID
const postLink = computed(() => `/blog/post/${props.post.id}`);

// Xử lý khi ảnh bài viết bị lỗi
const handleImageError = (event) => {
  event.target.src = '/src/assets/images/logo.png';
};
</script>

<style scoped>
.card-container {
    height: 100%;
}
.card {
    border: none;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.card-body {
    flex-grow: 1;
    padding-top: 1rem !important;
}
.blog-post-image {
  aspect-ratio: 16 / 10;
  object-fit: cover;
  width: 100%;
}
.card-title {
  font-size: 1.1rem;
   /* display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
   overflow: hidden; */
}
.blog-paragraph {
  color: #6c757d;
   display: -webkit-box;
   -webkit-line-clamp: 3;
   -webkit-box-orient: vertical;
   overflow: hidden;
   margin-bottom: 1rem;
}
.blog-read {
  color: var(--bs-link-color);
  text-decoration: none;
  font-weight: 600;
}
.blog-read:hover {
  text-decoration: underline;
}
.date-badge {
    text-align: center;
    width: 60px;
    top: 0.5rem;
    left: 0.5rem;
}
.date-badge h3 {
    font-size: 1.5rem;
    line-height: 1.1;
}
.date-badge p {
    line-height: 1;
}
/* .secondary-font { font-family: 'YourSecondaryFont', sans-serif; } */
/* .text-primary { color: #your-primary-color !important; } */
</style>