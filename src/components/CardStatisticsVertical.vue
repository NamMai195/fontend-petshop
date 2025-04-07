<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center">
        <div>
          <span class="text-sm text-disabled">{{ title }}</span>
          <div class="d-flex align-center gap-2">
            <h6 class="text-h6">
              {{ stats }}
            </h6>
            <span
              :class="change >= 0 ? 'text-success' : 'text-error'"
              class="text-sm"
            >
              {{ change >= 0 ? '+' : '' }}{{ change }}%
            </span>
          </div>
        </div>

        <VAvatar
          :color="color"
          variant="tonal"
          size="42"
        >
          <VImg
            :src="image"
            :alt="title"
          />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  stats: {
    type: String,
    required: true,
  },
  change: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
})
</script> 