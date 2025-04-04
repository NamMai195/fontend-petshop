// src/stores/cartStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios'; // Import axios
const updatingItemId = ref(null); 
// Tạo apiClient riêng cho store hoặc import từ file dùng chung nếu có
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor để thêm token vào request (quan trọng)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error("API Request Error Interceptor:", error);
  return Promise.reject(error);
});

// Định nghĩa store với tên là 'cart'
export const useCartStore = defineStore('cart', () => {
  // --- State ---
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // --- Getters ---
  const totalQuantity = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
  });

   const formattedTotalPrice = computed(() => {
       if (typeof totalPrice.value !== 'number') return '';
       return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice.value);
   });

  // --- Actions ---
  async function fetchCart() {
    const token = localStorage.getItem('accessToken');
    if (!token) { /* ... xử lý không token ... */ items.value=[]; return; }
    if (loading.value) return;
    loading.value = true; error.value = null;
    console.log('[CartStore] Fetching cart...');
    try {
      const response = await apiClient.get('/api/v1/cart');
      items.value = response.data.items?.map(item => ({
           id: item.cartItemId, productId: item.productId, name: item.productName,
           price: item.productPrice, imageUrl: item.productImageUrl, quantity: item.quantity
       })) || [];
       console.log('Dữ liệu items TRONG STORE:', JSON.stringify(items.value, null, 2));

       console.log('[CartStore] Cart fetched successfully.');
    } catch (err) {
        // ... xử lý lỗi fetchCart ...
         if (err.response && err.response.status === 404) { items.value = []; error.value = null; }
         else if (err.response && err.response.status === 401) { items.value = []; error.value = null; console.warn("[CartStore] Unauthorized fetching cart...") }
         else { error.value = "Không thể tải giỏ hàng."; console.error("[CartStore] Error fetching cart:", err); }
    } finally {
      loading.value = false;
    }
  }
  async function updateItemQuantity(itemId, quantity) {
   const token = localStorage.getItem('accessToken');
   if (!token) return { success: false, message: 'Vui lòng đăng nhập.' };
   if (typeof quantity !== 'number' || quantity < 1) {
       return { success: false, message: 'Số lượng không hợp lệ.' };
   }

   updatingItemId.value = itemId; // <-- Đánh dấu item đang cập nhật
   console.log(`[CartStore] Updating item ${itemId} quantity to ${quantity}...`);
   try {
       await apiClient.put(`/api/v1/cart/items/${itemId}`, { quantity });
       console.log(`[CartStore] Item ${itemId} quantity updated successfully.`);
       await fetchCart();
       return { success: true };
   } catch (err) {
       console.error(`[CartStore] Error updating item ${itemId} quantity:`, err);
       let message = "Cập nhật số lượng thất bại.";
       // ... xử lý lỗi ...
       return { success: false, message: message };
   } finally {
       updatingItemId.value = null; // <-- Bỏ đánh dấu khi hoàn thành
   }
 }


  // *** HÀM addItem ĐÃ SỬA ***
  async function addItem(productId, quantity = 1) {
    const token = localStorage.getItem('accessToken');
    if (!token) return { success: false, message: 'Vui lòng đăng nhập.' };

    console.log(`[CartStore] Adding item ${productId}...`);
    try {
      // 1. Gọi API để thêm item
      await apiClient.post('/api/v1/cart/items', { productId, quantity });
      console.log('[CartStore] Item added via API successfully.');

      // 2. Gọi lại fetchCart() để lấy dữ liệu giỏ hàng mới nhất
      await fetchCart(); // <-- THAY ĐỔI QUAN TRỌNG

      return { success: true };
    } catch (err) {
      console.error("[CartStore] Error adding item:", err);
      let message = "Thêm vào giỏ hàng thất bại.";
       if (err.response && err.response.status === 401) { message = "Phiên đăng nhập hết hạn."; }
       else if (err.response && err.response.status === 404) { message = "Sản phẩm không tồn tại."; }
       else if (err.response && err.response.status === 400) { message = err.response.data?.message || "Số lượng không hợp lệ hoặc hết hàng."; }
      return { success: false, message: message };
    }
    // Không cần finally ở đây nếu không có loading cục bộ cho action này
  }

  // *** HÀM removeItem ĐÃ SỬA ***
  async function removeItem(itemId) {
     const token = localStorage.getItem('accessToken');
     if (!token) return { success: false, message: 'Vui lòng đăng nhập.' };

    console.log(`[CartStore] Removing item ${itemId}...`);
    try {
      // 1. Gọi API để xóa item
      await apiClient.delete(`/api/v1/cart/items/${itemId}`);
      console.log('[CartStore] Item removed via API successfully.');

      // 2. Gọi lại fetchCart() để lấy dữ liệu giỏ hàng mới nhất
      await fetchCart(); // <-- THAY ĐỔI QUAN TRỌNG

      return { success: true };
    } catch (err) {
      console.error("[CartStore] Error removing item:", err);
       let message = "Xóa sản phẩm thất bại.";
       if (err.response && err.response.status === 401) { message = "Phiên đăng nhập hết hạn."; }
       else if (err.response && err.response.status === 404) { message = "Sản phẩm không có trong giỏ."; }
      return { success: false, message: message };
    }
     // Không cần finally ở đây nếu không có loading cục bộ cho action này
  }

   function clearCartLocally() {
       console.log('[CartStore] Clearing cart locally.');
       items.value = []; error.value = null; loading.value = false;
   }

  return {
   items, loading, error, updatingItemId, // State (thêm updatingItemId)
   totalQuantity, totalPrice, formattedTotalPrice, // Getters
   fetchCart, addItem, removeItem, updateItemQuantity, clearCartLocally 
  };
});