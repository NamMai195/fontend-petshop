// src/stores/product.js
import { defineStore } from 'pinia';
// Import các hàm gọi API (bạn cần tạo file này như hướng dẫn trước)
import { getAllProducts, getProductById } from '@/api/products';
// Import thêm các hàm API khác nếu cần (createProduct, updateProduct,...)

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
        // Gọi hàm API từ src/api/products.js
        const responseData = await getAllProducts({
           // page: this.pagination.page, // Gửi thông tin trang nếu cần
           // size: this.pagination.size,
           ...params // Gửi các tham số lọc khác (categoryId, keyword...)
        });

        // Xử lý dữ liệu trả về từ API
        if (Array.isArray(responseData)) { // Nếu API chỉ trả về mảng sản phẩm
          this.products = responseData;
        } else if (responseData && typeof responseData === 'object' && Array.isArray(responseData.content)) {
          // Nếu API trả về có phân trang (giống cấu trúc Page trong Spring Boot)
          this.products = responseData.content;
          this.pagination.page = responseData.number;
          this.pagination.size = responseData.size;
          this.pagination.totalPages = responseData.totalPages;
          this.pagination.totalElements = responseData.totalElements;
        } else {
          console.warn("Unexpected response format for fetchProducts:", responseData);
          this.products = []; // Đặt lại mảng rỗng nếu định dạng không đúng
        }

      } catch (err) {
        this.error = err.message || 'Failed to fetch products';
        this.products = []; // Xóa sản phẩm cũ nếu lỗi
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
        // Gọi hàm API từ src/api/products.js
        this.productDetail = await getProductById(productId);
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