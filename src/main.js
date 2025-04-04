import { createApp } from 'vue';
// *** 1. THÊM IMPORT createPinia ***
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
// Import CSS của Toast
import 'vue-toastification/dist/index.css';

const app = createApp(App);

// *** 2. TẠO INSTANCE PINIA ***
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Cấu hình Toast (tùy chọn)
const options = {
  position: "top-right",
  timeout: 3000, // 3 giây
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
};
app.use(Toast, options);

app.mount('#app');