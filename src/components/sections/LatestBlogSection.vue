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
import { db } from '@/firebase/config';
import BlogPostCard from '@/components/common/BlogPostCard.vue';

const BLOG_COLLECTION = 'blogPosts';

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchLatestPosts = async () => {
  loading.value = true;
  error.value = null;
  const tempPosts = [];

  try {
    console.log('Fetching latest posts from collection:', BLOG_COLLECTION);
    const postsCollectionRef = collection(db, BLOG_COLLECTION);
    
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'), limit(3));
    console.log('Query created:', q);

    const querySnapshot = await getDocs(q);
    console.log('Documents found:', querySnapshot.size);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Processing document:', doc.id, data);
      
      tempPosts.push({
        id: doc.id,
        title: data.title || 'No Title',
        excerpt: data.excerpt || '',
        content: data.content || '',
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        author: data.author || 'Anonymous',
        status: data.status || 'Published'
      });
    });
    
    console.log('Posts processed:', tempPosts.length);
    posts.value = tempPosts;

  } catch (err) {
    console.error("Error fetching latest blog posts:", {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    error.value = 'Failed to load blog posts.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('LatestBlogSection mounted, fetching posts...');
  fetchLatestPosts();
});
</script>

<style scoped>
.alert {
  margin: 20px 0;
}
</style>