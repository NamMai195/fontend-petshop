// src/stores/orderStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue'; // Bỏ computed nếu không dùng getter trong store này
import apiClient from '@/services/apiClient'; // Import apiClient dùng chung

export const useOrderStore = defineStore('orders', () => {
    // --- State ---
    const myOrders = ref([]);         // Danh sách đơn hàng của tôi
    const loading = ref(false);       // Loading cho danh sách đơn hàng
    const error = ref(null);          // Lỗi cho danh sách đơn hàng
    // *** THÊM STATE CHO ĐƠN HÀNG CHI TIẾT ***
    const currentOrder = ref(null);   // Đơn hàng đang xem chi tiết
    const currentOrderLoading = ref(false);
    const currentOrderError = ref(null);

    // --- Actions ---
    async function fetchMyOrders(page = 0, size = 10) {
        loading.value = true; error.value = null;
        console.log(`[OrderStore] Fetching user orders... Page: ${page}, Size: ${size}`);
        try {
            const response = await apiClient.get('/api/v1/orders/my-orders', {
                params: { page, size, sort: 'orderDate,desc' }
            });
            if (response.data && Array.isArray(response.data.content)) {
                myOrders.value = response.data.content;
                console.log(`[OrderStore] Fetched ${myOrders.value.length} orders.`);
            } else { myOrders.value = []; }
        } catch (err) {
            console.error("[OrderStore] Error fetching user orders:", err);
            if (err.response?.status === 401) { error.value = "Vui lòng đăng nhập lại."; }
            else { error.value = "Không thể tải danh sách đơn hàng."; }
            myOrders.value = [];
        } finally { loading.value = false; }
    }

    // *** THÊM ACTION MỚI: fetchOrderDetails ***
    async function fetchOrderDetails(orderId) {
        if (!orderId) {
            currentOrder.value = null;
            currentOrderError.value = "Không có ID đơn hàng.";
            return;
        }
        currentOrderLoading.value = true;
        currentOrderError.value = null;
        currentOrder.value = null; // Xóa đơn hàng cũ trước khi fetch
        console.log(`[OrderStore] Fetching details for order ID: ${orderId}`);
        try {
            // Gọi API GET /api/v1/orders/{orderId}
            const response = await apiClient.get(`/api/v1/orders/${orderId}`);

            // Kiểm tra cấu trúc response.data (phải là OrderResponse)
            if (response.data && response.data.id) {
                currentOrder.value = response.data; // Lưu toàn bộ object OrderResponse
                console.log('[OrderStore] Order details fetched:', currentOrder.value);
            } else {
                 console.warn(`[OrderStore] Unexpected response structure for order ${orderId}:`, response.data);
                 throw new Error("Dữ liệu đơn hàng trả về không hợp lệ.");
            }
        } catch (err) {
            console.error(`[OrderStore] Error fetching order details ${orderId}:`, err);
            currentOrder.value = null; // Đảm bảo null khi lỗi
             if (err.response?.status === 401) { currentOrderError.value = "Vui lòng đăng nhập lại."; }
             else if (err.response?.status === 403) { currentOrderError.value = "Bạn không có quyền xem đơn hàng này."; }
             else if (err.response?.status === 404) { currentOrderError.value = "Không tìm thấy đơn hàng."; }
             else { currentOrderError.value = "Không thể tải chi tiết đơn hàng."; }
        } finally {
            currentOrderLoading.value = false;
        }
    }


    // Action xóa state đơn hàng khi logout
    function clearMyOrders() {
        console.log('[OrderStore] Clearing my orders state.');
        myOrders.value = []; loading.value = false; error.value = null;
        currentOrder.value = null; currentOrderLoading.value = false; currentOrderError.value = null;
    }


    // --- Exports ---
    return {
        // State
        myOrders, loading, error,
        currentOrder, currentOrderLoading, currentOrderError, // Export thêm state chi tiết
        // Actions
        fetchMyOrders,
        fetchOrderDetails, // Export thêm action chi tiết
        clearMyOrders
        // Getters (nếu cần)
    };
});