// src/api/cart.js
import api from './axiosInstance'; // Import instance Axios đã cấu hình

// Lấy giỏ hàng của người dùng hiện tại
// GET /api/v1/cart
export const getUserCart = async () => {
  try {
    const response = await api.get('/api/v1/cart');
    return response.data; // Trả về CartResponse
  } catch (error) {
    console.error('API Error - Failed to fetch user cart:', error.response?.data || error.message);
    throw error; // Ném lỗi để store xử lý
  }
};

// Thêm sản phẩm vào giỏ hàng
// POST /api/v1/cart/items
export const addItemToCart = async (addItemRequest) => {
  // addItemRequest: { productId, quantity }
  try {
    const response = await api.post('/api/v1/cart/items', addItemRequest);
    return response.data; // Trả về CartResponse đã cập nhật
  } catch (error) {
    console.error('API Error - Failed to add item to cart:', error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
// PUT /api/v1/cart/items/{cartItemId}
export const updateCartItemQuantity = async (cartItemId, updateItemRequest) => {
  // updateItemRequest: { quantity }
  try {
    const response = await api.put(`/api/v1/cart/items/${cartItemId}`, updateItemRequest);
    return response.data; // Trả về CartResponse đã cập nhật
  } catch (error) {
    console.error(`API Error - Failed to update cart item ${cartItemId} quantity:`, error.response?.data || error.message);
    throw error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
// DELETE /api/v1/cart/items/{cartItemId}
export const removeItemFromCart = async (cartItemId) => {
  try {
    const response = await api.delete(`/api/v1/cart/items/${cartItemId}`);
    return response.data; // Trả về CartResponse đã cập nhật
  } catch (error) {
    console.error(`API Error - Failed to remove cart item ${cartItemId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Xóa toàn bộ giỏ hàng
// DELETE /api/v1/cart
export const clearCart = async () => {
  try {
    const response = await api.delete('/api/v1/cart');
    return response; // Thường trả về status 200 OK hoặc 204 No Content
  } catch (error) {
    console.error('API Error - Failed to clear cart:', error.response?.data || error.message);
    throw error;
  }
};