import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// --- Layout Imports ---
import AdminLayout from '@/layouts/AdminLayout.vue';
// Sửa đường dẫn dùng alias @, đảm bảo file src/layouts/blank.vue tồn tại
import BlankLayout from '@/layouts/blank.vue';

// --- View Imports (Từ cấu hình của Nam - Giữ nguyên) ---
const HomePage = () => import('@/views/home/HomePage.vue');
const ShopPage = () => import('@/views/products/ShopPage.vue');
const ProductDetailPage = () => import('@/views/products/ProductDetailPage.vue');
const CategoryProductsPage = () => import('@/views/products/CategoryProductsPage.vue');
const BlogPage = () => import('@/views/blog/BlogPage.vue');
const BlogPostDetailPage = () => import('@/views/blog/BlogPostDetailPage.vue');
const ContactPage = () => import('@/views/static/ContactPage.vue');
const AboutPage = () => import('@/views/static/AboutPage.vue');
const CartPage = () => import('@/views/cart/CartPage.vue');
const WishlistPage = () => import('@/views/cart/WishlistPage.vue');
const CheckoutPage = () => import('@/views/cart/CheckoutPage.vue');
const FaqPage = () => import('@/views/static/FaqPage.vue');
const AccountPage = () => import('@/views/account/AccountPage.vue');
const NotFoundPage = () => import('@/views/static/NotFoundPage.vue');
const LoginPage = () => import('@/views/auth/LoginPage.vue');
const RegisterPage = () => import('@/views/auth/RegisterPage.vue');
const SetPasswordPage = () => import('@/views/auth/SetPasswordPage.vue');
const ChangePassword = () => import('@/views/auth/ChangePasswordPage.vue');
const MyOrdersPlaceholderPage = () => import('@/views/orders/MyOrdersPlaceholderPage.vue');
const OrderDetailPage = () => import('@/views/orders/OrderDetailPage.vue');

// --- Admin View Imports (Từ cấu hình của Nam - Giữ nguyên) ---
const AdminDashboardPage = () => import('@/views/admin/AdminDashboardPage.vue');
const AdminProductPage = () => import('@/views/admin/AdminProductPage.vue'); // Trang products của Nam
const AdminCategoryPage = () => import('@/views/admin/AdminCategoryPage.vue'); // Trang categories
const AdminBlogPage = () => import('@/views/admin/AdminBlogPage.vue'); // Trang quản lý blog
// const AdminProductListPage = () => import('@/views/admin/AdminProductListPage.vue'); // Import cũ, có thể không cần nếu dùng AdminProductPage

// --- Sneat Page Imports (Dùng alias @, đảm bảo thư mục src/pages tồn tại nếu dùng) ---
// Nếu không dùng các trang mẫu này, hãy xóa các dòng import và các route tương ứng bên dưới
const SneatAccountSettings = () => import('@/pages/account-settings.vue');
const SneatTypography = () => import('@/pages/typography.vue');
const SneatIcons = () => import('@/pages/icons.vue');
const SneatCards = () => import('@/pages/cards.vue');
const SneatTables = () => import('@/pages/tables.vue');
const SneatFormLayouts = () => import('@/pages/form-layouts.vue');


