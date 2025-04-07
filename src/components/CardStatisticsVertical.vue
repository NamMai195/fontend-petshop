<template>
  <VCard :class="cardClass">
    <VCardText>
      <div class="d-flex justify-space-between align-center">
        <div class="stat-content">
          <span class="text-sm text-disabled">{{ title }}</span>
          <div class="d-flex align-center gap-2">
            <h6 class="text-h6 mb-0">
              {{ stats }}
            </h6>
            <span
              v-if="showChange"
              :class="[
                change >= 0 ? 'text-success' : 'text-error',
                'text-sm font-weight-medium'
              ]"
            >
              {{ change >= 0 ? '+' : '' }}{{ change }}%
            </span>
          </div>
          <span v-if="subtitle" class="text-xs text-medium-emphasis">{{ subtitle }}</span>
        </div>

        <VAvatar
          :color="color"
          :class="iconClass"
          variant="tonal"
          size="42"
        >
          <VImg
            v-if="image"
            :src="image"
            :alt="title"
          />
          <VIcon v-else :icon="icon" />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  stats: {
    type: [String, Number],
    required: true,
  },
  change: {
    type: Number,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: 'primary',
  },
  subtitle: {
    type: String,
    default: '',
  },
  cardClass: {
    type: String,
    default: '',
  },
  iconClass: {
    type: String,
    default: '',
  }
})

const showChange = computed(() => props.change !== null)
</script>

<style scoped>
.stat-content {
  flex: 1;
  min-width: 0;
}

.text-h6 {
  line-height: 1.4;
  margin-top: 0.25rem;
}

.text-xs {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}
</style>