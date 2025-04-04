import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Lấy danh sách sản phẩm (Public)
// Tương ứng với: GET /api/v1/products
const getAllProducts = async (params = {}) => {
  // params: { keyword?, categoryId?, minPrice?, maxPrice?, page = 0, size = 20 }
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/products`, { params });
    // response.data là mảng ProductResponse[]
    console.log('Products fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy chi tiết sản phẩm bằng ID (Public)
// Tương ứng với: GET /api/v1/products/{productId}
const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/products/${productId}`);
    // response.data là ProductResponse
    console.log(`Product ${productId} fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Tạo sản phẩm mới (Admin)
// Tương ứng với: POST /api/v1/products
const createProduct = async (productCreationRequest) => {
  // productCreationRequest: Dựa trên schema ProductCreationRequest
  try {
    // Yêu cầu xác thực (Admin)
    const response = await axios.post(`${API_BASE_URL}/api/v1/products`, productCreationRequest);
     // response.data là ProductResponse của sản phẩm mới tạo (status 201)
    console.log('Product created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create product:', error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật thông tin sản phẩm (Admin)
// Tương ứng với: PUT /api/v1/products/{productId}
const updateProduct = async (productId, productUpdateRequest) => {
   // productUpdateRequest: Dựa trên schema ProductUpdateRequest
  try {
     // Yêu cầu xác thực (Admin)
    const response = await axios.put(`${API_BASE_URL}/api/v1/products/${productId}`, productUpdateRequest);
    // response.data là ProductResponse đã cập nhật
    console.log(`Product ${productId} updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Xóa sản phẩm (Admin)
// Tương ứng với: DELETE /api/v1/products/{productId}
const deleteProduct = async (productId) => {
  try {
    // Yêu cầu xác thực (Admin)
    const response = await axios.delete(`${API_BASE_URL}/api/v1/products/${productId}`);
    // Response thành công là status 204 No Content
    console.log(`Product ${productId} deleted successfully.`);
    return response;
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};