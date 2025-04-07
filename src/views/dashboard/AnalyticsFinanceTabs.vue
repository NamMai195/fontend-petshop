<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h6 class="text-h6">
            Finance Report
          </h6>
          <span class="text-sm text-disabled">Monthly finance report</span>
        </div>

        <VBtn
          icon
          variant="text"
          color="default"
        >
          <VIcon icon="mdi-dots-vertical" />
        </VBtn>
      </div>

      <VTabs
        v-model="activeTab"
        grow
      >
        <VTab value="income">Income</VTab>
        <VTab value="expenses">Expenses</VTab>
      </VTabs>

      <VWindow
        v-model="activeTab"
        class="mt-4"
      >
        <VWindowItem value="income">
          <div class="d-flex flex-column gap-4">
            <div class="d-flex justify-space-between align-center">
              <span class="text-sm">Total Income</span>
              <span class="text-sm font-weight-medium">$24,895</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-sm">Total Sales</span>
              <span class="text-sm font-weight-medium">$14,857</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-sm">Total Revenue</span>
              <span class="text-sm font-weight-medium">$12,628</span>
            </div>
          </div>
        </VWindowItem>

        <VWindowItem value="expenses">
          <div class="d-flex flex-column gap-4">
            <div class="d-flex justify-space-between align-center">
              <span class="text-sm">Total Expenses</span>
              <span class="text-sm font-weight-medium">$12,468</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-sm">Total Costs</span>
              <span class="text-sm font-weight-medium">$8,679</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-sm">Total Payments</span>
              <span class="text-sm font-weight-medium">$2,468</span>
            </div>
          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('income')
</script> 