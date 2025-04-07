<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-medium">
        {{ totalItems }} orders found
      </h1>
    </div>

    <!-- Filters -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filters.status"
              label="Order Status"
              :items="orderStatuses"
              item-title="text"
              item-value="value"
              clearable
              variant="outlined"
              density="compact"
              @update:model-value="fetchOrders"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <VTextField
              v-model="filters.keyword"
              label="Search by name/email"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="fetchOrders"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Data Table -->
    <VCard>
      <VCardText>
        <VProgressLinear
          v-if="loading"
          indeterminate
          color="primary"
        ></VProgressLinear>

        <VTable v-else>
          <thead>
            <tr>
              <th>Order Code</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Order Date</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.orderCode }}</td>
              <td>
                <div class="d-flex align-center">
                  <VAvatar size="32" class="me-2">
                    <VIcon icon="mdi-account" />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">{{ order.user?.firstName }} {{ order.user?.lastName }}</div>
                    <div class="text-caption">{{ order.user?.username }}</div>
                  </div>
                  <VBtn
                    icon
                    variant="text"
                    color="info"
                    size="small"
                    class="ms-2"
                    @click="openUserDetails(order.user)"
                  >
                    <VIcon icon="mdi-information" />
                  </VBtn>
                </div>
              </td>
              <td>
                <div class="text-caption">
                  <div>{{ order.user?.email }}</div>
                  <div>{{ order.user?.phone }}</div>
                </div>
              </td>
              <td>{{ formatCurrency(order.totalAmount) }}</td>
              <td>
                <VChip
                  :color="getPaymentMethodColor(order.paymentMethod)"
                  size="small"
                >
                  {{ formatPaymentMethod(order.paymentMethod) }}
                </VChip>
              </td>
              <td>
                <VChip
                  :color="getPaymentStatusColor(order.paymentStatus)"
                  size="small"
                >
                  {{ order.paymentStatus }}
                </VChip>
              </td>
              <td>
                <VChip
                  :color="getOrderStatusColor(order.status)"
                  size="small"
                >
                  {{ order.status }}
                </VChip>
              </td>
              <td>{{ formatDate(order.orderDate) }}</td>
              <td class="text-center">
                <VBtn
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="openOrderDetails(order)"
                >
                  <VIcon icon="mdi-eye" />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  color="warning"
                  size="small"
                  @click="openStatusDialog(order)"
                >
                  <VIcon icon="mdi-pencil" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Empty State -->
        <div
          v-if="!loading && (!orders || orders.length === 0)"
          class="text-center py-4"
        >
          <VIcon
            icon="mdi-package-variant"
            size="48"
            color="grey-lighten-1"
            class="mb-2"
          />
          <p class="text-medium-emphasis">No orders found</p>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-end mt-4">
          <VPagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Order Details Dialog -->
    <VDialog
      v-model="detailsDialog"
      max-width="800"
    >
      <VCard v-if="selectedOrder">
        <VCardTitle class="text-h5 pa-4">
          Order Details #{{ selectedOrder.orderCode }}
        </VCardTitle>

        <VCardText class="pt-4">
          <VRow>
            <VCol cols="12" md="6">
              <h3 class="text-h6 mb-2">Customer Information</h3>
              <div class="mb-4">
                <div class="d-flex align-center mb-2">
                  <VAvatar size="40" class="me-2">
                    <VIcon icon="mdi-account" />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">{{ selectedOrder.user?.firstName }} {{ selectedOrder.user?.lastName }}</div>
                    <div class="text-caption">{{ selectedOrder.user?.username }}</div>
                  </div>
                </div>
                <p><strong>Email:</strong> {{ selectedOrder.user?.email }}</p>
                <p><strong>Phone:</strong> {{ selectedOrder.user?.phone }}</p>
              </div>

              <h3 class="text-h6 mb-2">Order Information</h3>
              <div class="mb-4">
                <p><strong>Order Date:</strong> {{ formatDate(selectedOrder.orderDate) }}</p>
                <p><strong>Total Amount:</strong> {{ formatCurrency(selectedOrder.totalAmount) }}</p>
                <p><strong>Payment Method:</strong> {{ formatPaymentMethod(selectedOrder.paymentMethod) }}</p>
                <p><strong>Payment Status:</strong> {{ selectedOrder.paymentStatus }}</p>
                <p><strong>Order Status:</strong> {{ selectedOrder.status }}</p>
                <p v-if="selectedOrder.notes"><strong>Notes:</strong> {{ selectedOrder.notes }}</p>
              </div>

              <h3 class="text-h6 mb-2">Shipping Address</h3>
              <div class="mb-4" v-if="selectedOrder.shippingAddress">
                <p>{{ formatAddress(selectedOrder.shippingAddress) }}</p>
              </div>
            </VCol>

            <VCol cols="12" md="6">
              <h3 class="text-h6 mb-2">Order Items</h3>
              <VList lines="two">
                <VListItem
                  v-for="item in selectedOrder.orderItems"
                  :key="item.orderItemId"
                  :title="item.productName"
                >
                  <template v-slot:prepend>
                    <VAvatar rounded="lg">
                      <VImg :src="item.productImageUrl || 'https://via.placeholder.com/50'" />
                    </VAvatar>
                  </template>
                  <template v-slot:subtitle>
                    {{ item.quantity }}x @ {{ formatCurrency(item.priceAtOrder) }}
                    = {{ formatCurrency(item.subTotal) }}
                  </template>
                </VListItem>
              </VList>
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="primary"
            variant="text"
            @click="detailsDialog = false"
          >
            Close
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Update Status Dialog -->
    <VDialog
      v-model="statusDialog"
      max-width="400"
    >
      <VCard v-if="selectedOrder">
        <VCardTitle class="text-h5 pa-4">
          Update Order Status
        </VCardTitle>

        <VCardText class="pt-4">
          <VSelect
            v-model="newStatus"
            label="Order Status"
            :items="orderStatuses"
            item-title="text"
            item-value="value"
            :rules="[v => !!v || 'Status is required']"
            required
          />
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey-darken-1"
            variant="text"
            @click="statusDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="updating"
            @click="updateOrderStatus"
          >
            Update
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- User Details Dialog -->
    <VDialog
      v-model="userDialog"
      max-width="600"
    >
      <VCard v-if="selectedUser">
        <VCardTitle class="text-h5 pa-4">
          User Information
        </VCardTitle>

        <VCardText class="pt-4">
          <div class="d-flex align-center mb-4">
            <VAvatar size="64" class="me-3">
              <VIcon icon="mdi-account" size="40" />
            </VAvatar>
            <div>
              <div class="text-h6">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</div>
              <div class="text-caption">{{ selectedUser.username }}</div>
              <VChip
                :color="selectedUser.type === 'ADMIN' ? 'error' : 'success'"
                size="small"
                class="mt-1"
              >
                {{ selectedUser.type }}
              </VChip>
              <VChip
                :color="getUserStatusColor(selectedUser.status)"
                size="small"
                class="mt-1 ms-2"
              >
                {{ selectedUser.status }}
              </VChip>
            </div>
          </div>

          <VDivider class="mb-4" />

          <VRow>
            <VCol cols="12" sm="6">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">Contact Information</h3>
              <div class="mb-4">
                <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                <p><strong>Phone:</strong> {{ selectedUser.phone }}</p>
                <p><strong>Gender:</strong> {{ selectedUser.gender }}</p>
                <p v-if="selectedUser.birthday"><strong>Birthday:</strong> {{ formatDate(selectedUser.birthday) }}</p>
              </div>
            </VCol>

            <VCol cols="12" sm="6">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">Addresses</h3>
              <div v-if="selectedUser.addresses && selectedUser.addresses.length > 0">
                <div v-for="(address, index) in selectedUser.addresses" :key="index" class="mb-2">
                  <VChip
                    :color="address.addressType === 1 ? 'primary' : 'secondary'"
                    size="small"
                    class="mb-1"
                  >
                    {{ address.addressType === 1 ? 'Shipping' : 'Billing' }}
                  </VChip>
                  <p class="text-caption">{{ formatAddress(address) }}</p>
                </div>
              </div>
              <p v-else class="text-caption">No addresses found</p>
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="primary"
            variant="text"
            @click="userDialog = false"
          >
            Close
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '../../plugins/axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Constants
const orderStatuses = [
  { text: 'Pending', value: 'PENDING' },
  { text: 'Processing', value: 'PROCESSING' },
  { text: 'Shipped', value: 'SHIPPED' },
  { text: 'Delivered', value: 'DELIVERED' },
  { text: 'Cancelled', value: 'CANCELLED' },
  { text: 'FAILED', value: 'FAILED' }
]

