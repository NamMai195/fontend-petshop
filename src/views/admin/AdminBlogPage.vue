<template>
  <VContainer fluid>
    <VCard>
      <VCardText>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h4 class="text-h4">Blog Posts</h4>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{ loading ? 'Loading...' : `${totalItems} posts found` }}
            </p>
          </div>
          <VBtn
            prepend-icon="mdi-plus"
            color="primary"
            @click="openCreateDialog"
            :loading="loading"
          >
            ADD POST
          </VBtn>
        </div>

        <VRow class="mb-4">
          <VCol cols="12" md="6">
            <VTextField
              v-model="searchQuery"
              label="Search posts..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @click:clear="searchQuery = ''"
            />
          </VCol>
        </VRow>

        <VDataTable
          :headers="headers"
          :items="posts"
          :loading="loading"
          class="elevation-1"
        >
          <template #loading>
            <VSkeletonLoader
              type="table-row"
              :loading="loading"
              :types="{
                'table-row': {
                  height: '64px',
                  rows: 5
                }
              }"
            />
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center pa-4">
              <VIcon
                icon="mdi-database-off"
                size="48"
                color="grey-lighten-1"
                class="mb-2"
              />
              <div class="text-subtitle-1 text-medium-emphasis">
                No posts found
              </div>
              <div class="text-caption text-medium-emphasis mb-2">
                Try adjusting your search to find what you're looking for.
              </div>
              <VBtn
                color="primary"
                variant="text"
                @click="resetFilters"
              >
                Clear filters
              </VBtn>
            </div>
          </template>

          <template #item.image="{ item }">
            <VImg
              :src="item.imageUrl || '/placeholder-image.png'"
              height="50"
              width="50"
              cover
              class="rounded"
              :lazy-src="'/placeholder-image.png'"
            >
              <template #placeholder>
                <VSkeletonLoader
                  type="image"
                  height="50"
                  width="50"
                />
              </template>
            </VImg>
          </template>
          <template #item.createdAt="{ item }">
            {{ item.createdAt }}
          </template>
          <template #item.actions="{ item }">
            <VBtn
              icon
              variant="text"
              color="primary"
              size="small"
              @click="openEditDialog(item)"
            >
              <VIcon icon="mdi-pencil" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              color="error"
              size="small"
              @click="confirmDelete(item)"
            >
              <VIcon icon="mdi-delete" />
            </VBtn>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>

    <!-- Blog Post Form Dialog -->
    <VDialog v-model="dialog" max-width="800px" persistent>
      <VCard>
        <VCardTitle class="text-h5 pa-4">
          {{ isEditing ? 'Edit Blog Post' : 'Add New Blog Post' }}
        </VCardTitle>
        <VCardText class="pa-4">
          <VForm ref="form" @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formData.title"
                  label="Title"
                  :rules="[v => !!v || 'Title is required']"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="formData.author"
                  label="Author"
                  :rules="[v => !!v || 'Author is required']"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VSelect
                  v-model="formData.status"
                  :items="['Draft', 'Published']"
                  label="Status"
                  :rules="[v => !!v || 'Status is required']"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="formData.content"
                  label="Content"
                  :rules="[v => !!v || 'Content is required']"
                  required
                  rows="5"
                  auto-grow
                />
              </VCol>
              <VCol cols="12">
                <VFileInput
                  v-model="formData.image"
                  label="Featured Image"
                  accept="image/*"
                  :rules="[v => !!v || 'Image is required']"
                  required
                  @change="handleFileChange"
                />
              </VCol>
              <VCol cols="12" v-if="imagePreview">
                <div class="image-preview-container">
                  <VImg 
                    :src="imagePreview" 
                    width="150" 
                    height="150" 
                    cover 
                    class="rounded elevation-2"
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <VProgressCircular indeterminate color="primary" />
                      </div>
                    </template>
                  </VImg>
                  <div class="image-actions">
                    <VBtn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="tonal"
                      @click="clearImage"
                    />
                  </div>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="tonal" @click="dialog = false" :disabled="saving">Cancel</VBtn>
          <VBtn
            color="primary"
            @click="handleSubmit"
            :loading="saving"
            :disabled="saving"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="deleteDialog" max-width="400px">
      <VCard>
        <VCardTitle class="text-h5 pa-4">Confirm Delete</VCardTitle>
        <VCardText class="pa-4">
          Are you sure you want to delete this blog post? This action cannot be undone.
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="tonal" @click="deleteDialog = false" :disabled="deleting">Cancel</VBtn>
          <VBtn
            color="error"
            @click="handleDelete"
            :loading="deleting"
            :disabled="deleting"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

  </VContainer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import blogApiService from '@/api/blog';

