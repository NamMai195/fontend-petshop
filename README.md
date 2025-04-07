# Pet Shop Frontend

## Giới thiệu
Dự án website bán hàng thú cưng sử dụng Vue 3 + Vite và Firebase. Cung cấp các chức năng quản lý sản phẩm, blog, giỏ hàng và xác thực người dùng.

## Công nghệ sử dụng
- Vue 3 
- Vite
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- Vue Router
- Pinia
- ESLint
- Prettier

## Yêu cầu hệ thống
- Node.js 16.x trở lên
- npm hoặc yarn
- Firebase CLI

## Cài đặt và Chạy

```bash
# Clone dự án
git clone <repository-url>

# Cài đặt dependencies
npm install

# Tạo file môi trường
cp .env.example .env

# Chạy development server
npm run dev

# Build cho production
npm run build

# Chạy unit tests
npm run test:unit

# Chạy e2e tests
npm run test:e2e
```

## Cấu trúc dự án
```
src/
├── assets/          # Static files
├── components/      # Common components
├── firebase/       # Firebase config & services
├── layouts/        # Layout components
├── router/         # Route definitions
├── stores/         # Pinia stores
├── views/          # Page components
└── App.vue         # Root component
```

## Tính năng chính
- Quản lý sản phẩm
  - Danh sách sản phẩm
  - Chi tiết sản phẩm
  - Tìm kiếm và lọc
- Blog và bài viết
  - CRUD bài viết
  - Upload ảnh
  - Phân trang
- Giỏ hàng
  - Thêm/xóa sản phẩm
  - Cập nhật số lượng
  - Thanh toán
- Xác thực người dùng
  - Đăng nhập/Đăng ký
  - Quản lý profile
  - Phân quyền
- Quản lý đơn hàng
  - Theo dõi đơn hàng
  - Lịch sử mua hàng
  - Trạng thái đơn hàng

## Contributing
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Tác giả
[Tên của bạn]

## License
MIT

## Liên hệ
- Email: mnam3239@gmail.com
- GitHub:[ \[https://github.com/NamMai195\](https://github.com/N)](https://github.com/NamMai195)
