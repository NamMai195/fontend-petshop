<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue')" persistent max-width="700px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Edit Blog Post' : 'Add New Blog Post' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="savePost">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editablePost.title"
                  label="Title*"
                  :rules="[rules.required]"
                  required
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editablePost.author"
                  label="Author*"
                  :rules="[rules.required]"
                  required
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                 <v-select
                    v-model="editablePost.status"
                    :items="['Draft', 'Published']"
                    label="Status*"
                    :rules="[rules.required]"
                    required
                    variant="outlined"
                    density="compact"
                  ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editablePost.content"
                  label="Content"
                  variant="outlined"
                  rows="5"
                  auto-grow
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                 <v-file-input
                    v-model="selectedImageFile"
                    label="Featured Image"
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    variant="outlined"
                    density="compact"
                    show-size
                    clearable
                    @change="previewImage"
                    @click:clear="clearPreview"
                  ></v-file-input>
              </v-col>
              <v-col cols="12" v-if="imagePreviewUrl">
                 <p class="text-caption mb-1">Image Preview:</p>
                 <v-img :src="imagePreviewUrl" max-height="150" contain></v-img>
              </v-col>
               <v-col cols="12" v-else-if="isEditing && editablePost.imageUrl">
                 <p class="text-caption mb-1">Current Image:</p>
                 <v-img :src="editablePost.imageUrl" max-height="150" contain></v-img>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="flat" @click="savePost" :loading="isSaving">
          Save Post
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';

const props = defineProps({
  modelValue: Boolean, // Controls dialog visibility (v-model)
  post: { // The post object to edit, or null/undefined for adding
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'save']);

const formRef = ref(null); // Reference to the v-form
const editablePost = ref({});
const isSaving = ref(false);
const selectedImageFile = ref(null); // Holds the File object
const imagePreviewUrl = ref(null); // Holds the local preview URL

const isEditing = computed(() => !!props.post?.id);

// Validation rules
const rules = {
  required: value => !!value || 'This field is required.',
};

// Watch for the dialog opening and initialize the form data
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset form validation when dialog opens
    nextTick(() => {
      formRef.value?.resetValidation();
    });
    if (isEditing.value) {
      // Clone the post prop to avoid mutating it directly
      editablePost.value = { ...props.post };
    } else {
      // Reset for adding a new post
      editablePost.value = { title: '', author: '', content: '', status: 'Draft', imageUrl: null };
    }
    // Clear previous file selection and preview
    selectedImageFile.value = null;
    imagePreviewUrl.value = null;
  }
});

// Generate a local preview URL when a file is selected
const previewImage = () => {
  if (selectedImageFile.value && selectedImageFile.value.length > 0) {
    const file = selectedImageFile.value[0]; // v-file-input returns an array
    if (file && file.type.startsWith('image/')) {
      imagePreviewUrl.value = URL.createObjectURL(file);
    } else {
      // Handle non-image file selection if necessary
      selectedImageFile.value = null;
      imagePreviewUrl.value = null;
      alert('Please select a valid image file.');
    }
  } else {
     imagePreviewUrl.value = null; // Clear preview if file is cleared
  }
};

// Clear preview when file input is cleared
const clearPreview = () => {
  imagePreviewUrl.value = null;
  selectedImageFile.value = null; // Ensure file ref is also cleared
};

// Revoke the object URL when the component is unmounted or preview changes
watch(imagePreviewUrl, (newUrl, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }
});
// Also revoke on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
});

const closeDialog = () => {
  emit('update:modelValue', false);
};

const savePost = async () => {
  // Validate the form
  const { valid } = await formRef.value?.validate();
  if (!valid) {
    return; // Don't proceed if validation fails
  }

  isSaving.value = true;
  try {
    // Emit the save event with the post data AND the selected image file
    const fileToSave = selectedImageFile.value ? selectedImageFile.value[0] : null;
    emit('save', { postData: { ...editablePost.value }, imageFile: fileToSave });
    // The parent component will handle the API call and closing the dialog on success
  } catch (error) {
    // Handle potential errors during emit or if logic was here
    console.error("Error preparing save:", error);
    // Reset saving state here if parent doesn't handle it on error
    isSaving.value = false;
  } finally {
     // We let the parent decide when to stop loading and close
     // isSaving.value = false; // Usually controlled by parent after API call
  }
};

// Expose isSaving for parent component if needed (e.g., to reset it after API call)
defineExpose({ isSaving });

</script>

<style scoped>
/* Add any specific styles for the dialog here */
.v-card-title {
  border-bottom: 1px solid #eee;
}
.v-card-actions {
  border-top: 1px solid #eee;
}
</style>
