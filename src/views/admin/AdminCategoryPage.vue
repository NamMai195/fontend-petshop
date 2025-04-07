<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-medium">
        {{ totalItems }} categories found
      </h1>
      <VBtn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openDialog()"
      >
        ADD CATEGORY
      </VBtn>
    </div>

    <!-- Search -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <VTextField
              v-model="searchQuery"
              label="Search categories"
              prepend-inner-icon="mdi-magnify"
              single-line
              hide-details
              variant="outlined"
              density="compact"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Data Table -->
    <VCard>
      <VCardText>
        <VProgressLinear
          v-if="loading"
          indeterminate
          color="primary"
        ></VProgressLinear>

        <VTable v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Parent Category</th>
              <th>Created At</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.id }}</td>
              <td>{{ category.name }}</td>
              <td>{{ category.description || '-' }}</td>
              <td>{{ category.parentCategoryName || '-' }}</td>
              <td>{{ category.createdAt ? new Date(category.createdAt).toLocaleString() : '-' }}</td>
              <td class="text-center">
                <VBtn
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="openDialog(category)"
                >
                  <VIcon icon="mdi-pencil" />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  @click="confirmDelete(category)"
                >
                  <VIcon icon="mdi-delete" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Empty State -->
        <div
          v-if="!loading && (!categories || categories.length === 0)"
          class="text-center py-4"
        >
          <VIcon
            icon="mdi-tag-off"
            size="48"
            color="grey-lighten-1"
            class="mb-2"
          />
          <p class="text-medium-emphasis">No categories found</p>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-end mt-4">
          <VPagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Add/Edit Dialog -->
    <VDialog
      v-model="dialog"
      max-width="600"
      persistent
    >
      <VCard>
        <VCardTitle class="text-h5 pa-4">
          {{ editedItem.id ? 'Edit Category' : 'New Category' }}
        </VCardTitle>

        <VCardText class="pt-4">
          <VForm ref="form" @submit.prevent="saveCategory">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="editedItem.name"
                  label="Category Name"
                  :rules="[v => !!v || 'Name is required']"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="editedItem.description"
                  label="Description"
                  rows="3"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="editedItem.parentCategoryId"
                  label="Parent Category"
                  :items="categories.filter(c => c.id !== editedItem.id)"
                  item-title="name"
                  item-value="id"
                  clearable
                  :disabled="loading"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey-darken-1"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="saving"
            @click="saveCategory"
          >
            Save
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle class="text-h5">Delete Category</VCardTitle>
        <VCardText>
          Are you sure you want to delete category "{{ deleteItem.name }}"?
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="grey-darken-1"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            :loading="deleting"
            @click="deleteCategory"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '../../plugins/axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const categories = ref([])
const totalItems = ref(0)
const totalPages = ref(0)
const page = ref(1)
const searchQuery = ref('')
const imageFile = ref(null)
const form = ref(null)

const defaultItem = {
  name: '',
  description: '',
  imageUrl: '',
  parentCategoryId: null
}

const editedItem = ref({ ...defaultItem })
const deleteItem = ref({ ...defaultItem })

// Methods
const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/v1/categories', {
      params: {
        page: page.value - 1,
        size: 10
      },
    })

    // Kiểm tra response.data
    console.log('Categories response:', response.data)

    // Xử lý dữ liệu page
    if (response.data) {
      // Nếu response.data là array
      if (Array.isArray(response.data)) {
        categories.value = response.data
        totalItems.value = response.data.length
        totalPages.value = 1
      } 
      // Nếu response.data là object với thuộc tính content (pageable)
      else if (response.data.content) {
        categories.value = response.data.content
        totalItems.value = response.data.totalElements || response.data.content.length
        totalPages.value = response.data.totalPages || 1
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    toast.error('Failed to load categories')
  } finally {
    loading.value = false
  }
}

const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

const saveCategory = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    let imageUrl = editedItem.value.imageUrl

    if (imageFile.value?.[0]) {
      imageUrl = await uploadImage(imageFile.value[0])
    }

    const categoryData = {
      name: editedItem.value.name,
      description: editedItem.value.description,
      parentCategoryId: editedItem.value.parentCategoryId || null
    }

    if (editedItem.value.id) {
      await axios.put(`/api/v1/categories/${editedItem.value.id}`, categoryData)
      toast.success('Category updated successfully')
    } else {
      await axios.post('/api/v1/categories', categoryData)
      toast.success('Category created successfully')
    }

    closeDialog()
    fetchCategories()
  } catch (error) {
    console.error('Error saving category:', error)
    toast.error(error.response?.data?.message || 'Failed to save category')
  } finally {
    saving.value = false
  }
}

const deleteCategory = async () => {
  deleting.value = true
  try {
    await axios.delete(`/api/v1/categories/${deleteItem.value.id}`)
    toast.success('Category deleted successfully')
    deleteDialog.value = false
    fetchCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    if (error.response?.status === 400) {
      toast.error('Cannot delete category with products')
    } else {
      toast.error('Failed to delete category')
    }
  } finally {
    deleting.value = false
  }
}

const openDialog = (item = null) => {
  editedItem.value = item ? { ...item } : { ...defaultItem }
  imageFile.value = null
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  imageFile.value = null
}

const confirmDelete = (item) => {
  deleteItem.value = { ...item }
  deleteDialog.value = true
}

const removeImage = () => {
  editedItem.value.imageUrl = ''
}

// Watchers
watch(page, () => {
  fetchCategories()
})

watch(searchQuery, () => {
  page.value = 1
  fetchCategories()
})

// Lifecycle
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}
</style> 