const routes = [
  // --- User Routes (Layout được quản lý bởi App.vue) ---
  { path: '/', name: 'home', component: HomePage },
  { path: '/shop', name: 'shop', component: ShopPage },
  { path: '/category/:categoryId', name: 'category-products', component: CategoryProductsPage, props: true },
  { path: '/product/:id', name: 'product-detail', component: ProductDetailPage, props: true },
  { path: '/blog', name: 'blog', component: BlogPage },
  { path: '/blog/post/:id', name: 'blog-post-detail', component: BlogPostDetailPage, props: true },
  { path: '/contact', name: 'contact', component: ContactPage },
  { path: '/about', name: 'about', component: AboutPage },
  { path: '/faq', name: 'faq', component: FaqPage },
  // --- Authenticated User Routes ---
  { path: '/cart', name: 'cart', component: CartPage, meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'wishlist', component: WishlistPage, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'checkout', component: CheckoutPage, meta: { requiresAuth: true } },
  { path: '/account', name: 'account-info', component: AccountPage, meta: { requiresAuth: true } },
  { path: '/account/change-password', name: 'change-password', component: ChangePassword, meta: { requiresAuth: true } },
  { path: '/my-orders', name: 'myOrders', component: MyOrdersPlaceholderPage, meta: { requiresAuth: true } },
  { path: '/order/:orderId', name: 'orderDetails', component: OrderDetailPage, props: true, meta: { requiresAuth: true } },


  // --- Admin Routes (Sử dụng AdminLayout) ---
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiredRole: 'ADMIN' },
    redirect: { name: 'admin-dashboard' },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboardPage },
      // Đảm bảo 'admin-products' khớp với name trong navigation/vertical/index.js
      { path: 'products', name: 'admin-products', component: AdminProductPage },
      { path: 'categories', name: 'admin-categories', component: AdminCategoryPage },
      // --- Thêm các route admin khác của Nam ở đây ---
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/AdminOrderPage.vue'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin'
        }
      },
      {
        path: 'reviews',
        name: 'admin-reviews',
        component: () => import('@/views/admin/AdminReviewPage.vue'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin'
        }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagementPage.vue'),
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin'
        }
      },
      {
        path: 'blogs', // Đường dẫn cho trang quản lý blog
        name: 'admin-blogs', // Tên route cho trang quản lý blog
        component: AdminBlogPage,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin'
        }
      },
      // --- Các trang mẫu của Sneat (Xóa nếu không dùng) ---
      { path: 'sneat-account-settings', name: 'admin-sneat-account-settings', component: SneatAccountSettings },
      { path: 'sneat-typography', name: 'admin-sneat-typography', component: SneatTypography },
      { path: 'sneat-icons', name: 'admin-sneat-icons', component: SneatIcons },
      { path: 'sneat-cards', name: 'admin-sneat-cards', component: SneatCards },
      { path: 'sneat-tables', name: 'admin-sneat-tables', component: SneatTables },
      { path: 'sneat-form-layouts', name: 'admin-sneat-form-layouts', component: SneatFormLayouts },
    ]
  },


  // --- Auth & Blank Routes (Sử dụng BlankLayout) ---
  {
    path: '/', // Nhóm các route dùng BlankLayout lại
    component: BlankLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginPage,
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterPage,
        meta: { requiresGuest: true }
      },
      {
        path: 'set-initial-password',
        name: 'set-initial-password',
        component: SetPasswordPage,
        props: route => ({ token: route.query.token })
      },
      // --- Route Not Found (404) ---
      {
        path: '/:pathMatch(.*)*', // Bắt tất cả các route không khớp khác
        name: 'not-found',
        component: NotFoundPage
      }
    ]
  },
  {
    path: '/auth/google/callback',
    name: 'google-callback',
    component: () => import('@/views/auth/GoogleCallback.vue'),
    meta: {
      layout: 'blank'
    }
  },
  {
    path: '/logincallback',
    name: 'login-callback',
    component: () => import('@/views/auth/LoginCallback.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: false
    }
  },
];

// *** Đã xóa hàm removeQueryParams không sử dụng ***

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// --- router.beforeEach (Giữ nguyên logic guard của Nam) ---
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken');
  let isAuthenticated = false;
  let userRole = null;
  let isTokenExpired = true;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const now = Date.now() / 1000;
      isTokenExpired = decodedToken.exp < now;

      if (!isTokenExpired) {
        isAuthenticated = true;
        // Logic lấy role giữ nguyên
         let rolesOrAuthorities = [];
         if (decodedToken.authorities && Array.isArray(decodedToken.authorities)) { rolesOrAuthorities = decodedToken.authorities; }
         else if (decodedToken.roles && Array.isArray(decodedToken.roles)) { rolesOrAuthorities = decodedToken.roles; }
         else if (decodedToken.role) {
             if (Array.isArray(decodedToken.role)) { rolesOrAuthorities = decodedToken.role.map(r => (r && typeof r === 'object' && r.authority) ? r.authority : (typeof r === 'string' ? r : null)).filter(r => r !== null); }
             else if (typeof decodedToken.role === 'string') { rolesOrAuthorities = [decodedToken.role]; }
         } else if (decodedToken.scope && typeof decodedToken.scope === 'string') { rolesOrAuthorities = decodedToken.scope.split(' '); }
         if (rolesOrAuthorities.includes('ROLE_ADMIN') || rolesOrAuthorities.includes('ADMIN')) { userRole = 'ADMIN'; }
         else if (rolesOrAuthorities.includes('ROLE_USER') || rolesOrAuthorities.includes('USER')) { userRole = 'USER'; }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      isAuthenticated = false;
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.matched.some(record => record.meta.requiredRole)
    ? to.matched.find(record => record.meta.requiredRole)?.meta.requiredRole
    : null;
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  // Logic kiểm tra điều kiện giữ nguyên
  if (isAuthenticated && requiresGuest) { return next({ name: 'home' }); }
  if (requiredRole) {
    if (isAuthenticated && userRole === requiredRole) { return next(); }
    else if (isAuthenticated) {
      console.warn(`User (${userRole}) không có quyền (${requiredRole}) truy cập ${to.path}.`);
      return next({ name: 'home' });
    }
    else { return next({ name: 'login', query: { redirect: to.fullPath } }); }
  }
  if (requiresAuth) {
    if (isAuthenticated) { return next(); }
    else { return next({ name: 'login', query: { redirect: to.fullPath } }); }
  }
  return next();
});

// *** Đã xóa router.afterEach không cần thiết nếu đã xóa watch trong AdminLayout.vue ***

export default router;
