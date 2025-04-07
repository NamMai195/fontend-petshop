<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h6 class="text-h6">
            Profit Report
          </h6>
          <span class="text-sm text-disabled">Monthly profit report</span>
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
          $12,628
        </h4>
        <span class="text-success text-sm">+72.80%</span>
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