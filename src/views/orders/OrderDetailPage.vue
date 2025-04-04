<template>
    <div class="container py-5">
      <div v-if="loading" class="text-center my-5 py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Đang tải chi tiết đơn hàng...</span>
        </div>
        <p class="mt-3 text-muted">Đang tải chi tiết đơn hàng...</p>
      </div>
  
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Lỗi Tải Đơn Hàng</h4>
        <p>{{ error }}</p>
        <router-link :to="{ name: 'myOrders' }" class="btn btn-secondary btn-sm me-2">Quay lại Danh sách đơn hàng</router-link>
        <button v-if="orderId" class="btn btn-sm btn-danger" @click="orderStore.fetchOrderDetails(orderId)">Thử lại</button>
      </div>
  
      <div v-else-if="order" class="order-details">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h1 class="mb-0">Chi tiết Đơn Hàng #{{ order.orderCode }}</h1>
          <router-link :to="{ name: 'myOrders' }" class="btn btn-outline-secondary btn-sm">
             <Icon icon="tabler:arrow-left" class="me-1"/> Danh sách đơn hàng
          </router-link>
        </div>
  
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-light fw-bold">Thông tin đơn hàng</div>
              <div class="card-body">
                <p><strong>Mã đơn hàng:</strong> #{{ order.orderCode }}</p>
                <p><strong>Ngày đặt:</strong> {{ formatDate(order.orderDate) }}</p>
                <p><strong>Trạng thái:</strong> <span :class="['badge', getStatusBadgeClass(order.status)]">{{ formatOrderStatus(order.status) }}</span></p>
                <p><strong>Phương thức thanh toán:</strong> {{ formatPaymentMethod(order.paymentMethod) }}</p>
                <p><strong>Trạng thái thanh toán:</strong> {{ formatPaymentStatus(order.paymentStatus) }}</p>
                <p v-if="order.notes" class="mb-0"><strong>Ghi chú:</strong> {{ order.notes }}</p>
              </div>
            </div>
          </div>
  
          <div class="col-md-6">
             <div class="card shadow-sm h-100">
               <div class="card-header bg-light fw-bold">Địa chỉ giao hàng</div>
               <div class="card-body">
                  <p v-if="order.shippingAddress">{{ formatAddress(order.shippingAddress) }}</p>
                  <p v-else class="text-muted">Không có thông tin địa chỉ giao hàng.</p>
                  </div>
             </div>
             </div>
        </div>
  
         <div class="card shadow-sm mt-4">
          <div class="card-header bg-light fw-bold">Các sản phẩm trong đơn hàng</div>
          <div class="card-body p-0">
              <div class="table-responsive">
                  <table class="table align-middle mb-0 order-items-table">
                    <thead class="table-light">
                      <tr>
                        <th scope="col" style="width: 10%;">Ảnh</th>
                        <th scope="col" style="width: 40%;">Sản phẩm</th>
                        <th scope="col" class="text-end">Đơn giá</th>
                        <th scope="col" class="text-center">Số lượng</th>
                        <th scope="col" class="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in order.orderItems" :key="item.orderItemId">
                        <td>
                           <img v-if="item.productImageUrl" :src="item.productImageUrl" :alt="item.productName" width="50" height="50" class="img-fluid rounded object-fit-cover">
                           <img v-else src="/src/assets/images/logo.png" width="50" height="50" class="img-fluid rounded object-fit-contain p-1 bg-light" alt="N/A">
                        </td>
                        <td>
                          <div>{{ item.productName }}</div>
                          <small class="text-muted">SKU: {{ item.productSku }}</small>
                        </td>
                        <td class="text-end">{{ formatCurrencyVND(item.priceAtOrder) }}</td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end fw-medium">{{ formatItemSubtotal(item) }}</td>
                      </tr>
                    </tbody>
                  </table>
              </div>
          </div>
           <div class="card-footer bg-light d-flex justify-content-end">
              <strong class="fs-5">Tổng cộng: {{ formatCurrencyVND(order.totalAmount) }}</strong>
           </div>
        </div>
  
      </div>
  
       <div v-else-if="!loading && !error" class="alert alert-warning text-center my-5 py-5">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Không tìm thấy thông tin cho đơn hàng này.</p>
          <router-link :to="{ name: 'myOrders' }" class="btn btn-secondary mt-3">
            Quay lại Danh sách đơn hàng
          </router-link>
       </div>
  
    </div>
  </template>
  
  <script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { Icon } from '@iconify/vue';

