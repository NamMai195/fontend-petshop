<template>
  <div class="d-flex align-center gap-3">
    <v-icon
      :icon="icon"
      :color="color"
      size="40"
    />
    <div>
      <h4 class="text-h4">
        {{ title }}
      </h4>
      <p class="text-body-1">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})
</script> 