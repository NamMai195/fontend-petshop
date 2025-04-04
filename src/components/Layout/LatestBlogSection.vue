<template>
  <section id="latest-blog" class="my-5">
    <div class="container py-5 my-5">
      <div class="row mt-5">
        <div class="section-header d-md-flex justify-content-between align-items-center mb-3">
          <h2 class="display-3 fw-normal">Latest Blog Post</h2>
          <div>
            <a href="/blog" class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
              Read all
              <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
                <use xlink:href="#arrow-right"></use>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <p>Loading latest posts...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if="posts.length > 0" class="row">
        <div
          v-for="post in posts"
          :key="post.id"
          class="col-md-4 my-4 my-md-0"
        >
          <BlogPostCard :post="post" />
        </div>
      </div>

      <div v-else class="text-center py-5">
          <p>No blog posts found.</p>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
// QUAN TRỌNG: Đảm bảo đường dẫn đến file config Firebase đúng
import { db } from '@/firebase/config';
import BlogPostCard from '../UI/BlogPostCard.vue';

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchLatestPosts = async () => {
  loading.value = true;
  error.value = null;
  const tempPosts = [];

  try {
    // QUAN TRỌNG: Đổi 'blogPosts' nếu tên collection khác
    const postsCollectionRef = collection(db, 'blogPosts');
    // Lấy 3 bài mới nhất sắp xếp theo 'createdAt' (phải là kiểu Timestamp trong Firestore)
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'), limit(3));

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tempPosts.push({
        id: doc.id,
        title: data.title || 'No Title',
        excerpt: data.excerpt || '',
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        // slug: data.slug // Thêm nếu có slug
      });
    });
    posts.value = tempPosts;

  } catch (err) {
    console.error("Error fetching latest blog posts:", err);
    error.value = 'Failed to load blog posts.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLatestPosts();
});
</script>

<style scoped>
.alert {
  margin: 20px 0;
}
</style>