// State
const loading = ref(false)
const updating = ref(false)
const orders = ref([])
const totalItems = ref(0)
const totalPages = ref(0)
const page = ref(1)
const detailsDialog = ref(false)
const statusDialog = ref(false)
const userDialog = ref(false)
const selectedOrder = ref(null)
const selectedUser = ref(null)
const newStatus = ref(null)
const filters = ref({
  status: null,
  keyword: null
})

// Methods
const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/v1/orders/admin/all', {
      params: {
        page: page.value - 1,
        size: 10,
        status: filters.value.status,
        keyword: filters.value.keyword
      },
    })

    if (response.data) {
      orders.value = response.data.content
      totalItems.value = response.data.totalElements
      totalPages.value = response.data.totalPages

      // Fetch user details for each order
      for (const order of orders.value) {
        if (order.userId) {
          try {
            const userResponse = await axios.get(`/api/v1/users/${order.userId}`)
            order.user = userResponse.data
          } catch (error) {
            console.error(`Error fetching user details for order ${order.id}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    toast.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('vi-VN')
}

const formatAddress = (address) => {
  if (!address) return ''
  const parts = []
  if (address.apartmentNumber) parts.push(address.apartmentNumber)
  if (address.floor) parts.push(`Floor ${address.floor}`)
  if (address.building) parts.push(address.building)
  if (address.streetNumber) parts.push(address.streetNumber)
  if (address.street) parts.push(address.street)
  if (address.ward) parts.push(address.ward)
  if (address.district) parts.push(address.district)
  if (address.city) parts.push(address.city)
  if (address.country) parts.push(address.country)
  return parts.join(', ')
}

const formatPaymentMethod = (method) => {
  return method?.replace('_', ' ') || ''
}

const getOrderStatusColor = (status) => {
  const colors = {
    'PENDING': 'warning',
    'PROCESSING': 'info',
    'SHIPPED': 'primary',
    'DELIVERED': 'success',
    'CANCELLED': 'error',
    'FAILED': 'error'
  }
  return colors[status] || 'grey'
}

const getPaymentMethodColor = (method) => {
  const colors = {
    'COD': 'success',
    'BANK_TRANSFER': 'primary',
    'CREDIT_CARD': 'secondary',
    'MOMO': 'pink',
    'VNPAY': 'blue'
  }
  return colors[method] || 'grey'
}

const getPaymentStatusColor = (status) => {
  const colors = {
    'PENDING': 'warning',
    'PAID': 'success',
    'FAILED': 'error',
    'REFUNDED': 'info'
  }
  return colors[status] || 'grey'
}

const getUserStatusColor = (status) => {
  const colors = {
    'ACTIVE': 'success',
    'INACTIVE': 'error',
    'PENDING_VERIFICATION': 'warning',
    'NONE': 'grey'
  }
  return colors[status] || 'grey'
}

const openOrderDetails = (order) => {
  selectedOrder.value = order
  detailsDialog.value = true
}

const openStatusDialog = (order) => {
  selectedOrder.value = order
  newStatus.value = order.status
  statusDialog.value = true
}

const openUserDetails = (user) => {
  selectedUser.value = user
  userDialog.value = true
}

const updateOrderStatus = async () => {
  if (!newStatus.value) return

  updating.value = true
  try {
    await axios.patch(`/api/v1/orders/admin/${selectedOrder.value.id}/status`, {
      status: newStatus.value
    })
    
    toast.success('Order status updated successfully')
    statusDialog.value = false
    fetchOrders() // Refresh orders list
  } catch (error) {
    console.error('Error updating order status:', error)
    toast.error('Failed to update order status')
  } finally {
    updating.value = false
  }
}

// Watchers
watch(page, () => {
  fetchOrders()
})

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}
</style> 