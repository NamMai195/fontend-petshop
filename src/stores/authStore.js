// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useCartStore } from './cartStore'; 
import { useOrderStore } from './orderStore'; 
import apiClient from '@/services/apiClient'; 


export const useAuthStore = defineStore('auth', () => {
    // --- State ---
    const accessToken = ref(localStorage.getItem('accessToken') || null);
    const refreshToken = ref(localStorage.getItem('refreshToken') || null);
    const user = ref({
        id: null, email: null, firstName: null, lastName: null, roles: [],
        addresses: []
    });
    const status = ref('idle');
    const error = ref(null);
    const profileLoading = ref(false);
    const profileError = ref(null);

    // --- Getters ---
    const isLoggedIn = computed(() => {
        if (!accessToken.value) return false;
        try {
            const decoded = jwtDecode(accessToken.value);
            return decoded.exp > Date.now() / 1000;
        } catch (e) { return false; }
    });

    const userRole = computed(() => {
        if (!user.value || !user.value.roles) return null;
        if (user.value.roles.includes('ADMIN')) return 'ADMIN';
        if (user.value.roles.includes('USER')) return 'USER';
        return null;
    });

    const isAdmin = computed(() => userRole.value === 'ADMIN');

    // Getter hiển thị tên (ưu tiên first + last name)
    const userDisplayIdentifier = computed(() => {
        if (!user.value) return isLoggedIn.value ? 'Đang tải...' : null;
        const fullName = `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();
        return fullName || user.value.email || (user.value.id ? `User ${user.value.id}` : 'Người dùng');
    });

    // --- Actions ---

    // Action fetch profile chi tiết
    async function fetchUserProfile(userId) {
        if (!userId) { user.value = null; return; }
        if (profileLoading.value) return;

        profileLoading.value = true;
        profileError.value = null;
        console.log(`[AuthStore] Fetching profile for user ID: ${userId}`);
        try {
            const response = await apiClient.get(`/api/v1/users/${userId}`);
            const profile = response.data;
            // Cập nhật state user, bao gồm cả addresses
            user.value = {
                ...(user.value || {}), // Giữ id/roles từ token nếu có
                id: profile.id || userId,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                roles: profile.roles || user.value?.roles || ['USER'],
                addresses: profile.addresses || [] // Quan trọng: Lưu addresses
            };
            console.log('[AuthStore] User profile fetched:', user.value);
        } catch (err) {
            console.error(`[AuthStore] Failed fetch profile user ${userId}:`, err);
            profileError.value = "Lỗi tải thông tin người dùng.";
            if (!user.value?.id) { user.value = null; } // Reset nếu chưa có thông tin gì
        } finally {
            profileLoading.value = false;
        }
    }

    // Action set user ban đầu từ token (chỉ lấy id, roles, email)
    function _setInitialUserFromToken(token) {
         if (!token) { user.value = null; return null; }
         try {
             const decoded = jwtDecode(token);
             let roles = [];
             if (decoded.authorities && Array.isArray(decoded.authorities)) { roles = decoded.authorities; }
             else if (decoded.roles && Array.isArray(decoded.roles)) { roles = decoded.roles; }
             if (roles.includes('ROLE_ADMIN')) roles = ['ADMIN']; else roles = ['USER'];

             const userId = decoded.userId || decoded.sub;
             if (!userId) throw new Error("Token missing userId/sub.");

             // Khởi tạo user state với addresses rỗng
             user.value = {
                 id: userId, roles: roles, firstName: null, lastName: null,
                 email: decoded.email || null, addresses: []
             };
             console.log('[AuthStore] Initial user set:', user.value);
             return userId;
         } catch (e) { console.error('[AuthStore] Decode/SetInitialUser Error:', e); user.value = null; return null; }
    }

   // Action Login
   async function login(credentials) {
        status.value = 'loading'; error.value = null;
        try {
            const response = await apiClient.post('/auth/access-token', credentials);
            const newAccessToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;
            if (!newAccessToken || !newRefreshToken) throw new Error("Invalid token response.");

            accessToken.value = newAccessToken; refreshToken.value = newRefreshToken;
            localStorage.setItem('accessToken', newAccessToken); localStorage.setItem('refreshToken', newRefreshToken);

            // 1. Set ID/Roles từ token
            const userId = _setInitialUserFromToken(newAccessToken);
            status.value = 'success'; console.log('[AuthStore] Login successful.');

            // 2. Fetch Profile chi tiết (bao gồm địa chỉ)
            if (userId) { await fetchUserProfile(userId); }
            else { console.warn("[AuthStore] Cannot fetch profile, userId missing after login."); }

            // 3. Fetch giỏ hàng
            try { const cartStore = useCartStore(); await cartStore.fetchCart(); }
            catch (cartError) { console.error("[AuthStore] Error fetching cart after login:", cartError); }

            return true;
        } catch (err) {
            // ... xử lý lỗi login ...
            console.error("[AuthStore] Login failed:", err);
             if (err.response) { error.value = err.response.data?.message || `Lỗi ${err.response.status}`; }
             else if (err.request) { error.value = "Không kết nối được máy chủ."; }
             else { error.value = "Lỗi không xác định."; }
             accessToken.value = null; refreshToken.value = null; user.value = null;
             localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
             status.value = 'error'; return false;
        }
   }

   // Action Logout
   function logout() {
    console.log('[AuthStore] Logging out...');
    accessToken.value = null; refreshToken.value = null; user.value = null;
    status.value = 'idle'; error.value = null; profileError.value=null; profileLoading.value=false;
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
     try {
         // Xóa cart state
         const cartStore = useCartStore();
         cartStore.clearCartLocally();
         // Xóa order state
         const orderStore = useOrderStore(); // Lấy order store
         orderStore.clearMyOrders(); // Gọi action xóa order state
     } catch (e) {
         console.error("[AuthStore] Error clearing stores during logout:", e);
     }
     // Không cần chuyển hướng ở đây, component gọi logout sẽ làm
}

   // Action Kiểm tra trạng thái khi tải trang
   async function checkAuthStatus() {
     console.log('[AuthStore] Checking auth status...');
     const token = localStorage.getItem('accessToken');
     if (!token) { user.value=null; return; }
     try {
         const decoded = jwtDecode(token); const now = Date.now() / 1000;
         if (decoded.exp > now) {
             console.log('[AuthStore] Token is valid.');
             accessToken.value = token; refreshToken.value = localStorage.getItem('refreshToken');
             // 1. Set ID/Roles từ token
             const userId = _setInitialUserFromToken(token);
             status.value = 'success'; // Đánh dấu là đã xác thực (ít nhất là token hợp lệ)

             // 2. Fetch Profile chi tiết
             if (userId) { await fetchUserProfile(userId); }
             else { console.warn("[AuthStore] Cannot fetch profile, userId missing in existing token."); }

             // 3. Fetch giỏ hàng
             try { const cartStore = useCartStore(); await cartStore.fetchCart(); }
             catch(e) { console.error("[AuthStore] Error fetching cart during auth check:", e); }

         } else { console.log('[AuthStore] Token expired.'); logout(); }
     } catch (e) { console.error('[AuthStore] Invalid token found during check:', e); logout(); }
   }

    // Export state, getters, actions
    return {
        accessToken, refreshToken, user, status, error, profileLoading, profileError, // State
        isLoggedIn, isAdmin, userRole, userDisplayIdentifier, // Getters
        login, logout, checkAuthStatus, fetchUserProfile // Actions
    };
});