const props = defineProps({
  orderId: { type: [String, Number], required: true }
});

const router = useRouter();
const orderStore = useOrderStore();

// --- State & Getters ---
const order = computed(() => orderStore.currentOrder);
const loading = computed(() => orderStore.currentOrderLoading);
const error = computed(() => orderStore.currentOrderError);

// --- HÀM FORMAT ĐÃ BỔ SUNG ĐẦY ĐỦ ---
const formatCurrencyVND = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return dateString; }
};

const formatOrderStatus = (status) => {
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

const formatAddress = (addr) => {
    if (!addr || typeof addr !== 'object') {
         console.warn("formatAddress received invalid input:", addr);
         return 'Địa chỉ không có sẵn';
    }
    const parts = [
        `${addr.streetNumber || ''} ${addr.street || ''}`.trim(),
        addr.ward, addr.district, addr.city, addr.country
    ];
    const formatted = parts.filter(part => part && String(part).trim()).join(', ');
    return formatted || `Địa chỉ ID: ${addr.id || 'N/A'}`;
};

const formatPaymentMethod = (method) => {
    switch (method?.toUpperCase()) {
        case 'COD': return 'Thanh toán khi nhận hàng';
        case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng';
        case 'CREDIT_CARD': return 'Thẻ tín dụng';
        case 'MOMO': return 'Ví MoMo';
        case 'VNPAY': return 'VNPAY';
        default: return method || 'N/A';
    }
};

const formatPaymentStatus = (status) => {
     switch (status?.toUpperCase()) {
        case 'PENDING': return 'Chờ thanh toán';
        case 'PAID': return 'Đã thanh toán';
        case 'FAILED': return 'Thất bại';
        case 'REFUNDED': return 'Đã hoàn tiền';
        default: return status || 'N/A';
    }
};

const formatItemSubtotal = (item) => {
    // Sử dụng priceAtOrder cho trang chi tiết đơn hàng
    if (!item || typeof item.priceAtOrder !== 'number' || typeof item.quantity !== 'number') return '';
    return formatCurrencyVND(item.priceAtOrder * item.quantity);
};

const handleImageError = (event) => {
    event.target.src = '/src/assets/images/logo.png';
    event.target.style.objectFit = 'contain';
    event.target.style.padding = '5px';
    event.target.classList.add('bg-light');
};

// --- Lifecycle & Watcher ---
onMounted(() => {
  if (props.orderId) {
    orderStore.fetchOrderDetails(props.orderId);
  } else { console.error("[OrderDetailPage] Missing orderId prop.") }
});

watch(() => props.orderId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    orderStore.fetchOrderDetails(newId);
  }
});

</script>
  
  <style scoped>
  .order-details .card { margin-bottom: 1.5rem; }
  .order-details .card-header { font-size: 1.1rem; }
  .order-items-table th { font-weight: 600; font-size: 0.9em; }
  .order-items-table td { vertical-align: middle; font-size: 0.95rem; }
  .order-items-table img { max-width: 50px; height: auto; }
  .badge { font-size: 0.85em; padding: 0.4em 0.6em; }
  .object-fit-cover { object-fit: cover; }
  .object-fit-contain { object-fit: contain; }
  .bg-light { background-color: #f8f9fa !important; }
  .text-light { color: #adb5bd !important; }
  .display-1 { font-size: 5rem; }
  </style>