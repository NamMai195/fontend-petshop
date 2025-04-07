export default [
  {
    title: 'Dashboard',
    icon: { icon: 'mdi-home' },
    to: { name: 'admin-dashboard' },
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'User Management',
    icon: { icon: 'mdi-account-group' },
    to: { name: 'admin-users' },
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'Product Management',
    icon: { icon: 'mdi-package-variant' },
    to: { name: 'admin-products' },
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'Category Management',
    icon: { icon: 'mdi-shape' },
    to: { name: 'admin-categories' },
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'Order Management',
    icon: { icon: 'mdi-cart' },
    to: { name: 'admin-orders' },
    action: 'read',
    subject: 'admin',
  },
  {
    title: 'Review Management',
    icon: { icon: 'mdi-star' },
    to: { name: 'admin-reviews' },
    action: 'read',
    subject: 'admin',
  },
] 