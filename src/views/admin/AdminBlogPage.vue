<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-post"></v-icon> &nbsp;
        Blog Management

        <v-spacer></v-spacer>

        <v-btn color="primary" prepend-icon="mdi-plus" @click="addPost">
          Add New Post
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <div v-if="isLoading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">Loading posts...</p>
        </div>

        <v-alert v-else-if="error" type="error" prominent border="start" class="mb-4">
          {{ error }}
        </v-alert>

        <v-alert v-else-if="posts.length === 0" type="info" variant="tonal" class="mb-4">
          No blog posts found. Click "Add New Post" to create one.
        </v-alert>

        <v-table v-else fixed-header hover>
          <thead>
            <tr>
              <th class="text-left" style="width: 50px;">Image</th>
              <th class="text-left">ID</th>
              <th class="text-left">Title</th>
              <th class="text-left">Author</th>
              <th class="text-left">Created At</th>
              <th class="text-left">Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
               <td>
                 <v-img
                   v-if="post.imageUrl"
                   :src="post.imageUrl"
                   :alt="post.title"
                   height="40"
                   width="40"
                   cover
                   class="my-1"
                 ></v-img>
                 <v-icon v-else size="small" class="text-grey">mdi-image-off</v-icon>
               </td>
              <td>{{ post.id.substring(0, 6) }}...</td> <!-- Show partial ID -->
              <td>{{ post.title }}</td>
              <td>{{ post.author }}</td>
              <td>{{ post.createdAt }}</td>
              <td>
                <v-chip :color="post.status === 'Published' ? 'success' : 'warning'" size="small" label>
                  {{ post.status }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  color="info"
                  size="small"
                  @click="editPost(post.id)"
                  class="me-2"
                >
                  <v-icon>mdi-pencil</v-icon>
                   <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="deletePost(post.id)"
                >
                 <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Dialog -->
    <BlogPostFormDialog
      v-model="dialogVisible"
      :post="currentPost"
      @save="handleSavePost"
      ref="blogDialogRef"
    />

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import blogApiService from '@/api/blog'; // Import the created API service
import BlogPostFormDialog from '@/components/admin/BlogPostFormDialog.vue'; // Import the dialog component

const posts = ref([]);
const isLoading = ref(true);
const error = ref(null);
const dialogVisible = ref(false);
const currentPost = ref(null); // Holds the post being edited, null for adding
const blogDialogRef = ref(null); // Ref to access dialog's isSaving state if needed

const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Fetch blog posts from Firebase
    posts.value = await blogApiService.getPosts();
  } catch (err) {
    console.error('Error fetching blog posts in component:', err);
    // Display a more detailed error message if available
    error.value = err.message || 'Failed to load blog posts. Check console for details.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPosts);

// --- Dialog Handling ---
const openAddDialog = () => {
  currentPost.value = null; // Ensure we are in "add" mode
  dialogVisible.value = true;
};

const openEditDialog = (post) => {
  currentPost.value = { ...post }; // Pass a copy of the post to the dialog
  dialogVisible.value = true;
};

// Note: The dialog now emits { postData, imageFile }
const handleSavePost = async ({ postData, imageFile }) => {
  const isEditing = !!postData.id;
  // Extract ID for update, remove it from payload for create/update consistency if needed by API
  const postId = postData.id;
  const payload = { ...postData };
  delete payload.id; // Firestore functions handle ID separately

  try {
    if (isEditing) {
      // Pass existing image URL for potential deletion during update
      const existingImageUrl = posts.value.find(p => p.id === postId)?.imageUrl || null;
      await blogApiService.updatePost(postId, payload, imageFile, existingImageUrl);
    } else {
      await blogApiService.createPost(payload, imageFile);
    }

    dialogVisible.value = false; // Close dialog on success
    await fetchPosts(); // Refresh the list from Firebase
    // Optionally show a success notification
  } catch (err) {
    console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, err);
    error.value = `Failed to ${isEditing ? 'update' : 'create'} post.`; // Show error in main page for now
    // Optionally show an error notification within the dialog or main page
  } finally {
    // Ensure loading state in dialog is reset if it's exposed and used
     if (blogDialogRef.value) {
       blogDialogRef.value.isSaving = false;
     }
  }
};

// --- Action Button Handlers ---
const addPost = () => {
  openAddDialog();
};

const editPost = (postId) => {
  const postToEdit = posts.value.find(p => p.id === postId);
  if (postToEdit) {
    openEditDialog(postToEdit);
  } else {
    console.error(`Post with ID ${postId} not found for editing.`);
    error.value = 'Could not find the selected post to edit.';
  }
};

const deletePost = async (postId) => {
  const postToDelete = posts.value.find(p => p.id === postId);
  if (!postToDelete) {
     error.value = 'Could not find the selected post to delete.';
     return;
  }

  if (confirm(`Are you sure you want to delete post "${postToDelete.title}" (ID: ${postId})?`)) {
    try {
      // Pass the image URL to the delete function for storage cleanup
      await blogApiService.deletePost(postId, postToDelete.imageUrl);
      await fetchPosts(); // Refresh the list after successful deletion from backend
    } catch (err) {
      console.error(`Error deleting post ${postId}:`, err);
      error.value = 'Failed to delete post.';
    }
  }
};
</script>

<style scoped>
/* Scoped styles specific to this component */
.v-card-title {
  font-weight: 500;
}

.v-table th {
  font-weight: bold; /* Make table headers bold */
}

.text-center {
  text-align: center;
}

.pa-4 {
  padding: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.me-2 {
 margin-right: 8px;
}
</style>
