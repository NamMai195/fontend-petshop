<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h6 class="text-h6">
            Order Statistics
          </h6>
          <span class="text-sm text-disabled">Monthly order statistics</span>
        </div>

        <VBtn
          icon
          variant="text"
          color="default"
        >
          <VIcon icon="mdi-dots-vertical" />
        </VBtn>
      </div>

      <div class="d-flex flex-column gap-4">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <div
              class="rounded-circle bg-primary"
              style="width: 8px; height: 8px;"
            />
            <span class="text-sm">Pending</span>
          </div>
          <span class="text-sm font-weight-medium">245</span>
        </div>

        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <div
              class="rounded-circle bg-success"
              style="width: 8px; height: 8px;"
            />
            <span class="text-sm">Completed</span>
          </div>
          <span class="text-sm font-weight-medium">1,234</span>
        </div>

        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <div
              class="rounded-circle bg-error"
              style="width: 8px; height: 8px;"
            />
            <span class="text-sm">Cancelled</span>
          </div>
          <span class="text-sm font-weight-medium">45</span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template> 