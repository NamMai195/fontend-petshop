<template>
    <div class="container py-5">
      <h1 class="mb-4">Đơn Hàng Của Tôi</h1>
  
      <div v-if="loading" class="text-center my-5 py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Đang tải đơn hàng...</span>
        </div>
        <p class="mt-3 text-muted">Đang tải lịch sử đơn hàng...</p>
      </div>
  
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Lỗi</h4>
        <p>{{ error }}</p>
        <button class="btn btn-sm btn-danger" @click="orderStore.fetchMyOrders()">Thử lại</button>
      </div>
  
      <div v-else-if="orders.length === 0" class="text-center text-muted my-5 py-5">
        <Icon icon="tabler:file-invoice" class="display-1 text-light mb-3" />
        <h2>Bạn chưa có đơn hàng nào</h2>
        <p>Hãy bắt đầu mua sắm để xem lịch sử đơn hàng tại đây.</p>
        <button class="btn btn-primary mt-3" @click="goToShop">
           <Icon icon="tabler:shopping-cart-plus" class="me-1" /> Bắt đầu mua sắm
        </button>
      </div>
  
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle order-table">
          <thead class="table-light">
            <tr>
              <th scope="col">Mã Đơn Hàng</th>
              <th scope="col">Ngày Đặt</th>
              <th scope="col" class="text-end">Tổng Tiền</th>
              <th scope="col" class="text-center">Trạng Thái</th>
              <th scope="col" class="text-center">Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="fw-medium">#{{ order.orderCode }}</td>
              <td>{{ formatDate(order.orderDate) }}</td>
              <td class="text-end fw-bold">{{ formatCurrencyVND(order.totalAmount) }}</td>
              <td class="text-center">
                <span :class="['badge', getStatusBadgeClass(order.status)]">
                  {{ formatOrderStatus(order.status) }}
                </span>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary border-0 p-1" @click="viewOrderDetails(order.id)" title="Xem chi tiết">
                   <Icon icon="tabler:eye" class="fs-5" />
                </button>
                 </td>
            </tr>
          </tbody>
        </table>
         </div>
  
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore'; // Import order store
  import { Icon } from '@iconify/vue';
  
  const router = useRouter();
  const orderStore = useOrderStore();
  
  // --- Lấy State & Getters từ Store ---
  const orders = computed(() => orderStore.myOrders);
  const loading = computed(() => orderStore.loading);
  const error = computed(() => orderStore.error);
  // Thêm các state phân trang nếu cần:
  // const currentPage = computed(() => orderStore.currentPage);
  // const totalPages = computed(() => orderStore.totalPages);
  
  // --- Hàm Format ---
  const formatCurrencyVND = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Format theo dd/MM/yyyy HH:mm (hoặc kiểu khác tùy ý)
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString; // Trả về chuỗi gốc nếu không parse được
    }
  };
  
  const formatOrderStatus = (status) => {
    // Map các giá trị enum từ API (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, FAILED) sang tiếng Việt
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Chờ xử lý';
      case 'PROCESSING': return 'Đang xử lý';
      case 'SHIPPED': return 'Đã giao hàng';
      case 'DELIVERED': return 'Đã nhận hàng';
      case 'CANCELLED': return 'Đã hủy';
      case 'FAILED': return 'Thất bại';
      default: return status || 'Không xác định';
    }
  };
  
  // Hàm lấy class CSS cho badge trạng thái (dùng màu của Bootstrap)
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'PROCESSING': return 'bg-info text-dark';
      case 'SHIPPED': return 'bg-primary';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-secondary';
      case 'FAILED': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  };
  
  
  // --- Navigation ---
  const goToShop = () => { router.push({ name: 'shop' }); };
  
  const viewOrderDetails = (orderId) => {
    if (!orderId) return;
    // Chuyển đến trang chi tiết đơn hàng (cần tạo route và component này)
    console.log(`Navigating to details for order ${orderId}`);
    // *** Đảm bảo anh đã tạo route có tên là 'orderDetails' và nhận param 'orderId' ***
    router.push({ name: 'orderDetails', params: { orderId: orderId } });
  };
  
  // --- Lifecycle Hook ---
  onMounted(() => {
    // Gọi action fetchMyOrders khi component mount
    orderStore.fetchMyOrders();
  });
  
  </script>
  
  <style scoped>
  .order-table th {
    font-weight: 600;
    color: var(--bs-secondary-color);
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .order-table td {
    vertical-align: middle;
  }
  /* Đảm bảo badge có padding và bo tròn đẹp */
  .badge {
      padding: 0.4em 0.65em;
      font-size: 0.85em;
  }
  .text-light { color: #adb5bd !important; }
  .display-1 { font-size: 5rem; }
  </style>