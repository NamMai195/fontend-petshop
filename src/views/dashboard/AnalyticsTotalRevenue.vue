<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h6 class="text-h6">
            Total Revenue
          </h6>
          <span class="text-sm text-disabled">Total revenue of the month</span>
        </div>

        <VBtn
          icon
          variant="text"
          color="default"
        >
          <VIcon icon="mdi-dots-vertical" />
        </VBtn>
      </div>

      <div class="d-flex align-center gap-2 mb-4">
        <h4 class="text-h4">
          $24,895
        </h4>
        <span class="text-success text-sm">+14.82%</span>
      </div>

      <div class="d-flex align-center gap-2">
        <div class="d-flex align-center">
          <div
            class="rounded-circle bg-primary me-2"
            style="width: 8px; height: 8px;"
          />
          <span class="text-sm">Revenue</span>
        </div>
        <div class="d-flex align-center">
          <div
            class="rounded-circle bg-success me-2"
            style="width: 8px; height: 8px;"
          />
          <span class="text-sm">Profit</span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template> 