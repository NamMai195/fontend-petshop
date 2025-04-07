<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h6 class="text-h6">
            Transactions
          </h6>
          <span class="text-sm text-disabled">Recent transactions</span>
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
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="d-flex justify-space-between align-center"
        >
          <div class="d-flex align-center gap-2">
            <VAvatar
              :color="transaction.color"
              variant="tonal"
              size="32"
            >
              <VIcon :icon="transaction.icon" />
            </VAvatar>
            <div>
              <span class="text-sm font-weight-medium">{{ transaction.title }}</span>
              <p class="text-xs text-disabled mb-0">
                {{ transaction.date }}
              </p>
            </div>
          </div>
          <span
            :class="transaction.amount >= 0 ? 'text-success' : 'text-error'"
            class="text-sm font-weight-medium"
          >
            {{ transaction.amount >= 0 ? '+' : '' }}${{ transaction.amount }}
          </span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
const transactions = [
  {
    id: 1,
    title: 'Payment from John',
    date: 'Today, 2:30 PM',
    amount: 2500,
    icon: 'mdi-arrow-down',
    color: 'success',
  },
  {
    id: 2,
    title: 'Payment to Sarah',
    date: 'Today, 1:30 PM',
    amount: -1200,
    icon: 'mdi-arrow-up',
    color: 'error',
  },
  {
    id: 3,
    title: 'Payment from Mike',
    date: 'Today, 12:30 PM',
    amount: 3500,
    icon: 'mdi-arrow-down',
    color: 'success',
  },
  {
    id: 4,
    title: 'Payment to David',
    date: 'Today, 11:30 AM',
    amount: -800,
    icon: 'mdi-arrow-up',
    color: 'error',
  },
]
</script> 