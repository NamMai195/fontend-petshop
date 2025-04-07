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
                  :rules="[rules.title]"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editablePost.author"
                  label="Author*"
                  :rules="[rules.author]"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                 <v-select
                    v-model="editablePost.status"
                    :items="['Draft', 'Published']"
                    label="Status*"
                    :rules="[rules.status]"
                    variant="outlined"
                    density="compact"
                  ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editablePost.content"
                  label="Content"
                  :rules="[rules.content]"
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
  modelValue: Boolean,
  post: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'save']);

// Form refs and validation rules
const formRef = ref(null);
const rules = {
  title: [v => isEditing.value || (!!v && v.length > 0) || 'Title is required'],
  author: [v => isEditing.value || (!!v && v.length > 0) || 'Author is required'],
  content: [v => isEditing.value || (!!v && v.length > 0) || 'Content is required'],
  status: [v => isEditing.value || (!!v && v.length > 0) || 'Status is required'],
};

// Form data
const editablePost = ref({
  title: '',
  author: '',
  content: '',
  status: 'Draft',
  imageUrl: null,
});

// Image handling
const selectedImageFile = ref(null);
const imagePreviewUrl = ref(null);
const isSaving = ref(false);

const isEditing = computed(() => !!props.post);

// Reset form when dialog opens/closes
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    // Dialog opened
    if (props.post) {
      // Edit mode - populate form with post data
      editablePost.value = { ...props.post };
    } else {
      // Add mode - reset form
      editablePost.value = {
        title: '',
        author: '',
        content: '',
        status: 'Draft',
        imageUrl: null,
      };
    }
    selectedImageFile.value = null;
    imagePreviewUrl.value = null;
    
    // Wait for form to be ready
    await nextTick();
    if (formRef.value) {
      formRef.value.resetValidation();
    }
  }
});

const previewImage = (event) => {
  const file = selectedImageFile.value;
  if (file) {
    // Clear previous preview
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value);
    }
    // Create new preview
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
};

const clearPreview = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = null;
  }
  selectedImageFile.value = null;
};

// Cleanup when component unmounts
watch(imagePreviewUrl, (newUrl, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }
});

const closeDialog = () => {
  emit('update:modelValue', false);
};

const savePost = async () => {
  if (!isEditing.value && !(await formRef.value.validate())) {
    return;
  }

  isSaving.value = true;
  try {
    if (isEditing.value) {
      // Khi edit, chỉ gửi các trường đã được điền
      const updateData = {};
      if (editablePost.value.title) updateData.title = editablePost.value.title;
      if (editablePost.value.author) updateData.author = editablePost.value.author;
      if (editablePost.value.content) updateData.content = editablePost.value.content;
      if (editablePost.value.status) updateData.status = editablePost.value.status;
      
      // Emit save event with post data and image file
      emit('save', {
        postData: updateData,
        imageFile: selectedImageFile.value
      });
    } else {
      // Khi tạo mới, yêu cầu đầy đủ thông tin
      // Emit save event with post data and image file
      emit('save', {
        postData: editablePost.value,
        imageFile: selectedImageFile.value
      });
    }
    // Close dialog
    closeDialog();
  } catch (error) {
    console.error('Error saving post:', error);
  } finally {
    isSaving.value = false;
  }
};

// Expose isSaving for parent component
defineExpose({ isSaving });
</script>

<style scoped>
.v-card-text {
  padding-top: 0;
}
</style>
