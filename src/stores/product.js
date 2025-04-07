// src/stores/product.js
import { defineStore } from 'pinia';
import axios from '@/plugins/axios';

export const useProductStore = defineStore('product', {
  // State: chứa dữ liệu của store
  state: () => ({
    products: [], // Mảng chứa danh sách sản phẩm
    productDetail: null, // Chi tiết sản phẩm đang xem
    loading: false, // Trạng thái loading khi gọi API
    error: null, // Lưu lỗi nếu có
    // Ví dụ thêm state cho phân trang nếu API hỗ trợ
    pagination: {
      page: 0,
      size: 20,
      totalPages: 0,
      totalElements: 0
    }
  }),

  // Actions: nơi gọi API và cập nhật state
  actions: {
    // Action để lấy danh sách sản phẩm
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/v1/products', { params });
        if (response.data && typeof response.data === 'object' && Array.isArray(response.data.content)) {
          this.products = response.data.content;
          this.pagination.page = response.data.number;
          this.pagination.size = response.data.size;
          this.pagination.totalPages = response.data.totalPages;
          this.pagination.totalElements = response.data.totalElements;
        } else {
          console.warn("Unexpected response format for fetchProducts:", response.data);
          this.products = [];
        }
      } catch (err) {
        this.error = err.message || 'Failed to fetch products';
        this.products = [];
        console.error("Error in fetchProducts action:", err);
      } finally {
        this.loading = false;
      }
    },

    // Action để lấy chi tiết sản phẩm
    async fetchProductById(productId) {
      this.loading = true;
      this.error = null;
      this.productDetail = null;
      try {
        const response = await axios.get(`/api/v1/products/${productId}`);
        this.productDetail = response.data;
      } catch (err) {
        this.error = err.message || `Failed to fetch product ${productId}`;
        console.error("Error in fetchProductById action:", err);
      } finally {
        this.loading = false;
      }
    },

    // Thêm các actions khác ở đây (ví dụ: tạo, sửa, xóa sản phẩm nếu cần)
    // async createProductAction(productData) { ... }
    // async updateProductAction(productId, productData) { ... }
    // async deleteProductAction(productId) { ... }
  },

  // Getters: (tùy chọn) để tính toán dữ liệu từ state
  getters: {
    // Ví dụ: getter lấy tổng số sản phẩm
    totalProducts: (state) => state.products.length,
    // Ví dụ: getter lấy sản phẩm theo ID từ danh sách đã fetch
    getProductFromList: (state) => (productId) => {
      return state.products.find(p => p.id === productId);
    }
  }
});