const toast = useToast();

// State
const posts = ref([]);
const searchQuery = ref('');
const loading = ref(false);
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedPost = ref(null);
const form = ref(null);
const saving = ref(false);
const deleting = ref(false);
const imagePreview = ref(null);
const totalItems = ref(0);

// Form data
const formData = ref({
  title: '',
  author: '',
  content: '',
  status: 'Draft',
  image: null
});

// Table headers
const headers = [
  { title: 'Image', key: 'image', sortable: false },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Author', key: 'author', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Created At', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

// Watch for search changes
const debouncedSearch = ref(null);
watch(searchQuery, () => {
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value);
  debouncedSearch.value = setTimeout(() => {
    fetchPosts();
  }, 500);
});

// Methods
const fetchPosts = async () => {
  loading.value = true;
  try {
    const fetchedPosts = await blogApiService.getPosts();
    posts.value = fetchedPosts;
    totalItems.value = fetchedPosts.length;
  } catch (error) {
    console.error('Error fetching posts:', error);
    toast.error('Failed to fetch posts');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    title: '',
    author: '',
    content: '',
    status: 'Draft',
    image: null
  };
  imagePreview.value = null;
  if (form.value) {
    form.value.resetValidation();
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  selectedPost.value = null;
  resetForm();
  dialog.value = true;
};

const openEditDialog = (post) => {
  isEditing.value = true;
  selectedPost.value = post;
  formData.value = {
    title: post.title,
    author: post.author,
    content: post.content,
    status: post.status,
    image: null
  };
  imagePreview.value = post.imageUrl;
  dialog.value = true;
};

const confirmDelete = (post) => {
  selectedPost.value = post;
  deleteDialog.value = true;
};

const handleFileChange = (event) => {
  const file = formData.value.image;
  if (file && file instanceof File) {
    imagePreview.value = URL.createObjectURL(file);
  }
};

const clearImage = () => {
  formData.value.image = null;
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imagePreview.value = isEditing.value ? selectedPost.value.imageUrl : null;
};

const handleSubmit = async () => {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEditing.value) {
      await blogApiService.updatePost(
        selectedPost.value.id,
        formData.value,
        formData.value.image
      );
      toast.success('Blog post updated successfully');
    } else {
      await blogApiService.createPost(formData.value, formData.value.image);
      toast.success('Blog post created successfully');
    }

    dialog.value = false;
    resetForm();
    fetchPosts();
  } catch (error) {
    console.error('Error saving post:', error);
    toast.error('Failed to save post');
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedPost.value) return;

  deleting.value = true;
  try {
    await blogApiService.deletePost(selectedPost.value.id);
    toast.success('Blog post deleted successfully');
    deleteDialog.value = false;
    fetchPosts();
  } catch (error) {
    console.error('Error deleting post:', error);
    toast.error('Failed to delete post');
  } finally {
    deleting.value = false;
  }
};

const resetFilters = () => {
  searchQuery.value = '';
};

// Cleanup on unmount
onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.image-preview-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  width: fit-content;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview-container:hover .image-actions {
  opacity: 1;
}
</style>
