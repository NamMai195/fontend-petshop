<template>
    <VContainer fluid>
      <VCard>
        <VCardText>
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h4 class="text-h4">Products</h4>
              <p class="text-subtitle-1 text-medium-emphasis">
                {{ loading ? 'Loading...' : `${totalItems} products found` }}
              </p>
            </div>
            <VBtn
              prepend-icon="mdi-plus"
              color="primary"
              @click="openCreateDialog"
              :loading="loading"
            >
              ADD PRODUCT
            </VBtn>
          </div>
  
          <VRow class="mb-4">
            <VCol cols="12" md="3">
              <VTextField
                v-model="searchQuery"
                label="Search products..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @click:clear="searchQuery = ''"
              />
            </VCol>
            <VCol cols="12" md="3">
              <VSelect
                v-model="selectedCategory"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Category"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @click:clear="selectedCategory = null"
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="minPrice"
                label="Min Price"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @click:clear="minPrice = ''"
                :prefix="'₫'"
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="maxPrice"
                label="Max Price"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @click:clear="maxPrice = ''"
                :prefix="'₫'"
              />
            </VCol>
          </VRow>
  
          <VDataTable
            :headers="headers"
            :items="products"
            :loading="loading"
            :items-per-page="itemsPerPage"
            :page="page"
            :total-items="totalItems"
            class="elevation-1"
            @update:options="handleTableOptionsChange"
          >
            <template #loading>
              <VSkeletonLoader
                type="table-row"
                :loading="loading"
                :types="{
                  'table-row': {
                    height: '64px',
                    rows: itemsPerPage
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
                  No products found
                </div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Try adjusting your search or filter to find what you're looking for.
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
                :src="item.imageURLs?.[0] || '/placeholder-image.png'"
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
            <template #item.category="{ item }">
              {{ item.category?.name || 'N/A' }}
            </template>
            <template #item.price="{ item }">
              <span class="text-end">{{ formatCurrency(item.price) }}</span>
            </template>
            <template #item.stockQuantity="{ item }">
              <span class="text-end">{{ item.stockQuantity || 0 }}</span>
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
  
      <!-- Product Form Dialog -->
      <VDialog v-model="dialog" max-width="800px" persistent>
        <VCard>
          <VCardTitle class="text-h5 pa-4">
            {{ isEditing ? 'Edit Product' : 'Add New Product' }}
          </VCardTitle>
          <VCardText class="pa-4">
            <VForm ref="form" @submit.prevent="handleSubmit">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="formData.name"
                    label="Product Name"
                    :rules="[v => !!v || 'Name is required']"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="formData.categoryId"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="Category"
                    :rules="[v => !!v || 'Category is required']"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="formData.price"
                    label="Price"
                    type="number"
                    :rules="[
                      v => !!v || 'Price is required',
                      v => v > 0 || 'Price must be greater than 0'
                    ]"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="formData.stockQuantity"
                    label="Stock Quantity"
                    type="number"
                    :rules="[
                      v => !!v || 'Stock quantity is required',
                      v => v >= 0 || 'Stock quantity cannot be negative'
                    ]"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="formData.sku"
                    label="SKU"
                    :rules="[v => !!v || 'SKU is required']"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    v-model="formData.description"
                    label="Description"
                    :rules="[v => !!v || 'Description is required']"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VFileInput
                    v-model="formData.images"
                    label="Product Images"
                    multiple
                    accept="image/*"
                    :rules="[v => !!v || 'At least one image is required']"
                    required
                    @change="handleFileChange"
                  />
                </VCol>
                <VCol cols="12" v-if="formData.imageURLs && formData.imageURLs.length">
                  <div class="d-flex flex-wrap gap-4">
                    <div v-for="(url, index) in formData.imageURLs" :key="index" class="image-preview-container">
                      <VImg 
                        :src="url" 
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
                          icon="mdi-open-in-new"
                          size="small"
                          color="primary"
                          variant="tonal"
                          :href="url"
                          target="_blank"
                          class="mr-2"
                        />
                        <VBtn
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          variant="tonal"
                          @click="removeImage(index)"
                        />
                      </div>
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
            Are you sure you want to delete this product? This action cannot be undone.
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
  import { ref, onMounted, watch, computed } from 'vue';
  import axios from '../../plugins/axios';
  import { useToast } from 'vue-toastification';
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { storage } from '@/firebase/config';
  
  const toast = useToast();
  
  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dqhzwvfl8';
  const CLOUDINARY_UPLOAD_PRESET = 'IMGPETSHOP';
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  // Format currency to VND
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  // State
  const products = ref([]);
  const categories = ref([]);
  const selectedCategory = ref(null);
  const minPrice = ref('');
  const maxPrice = ref('');
  const searchQuery = ref('');
  const loading = ref(false);
  const dialog = ref(false);
  const deleteDialog = ref(false);
  const isEditing = ref(false);
  const selectedProduct = ref(null);
  const form = ref(null);
  const saving = ref(false);
  const deleting = ref(false);
  
  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  
  // Form data
  const formData = ref({
    name: '',
    categoryId: null,
    price: '',
    stockQuantity: '',
    sku: '',
    description: '',
    imageURLs: [],
    images: []
  });
  
  // Table headers
  const headers = [
    { title: 'Image', key: 'image', sortable: false },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Category', key: 'category', sortable: true },
    { 
      title: 'Price', 
      key: 'price', 
      sortable: true,
      align: 'end'
    },
    { 
      title: 'Stock', 
      key: 'stockQuantity', 
      sortable: true,
      align: 'end'
    },
    { title: 'SKU', key: 'sku', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
  ];
  
  // Watch for filter changes
  const debouncedSearch = ref(null);
  watch([searchQuery, selectedCategory, minPrice, maxPrice], () => {
    if (debouncedSearch.value) clearTimeout(debouncedSearch.value);
    debouncedSearch.value = setTimeout(() => {
      page.value = 1;
      fetchProducts();
    }, 500);
  });
  
  // Methods
  const fetchProducts = async () => {
    loading.value = true;
    try {
      const params = {
        page: page.value - 1,
        size: itemsPerPage.value,
        keyword: searchQuery.value || undefined,
        categoryId: selectedCategory.value || undefined,
        minPrice: minPrice.value || undefined,
        maxPrice: maxPrice.value || undefined
      };
  
      // Validate price range
      if (params.minPrice && params.maxPrice && Number(params.minPrice) > Number(params.maxPrice)) {
        toast.error('Minimum price cannot be greater than maximum price');
        return;
      }
  
      const response = await axios.get('/api/v1/products', { params });
  
      if (Array.isArray(response.data)) {
        products.value = response.data;
        totalItems.value = response.data.length;
      } else if (response.data && Array.isArray(response.data.content)) {
        products.value = response.data.content;
        totalItems.value = response.data.totalElements;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
      products.value = [];
      totalItems.value = 0;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/v1/categories');
      if (Array.isArray(response.data)) {
        categories.value = response.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        categories.value = response.data.content;
      } else {
        toast.error('Invalid category data format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    }
  };
  
  const handleTableOptionsChange = (options) => {
    page.value = options.page;
    itemsPerPage.value = options.itemsPerPage;
    fetchProducts();
  };
  
  const resetForm = () => {
    formData.value = {
      name: '',
      categoryId: null,
      price: '',
      stockQuantity: '',
      sku: '',
      description: '',
      imageURLs: [],
      images: []
    };
    if (form.value) {
      form.value.resetValidation();
    }
  };
  
  const openCreateDialog = () => {
    isEditing.value = false;
    selectedProduct.value = null;
    resetForm();
    dialog.value = true;
  };
  
  const openEditDialog = (product) => {
    isEditing.value = true;
    selectedProduct.value = product;
    formData.value = {
      name: product.name,
      categoryId: product.category?.id,
      price: product.price,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      description: product.description || '',
      imageURLs: product.imageURLs || [],
      images: []
    };
    dialog.value = true;
  };
  
  const confirmDelete = (product) => {
    selectedProduct.value = product;
    deleteDialog.value = true;
  };
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    formData.value.images = files;
  };
  
  const removeImage = (index) => {
    formData.value.imageURLs.splice(index, 1);
  };
  
  const uploadImages = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        // Upload to Cloudinary
        console.log('Uploading file:', file.name);
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Upload successful');
        const downloadURL = data.secure_url;
        console.log('File available at:', downloadURL);
        
        uploadedUrls.push(downloadURL);
        toast.success(`Uploaded ${file.name} successfully`);
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    return uploadedUrls;
  };
  
  const handleSubmit = async () => {
    if (!form.value) return;
    
    const { valid } = await form.value.validate();
    if (!valid) return;
  
    saving.value = true;
    try {
      let imageURLs = [];
  
      // Upload images first if any
      if (formData.value.images?.length > 0) {
        toast.info(`Uploading ${formData.value.images.length} images to Cloudinary...`);
        imageURLs = await uploadImages(formData.value.images);
        
        if (imageURLs.length === 0) {
          toast.error('No images were uploaded successfully');
          saving.value = false;
          return;
        }
      }
  
      // Prepare product data
      const productData = {
        name: formData.value.name,
        categoryId: formData.value.categoryId,
        price: Number(formData.value.price),
        stockQuantity: Number(formData.value.stockQuantity) || 0,
        sku: formData.value.sku,
        description: formData.value.description,
        imageURLs: isEditing.value 
          ? [...(selectedProduct.value?.imageURLs || []), ...imageURLs]
          : imageURLs
      };
  
      // Save product
      if (isEditing.value) {
        await axios.put(`/api/v1/products/${selectedProduct.value.id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/v1/products', productData);
        toast.success('Product created successfully');
      }
  
      dialog.value = false;
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      saving.value = false;
    }
  };
  
  const handleDelete = async () => {
    if (!selectedProduct.value) return;
  
    deleting.value = true;
    try {
      await axios.delete(`/api/v1/products/${selectedProduct.value.id}`);
      toast.success('Product deleted successfully');
      deleteDialog.value = false;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      deleting.value = false;
    }
  };
  
  const resetFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = null;
    minPrice.value = '';
    maxPrice.value = '';
  };
  
  // Lifecycle
  onMounted(() => {
    fetchCategories();
    fetchProducts();
  });
  
  </script>
  
  <style scoped>
  .position-relative {
    position: relative;
  }
  .position-absolute {
    position: absolute;
  }
  .top-0 {
    top: 0;
  }
  .right-0 {
    right: 0;
  }
  .text-end {
    text-align: right;
    display: block;
  }
  .image-preview-container {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
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
  
  .gap-4 {
    gap: 16px;
  }
  </style>