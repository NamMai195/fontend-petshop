// Đây là một ví dụ về cách tạo API endpoint trong backend của bạn
// Bạn cần thêm đoạn code này vào backend của mình

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép CORS

// API endpoint để lấy danh sách tỉnh/thành phố
app.get('/api/provinces', async (req, res) => {
  try {
    const response = await axios.get('https://provinces.open-api.vn/api/?depth=1');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ error: 'Failed to fetch provinces data' });
  }
});

// Các API endpoint khác...

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 