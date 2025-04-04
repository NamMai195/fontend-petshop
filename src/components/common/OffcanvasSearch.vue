<template>
  <div class="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasSearch"
    aria-labelledby="SearchLabel">
    <div class="offcanvas-header justify-content-center">
      <h5 class="offcanvas-title" id="SearchLabel">Search Products</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <div class="order-md-last">
        <div class="search-bar border rounded-2 border-dark-subtle mb-3">
          <form id="search-form-offcanvas" class="text-center d-flex align-items-center" @submit.prevent="handleNavigationSearch" action="" method="">
            <input
              type="text"
              class="form-control border-0 bg-transparent"
              placeholder="Search Here"
              v-model="searchQuery"
              aria-label="Search Input"
            />
            <button type="submit" class="btn btn-link p-0" aria-label="Perform Search">
               <Icon icon="tabler:search" class="fs-4 me-3" />
            </button>
          </form>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// Import useRouter để điều hướng
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';


const searchQuery = ref('');
const router = useRouter(); // Khởi tạo router

const handleNavigationSearch = () => {
  const searchTerm = searchQuery.value.trim();
  if (!searchTerm) {
    return; 
  }

  console.log(`[OffcanvasSearch] Navigating to shop with search: "${searchTerm}"`);

  router.push({
      name: 'shop', 
      query: { search: searchTerm }
  });
  searchQuery.value = '';
  const offcanvasElement = document.getElementById('offcanvasSearch');
  if (offcanvasElement) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (bsOffcanvas) {
          bsOffcanvas.hide();
      } else {
          // Fallback nếu chưa khởi tạo instance (ít xảy ra nếu dùng data-bs-toggle)
          const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
          offcanvas.hide();
      }
  }

};


</script>

<style scoped>
/* Style giữ nguyên hoặc có thể xóa bớt nếu không dùng */
.btn-link {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
}
.btn-link:hover {
    color: var(--bs-primary); /* Hoặc màu hover mong muốn */
}
</style>