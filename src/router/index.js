import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

// --- Layout Imports ---
import AdminLayout from '@/layouts/AdminLayout.vue'; // Import layout Admin

// --- View Imports ---
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

// Admin Views
const AdminDashboardPage = () => import('@/views/admin/AdminDashboardPage.vue');
const AdminProductListPage = () => import('@/views/admin/AdminProductListPage.vue'); // <== THÊM IMPORT CHO TRANG PRODUCT LIST (sẽ tạo file sau)


const routes = [
  // --- User Routes (Sử dụng layout mặc định trong App.vue) ---
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopPage
  },
  {
    path: '/category/:categoryId',
    name: 'category-products',
    component: CategoryProductsPage,
    props: true
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetailPage,
    props: true
  },
  {
    path: '/blog',
    name: 'blog',
    component: BlogPage
  },
  {
    path: '/blog/post/:id',
    name: 'blog-post-detail',
    component: BlogPostDetailPage,
    props: true
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactPage
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage
  },
  {
    path: '/faq',
    name: 'faq',
    component: FaqPage
  },
  // --- Authenticated User Routes ---
  {
    path: '/cart',
    name: 'cart',
    component: CartPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: WishlistPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/account',
    name: 'account-info',
    component: AccountPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/account/change-password',
    name: 'change-password',
    component: ChangePassword,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-orders',
    name: 'myOrders',
    component: MyOrdersPlaceholderPage,
    meta: { requiresAuth: true }
  },
   {
    path: '/order/:orderId',
    name: 'orderDetails',
    component: OrderDetailPage,
    props: true,
    meta: { requiresAuth: true }
  },


  // --- Admin Routes (Sử dụng AdminLayout riêng) --- // <== ***** PHẦN THAY ĐỔI *****
  {
    path: '/admin',
    component: AdminLayout, // <== SỬ DỤNG ADMIN LAYOUT LÀM KHUNG
    meta: { requiredRole: 'ADMIN' }, // Áp dụng quyền ADMIN cho tất cả các trang con
    redirect: { name: 'admin-dashboard' }, // Tự động chuyển đến dashboard khi vào /admin
    children: [ // <== CÁC TRANG ADMIN CON NẰM TRONG NÀY
      {
        path: '', // Khớp với /admin (do có redirect ở trên)
        name: 'admin-dashboard',
        component: AdminDashboardPage, // Render vào <router-view> bên trong AdminLayout
      },
      {
        path: 'products', // Khớp với /admin/products
        name: 'admin-product-list',
        component: AdminProductListPage, // Render vào <router-view> bên trong AdminLayout
      },
      // --- Thêm các route admin khác vào đây trong tương lai ---
      // Ví dụ:
      // { path: 'orders', name: 'admin-orders', component: () => import('@/views/admin/AdminOrderListPage.vue') },
      // { path: 'users', name: 'admin-users', component: () => import('@/views/admin/AdminUserListPage.vue') },
    ]
  },


  // --- Auth Routes ---
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/set-initial-password',
    name: 'set-initial-password',
    component: SetPasswordPage,
    props: route => ({ token: route.query.token })
  },


  // --- Not Found Route (Luôn để cuối cùng) ---
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active', // Giữ nguyên
  linkExactActiveClass: 'exact-active', // Giữ nguyên
  scrollBehavior(to, from, savedPosition) { // Giữ nguyên
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// --- router.beforeEach (Giữ nguyên logic kiểm tra auth/role) ---
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
        // Logic lấy role giữ nguyên như cũ
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
  // *** Sửa lỗi nhỏ: Lấy requiredRole từ to.matched để áp dụng cho cả cha và con ***
  const requiredRole = to.matched.some(record => record.meta.requiredRole)
                       ? to.matched.find(record => record.meta.requiredRole)?.meta.requiredRole
                       : null;
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (isAuthenticated && requiresGuest) { return next({ name: 'home' }); }
  if (requiredRole) {
    if (isAuthenticated && userRole === requiredRole) { return next(); }
    else if (isAuthenticated) { console.warn(`User (${userRole}) không có quyền (${requiredRole}) truy cập ${to.path}.`); return next({ name: 'home' }); } // Hoặc trang không có quyền
    else { return next({ name: 'login', query: { redirect: to.fullPath } }); }
  }
  if (requiresAuth) {
    if (isAuthenticated) { return next(); }
    else { return next({ name: 'login', query: { redirect: to.fullPath } }); }
  }
  return next();
});

export default router;