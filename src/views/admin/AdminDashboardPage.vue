<template>
  <VContainer fluid>
    <VRow>
      <!-- Statistics Cards -->
      <VCol
        v-for="card in cards"
        :key="card.title"
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard
          :to="card.to"
          class="card-hover"
          style="cursor: pointer;"
        >
          <VCardText>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-subtitle-2 text-medium-emphasis">
                  {{ card.title }}
                </p>
                <p class="text-h6">
                  {{ card.stats }}
                </p>
                <p class="text-caption">
                  <v-icon
                    :color="card.trend > 0 ? 'success' : 'error'"
                    size="small"
                  >
                    {{ card.trend > 0 ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                  </v-icon>
                  <span :class="card.trend > 0 ? 'text-success' : 'text-error'">{{ Math.abs(card.trend) }}%</span>
                  <span class="text-medium-emphasis"> vs last month</span>
                </p>
              </div>
              <v-avatar
                :color="card.color"
                rounded
                size="48"
                class="elevation-1"
              >
                <v-icon
                  :icon="card.icon"
                  size="24"
                  color="white"
                ></v-icon>
              </v-avatar>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-6">
      <!-- Recent Orders -->
      <VCol cols="12" lg="8">
        <VCard title="Recent Orders">
          <VCardText>
            <VProgressLinear
              v-if="loading"
              indeterminate
              color="primary"
            ></VProgressLinear>
            <VTable v-else>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.customer }}</td>
                  <td>{{ order.product }}</td>
                  <td>{{ formatCurrency(order.amount) }}</td>
                  <td>
                    <VChip
                      :color="getStatusColor(order.status)"
                      size="small"
                      class="text-uppercase"
                    >
                      {{ order.status }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Top Products -->
      <VCol cols="12" lg="4">
        <VCard title="Top Products">
          <VCardText>
            <VProgressLinear
              v-if="loading"
              indeterminate
              color="primary"
            ></VProgressLinear>
            <div
              v-else
              v-for="product in topProducts"
              :key="product.name"
              class="d-flex justify-space-between align-center py-2"
            >
              <div class="d-flex align-center">
                <VAvatar size="42" rounded class="me-3">
                  <VImg :src="product.image" />
                </VAvatar>
                <div>
                  <p class="text-subtitle-2 mb-0">{{ product.name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ product.category }}</p>
                </div>
              </div>
              <div class="text-end">
                <p class="text-subtitle-2 mb-0">{{ product.revenue }}</p>
                <p class="text-caption text-medium-emphasis">Revenue</p>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../../plugins/axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

// Format currency to VND
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

// State
const cards = ref([
  {
    title: 'Total Sales',
    stats: formatCurrency(0),
    trend: 0,
    color: 'primary',
    icon: 'mdi-currency-usd',
    to: '/admin/orders'
  },
  {
    title: 'Total Orders',
    stats: '0',
    trend: 0,
    color: 'success',
    icon: 'mdi-shopping',
    to: '/admin/orders'
  },
  {
    title: 'Total Products',
    stats: '0',
    trend: 0,
    color: 'info',
    icon: 'mdi-package-variant',
    to: '/admin/products'
  },
  {
    title: 'Total Customers',
    stats: '0',
    trend: 0,
    color: 'warning',
    icon: 'mdi-account-group',
    to: '/admin/customers'
  },
])

const recentOrders = ref([])
const topProducts = ref([])
const loading = ref(false)

// Methods
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // Fetch orders
    const ordersResponse = await axios.get('/api/v1/orders/admin/all', {
      params: {
        page: 0,
        size: 5,
      },
    })

    if (ordersResponse.data && ordersResponse.data.content) {
      recentOrders.value = ordersResponse.data.content.map(order => ({
        id: order.id,
        customer: `${order.userId}`,
        product: order.orderItems[0]?.productName || 'N/A',
        amount: order.totalAmount,
        status: order.status,
      }))

      // Update orders card
      const orderCard = cards.value.find(c => c.title === 'Total Orders')
      if (orderCard) {
        orderCard.stats = ordersResponse.data.totalElements.toString()
      }

      // Update sales card with total amount
      const totalSales = ordersResponse.data.content.reduce((sum, order) => sum + order.totalAmount, 0)
      const salesCard = cards.value.find(c => c.title === 'Total Sales')
      if (salesCard) {
        salesCard.stats = formatCurrency(totalSales)
      }
    }

    // Fetch products
    const productsResponse = await axios.get('/api/v1/products')
    if (productsResponse.data && productsResponse.data.content) {
      // Update products card
      const productCard = cards.value.find(c => c.title === 'Total Products')
      if (productCard) {
        productCard.stats = productsResponse.data.totalElements.toString()
      }

      // Update top products
      topProducts.value = productsResponse.data.content
        .slice(0, 5)
        .map(product => ({
          name: product.name,
          category: product.category?.name || 'N/A',
          revenue: formatCurrency(product.price),
          image: product.imageURLs?.[0] || 'https://via.placeholder.com/42',
        }))
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.error('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    'PENDING': 'warning',
    'PROCESSING': 'info',
    'SHIPPED': 'primary',
    'DELIVERED': 'success',
    'CANCELLED': 'error',
    'FAILED': 'error',
  }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}
</style>