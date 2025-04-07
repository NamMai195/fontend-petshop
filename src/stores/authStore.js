// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios'; // Giữ lại nếu bạn dùng axios global ở đâu đó, nếu không thì không cần
import { jwtDecode } from 'jwt-decode';
import { useCartStore } from './cartStore';
import { useOrderStore } from './orderStore';
import apiClient from '@/services/apiClient'; // Sử dụng apiClient đã cấu hình

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('accessToken') || null,
        // Khởi tạo user là null
        user: null,
        // Thêm trạng thái 'success' để rõ ràng hơn
        status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
        error: null,
        profileLoading: false, // Loading state riêng cho việc fetch profile
        profileError: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        // Kiểm tra 'ADMIN' trong roles hoặc type (để tương thích)
        isAdmin: (state) => state.user?.roles?.includes('ADMIN') || state.user?.type === 'ADMIN',
        userInfo: (state) => state.user,
        // isLoggedIn: Kiểm tra token hợp lệ và chưa hết hạn
        isLoggedIn: (state) => {
            if (!state.token) return false;
            try {
                const decoded = jwtDecode(state.token);
                // Phải có exp và chưa hết hạn
                return decoded.exp && decoded.exp > Date.now() / 1000;
            } catch (e) {
                console.error("Lỗi giải mã token trong isLoggedIn:", e);
                return false; // Coi như không hợp lệ nếu không giải mã được
            }
        },
        // userRole: Lấy từ roles hoặc type
        userRole: (state) => {
            if (!state.user) return null;
            // Ưu tiên kiểm tra mảng roles trước
            if (state.user.roles?.includes('ADMIN')) return 'ADMIN';
            if (state.user.type === 'ADMIN') return 'ADMIN'; // Giữ lại để tương thích
            return 'USER';
        },
        // userDisplayIdentifier: Hiển thị định danh user
        userDisplayIdentifier: (state) => {
            // Nếu đang loading profile thì hiển thị đang tải
            if (!state.user && state.profileLoading) return 'Đang tải...';
            // Nếu không có user thì trả về null
            if (!state.user) return null;
            // Ưu tiên email -> username -> id
            return state.user.email || state.user.username || (state.user.id ? `User ${state.user.id}` : 'Người dùng');
        }
    },

    actions: {
        // === Internal Action: Xử lý token và cập nhật state ===
        _processTokenAndUpdateState(token) {
            try {
                // 1. Giải mã Token
                const decoded = jwtDecode(token);
                console.log("[AuthStore] Dữ liệu giải mã từ Token:", decoded);

                // 2. Lấy User ID (Quan trọng!) - Kiểm tra các trường có thể chứa ID
                // !!! Quan trọng: Đảm bảo tên trường (id, userId, sub) khớp với JWT token của bạn !!!
                const userId = decoded.id || decoded.userId || decoded.sub;
                if (!userId) {
                    // Nếu không tìm thấy ID, đây là lỗi nghiêm trọng
                    throw new Error("Token không chứa thông tin ID người dùng (kiểm tra các trường id, userId, sub).");
                }

                // 3. Cập nhật Token trong state và localStorage
                this.token = token;
                localStorage.setItem('accessToken', token);
                // Không cần set header global cho axios nữa, apiClient interceptor sẽ làm việc này

                // 4. Thiết lập State User *Tối thiểu* Ngay Lập Tức (Phải có ID!)
                // Chỉ cập nhật user object nếu user chưa tồn tại hoặc ID khác
                // Điều này giữ lại thông tin đã fetch nếu chỉ là refresh token
                if (!this.user || this.user.id !== userId) {
                     // Lấy các thông tin cơ bản có thể có từ token
                     const roles = decoded.roles || decoded.authorities || (decoded.type === 'ADMIN' ? ['ADMIN'] : ['USER']);
                     this.user = {
                        id: userId,
                        username: decoded.sub, // Thường là username
                        email: decoded.email || null, // Lấy từ token nếu có
                        type: decoded.type || (roles.includes('ADMIN') ? 'ADMIN' : 'USER'), // Suy ra từ roles nếu có
                        roles: roles,
                        // Khởi tạo các trường sẽ được fetch = null/rỗng
                        firstName: decoded.firstName || null, // Lấy từ token nếu có
                        lastName: decoded.lastName || null, // Lấy từ token nếu có
                        phone: null,
                        addresses: [] // Luôn bắt đầu với addresses rỗng
                    };
                    console.log("[AuthStore] Đã thiết lập user state tối thiểu từ token:", this.user);
                } else {
                    // Nếu user đã tồn tại và ID khớp, chỉ cần cập nhật token
                     console.log("[AuthStore] ID user khớp với state hiện tại, chỉ cập nhật token.");
                }

                // 5. Reset lỗi và đặt trạng thái thành công
                this.error = null;
                this.profileError = null; // Reset cả lỗi profile
                this.status = 'success';

                // --- 6. Tự động gọi Fetch Profile (Bất đồng bộ) ---
                // Gọi fetch profile để lấy thông tin đầy đủ (addresses, tên, sđt...)
                // Không cần await ở đây, để nó chạy ngầm
                console.log(`[AuthStore] Chuẩn bị gọi fetchUserProfile cho ID: ${userId}`);
                this.fetchUserProfile(userId); // Tự động fetch profile sau khi xử lý token thành công

                return true; // Báo hiệu xử lý token thành công

            } catch (error) {
                console.error('Lỗi xử lý token:', error);
                // Đặt thông báo lỗi cụ thể hơn
                this.error = `Token không hợp lệ hoặc lỗi xử lý: ${error.message}`;
                this.clearAuth(); // Xóa mọi thứ nếu token lỗi
                return false; // Báo hiệu xử lý token thất bại
            }
        },

        // Action này chỉ đơn giản gọi hàm xử lý nội bộ
        setToken(token) {
            return this._processTokenAndUpdateState(token);
        },

        // === Action clearAuth ===
        clearAuth() {
            console.log('[AuthStore] Đang xóa trạng thái xác thực.');
            this.token = null;
            this.user = null; // Xóa user object
            this.status = 'idle';
            this.error = null;
            this.profileLoading = false; // Reset cả trạng thái profile
            this.profileError = null;
            localStorage.removeItem('accessToken');
            // Interceptor của apiClient sẽ tự động xử lý việc thiếu token

            // Xóa cache của các store liên quan
            try {
                const cartStore = useCartStore();
                cartStore.clearCartLocally();
                const orderStore = useOrderStore();
                orderStore.clearMyOrders();
                console.log('[AuthStore] Đã xóa cache Cart và Order stores.');
            } catch (e) {
                console.error("[AuthStore] Lỗi khi xóa cache stores lúc clearAuth:", e);
            }
        },

        // === Action login ===
        async login(credentials) {
            this.status = 'loading';
            this.error = null;
            console.log('[AuthStore] Đang thực hiện đăng nhập...');

            try {
                const response = await apiClient.post('/auth/access-token', credentials);
                console.log('[AuthStore] Phản hồi API đăng nhập:', response.data);

                if (response.data.accessToken) {
                    // Gọi hàm xử lý token nội bộ
                    const success = this._processTokenAndUpdateState(response.data.accessToken);
                    if (success) {
                        console.log('[AuthStore] Đăng nhập thành công.');
                        return true;
                    } else {
                        // _processTokenAndUpdateState đã gọi clearAuth nếu lỗi
                        console.error('[AuthStore] Đăng nhập thất bại: Lỗi xử lý token.');
                        // Lỗi đã được set trong _processTokenAndUpdateState
                        return false;
                    }
                } else {
                    // Nếu API không trả về token dù thành công?
                    throw new Error('API đăng nhập không trả về accessToken.');
                }
            } catch (error) {
                console.error('[AuthStore] Lỗi API đăng nhập:', error);
                this.status = 'error';
                // Lấy lỗi cụ thể từ response nếu có
                this.error = error.response?.data?.message
                          || error.response?.data?.error
                          || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
                this.clearAuth(); // Xóa trạng thái nếu đăng nhập lỗi
                return false;
            }
        },

        // === Action logout ===
        async logout() {
            console.log('[AuthStore] Đang đăng xuất...');
            this.clearAuth(); // Chỉ cần gọi clearAuth
            // Component gọi logout sẽ xử lý chuyển hướng
        },

        // === Action checkAuth (Quan trọng khi khởi tạo app) ===
        async checkAuth() {
            console.log('[AuthStore] Đang kiểm tra trạng thái xác thực...');
            const token = this.token || localStorage.getItem('accessToken');

            if (!token) {
                console.log('[AuthStore] Không tìm thấy token.');
                // Đảm bảo state sạch nếu không có token
                this.clearAuth();
                return false;
            }

            console.log('[AuthStore] Tìm thấy token, đang xử lý...');
            // Sử dụng lại logic xử lý token (bao gồm cả trigger fetch profile)
            const isValid = this._processTokenAndUpdateState(token);
            if (!isValid) {
                 console.log('[AuthStore] checkAuth thất bại: Token không hợp lệ hoặc lỗi xử lý.');
                 // _processTokenAndUpdateState đã gọi clearAuth nếu lỗi
                 return false;
            }

            // Kiểm tra lại hạn token một cách tường minh (phòng trường hợp logic _processTokenAndUpdateState chưa đủ)
            try {
                const decoded = jwtDecode(token);
                if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
                    console.warn('[AuthStore] checkAuth: Token đã hết hạn.');
                    this.clearAuth();
                    return false;
                }
                 console.log('[AuthStore] checkAuth thành công: Token hợp lệ.');
                 return true;
            } catch (e) {
                 // Nếu vẫn lỗi giải mã ở đây (dù không nên)
                 console.error('[AuthStore] Lỗi giải mã token trong checkAuth:', e);
                 this.clearAuth();
                 return false;
            }
        },

        // === Action fetchUserProfile (Lấy chi tiết profile) ===
        async fetchUserProfile(userId) {
            // Ngăn gọi nếu thiếu ID hoặc đang loading
            if (!userId) {
                console.warn("[AuthStore] fetchUserProfile được gọi nhưng thiếu userId.");
                return; // Không fetch nếu không có ID
            }
            if (this.profileLoading) {
                 console.log(`[AuthStore] Đang fetch profile cho ID: ${userId}. Bỏ qua lần gọi này.`);
                 return;
            }
            // Có thể thêm tối ưu: Không fetch lại nếu đã có đủ thông tin (ví dụ có addresses)
            // if (this.user?.id === userId && this.user?.addresses?.length > 0 && !this.profileError) {
            //     console.log(`[AuthStore] Profile cho ID ${userId} có vẻ đã đầy đủ. Bỏ qua fetch.`);
            //     return;
            // }

            this.profileLoading = true;
            this.profileError = null;
            console.log(`[AuthStore] Đang fetch chi tiết profile cho user ID: ${userId}...`);

            try {
                // Gọi API bằng apiClient
                const response = await apiClient.get(`/api/v1/users/${userId}`);
                const profile = response.data;
                console.log(`[AuthStore] Dữ liệu profile nhận được cho ${userId}:`, profile);

                // --- Cập nhật state user, *kết hợp* thông tin từ token và API ---
                this.user = {
                    // Giữ lại những thông tin có thể chỉ có trong token (id, roles, type, username)
                    ...(this.user || {}), // Lấy state user hiện tại làm nền
                    id: profile.id || userId, // Đảm bảo ID đúng từ API hoặc fallback về userId đã truyền
                    // Ghi đè/Cập nhật thông tin từ API (thường là mới nhất)
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email, // Cập nhật email từ API
                    phone: profile.phone, // Thêm phone nếu API trả về
                    // Cập nhật roles/type một cách cẩn thận (tùy nguồn nào là chính xác nhất)
                    // Ví dụ: Ưu tiên roles/type từ API nếu có, nếu không giữ từ token
                    roles: profile.roles || this.user?.roles || ['USER'],
                    type: profile.type || this.user?.type || 'USER',
                    // Cập nhật addresses (Rất quan trọng!)
                    addresses: profile.addresses || []
                };
                console.log('[AuthStore] User state đã được cập nhật với profile chi tiết:', this.user);

            } catch (err) {
                console.error(`[AuthStore] Lỗi khi fetch profile cho user ${userId}:`, err);
                this.profileError = `Lỗi tải thông tin người dùng: ${err.response?.data?.message || err.message}`;
                // Không xóa user hoàn toàn khi lỗi fetch, giữ lại thông tin từ token nếu có
                // Chỉ xóa nếu user chưa bao giờ được thiết lập ID
                if (!this.user?.id) { this.user = null; }
            } finally {
                this.profileLoading = false; // Luôn đặt lại loading = false
            }
        },

        // === Action handleGoogleAuth ===
        async handleGoogleAuth(googleToken) {
            this.status = 'loading';
            this.error = null;
            console.log('[AuthStore] Đang xác thực Google Auth...');
            try {
                const response = await apiClient.post('/auth/google', { token: googleToken });
                console.log('[AuthStore] Phản hồi API Google Auth:', response.data);
                if (response.data.accessToken) {
                    // Sử dụng hàm xử lý token nội bộ
                    const success = this._processTokenAndUpdateState(response.data.accessToken);
                     if (success) {
                        console.log('[AuthStore] Google Auth thành công.');
                        return true;
                    } else {
                         console.error('[AuthStore] Google Auth thất bại: Lỗi xử lý token.');
                        return false;
                    }
                } else {
                     throw new Error('API Google Auth không trả về accessToken.');
                }
            } catch (error) {
                console.error('[AuthStore] Lỗi API Google Auth:', error);
                this.status = 'error';
                this.error = error.response?.data?.message || 'Đăng nhập bằng Google thất bại';
                 this.clearAuth(); // Xóa trạng thái nếu lỗi
                return false;
            }
        },

        // Bỏ action _setInitialUserFromToken vì logic đã được tích hợp vào _processTokenAndUpdateState
    }
});

/*
 * ========================================================================
 * !!! QUAN TRỌNG: Cần gọi checkAuth() khi ứng dụng khởi tạo !!!
 * ========================================================================
 *
 * Trong file khởi tạo chính của ứng dụng Vue (thường là main.js hoặc App.vue):
 *
 * // 1. Import store
 * import { useAuthStore } from '@/stores/authStore';
 * import { createPinia } from 'pinia'; // Đảm bảo pinia đã được tạo
 *
 * // 2. Sau khi tạo app và pinia instance
 * const app = createApp(App);
 * const pinia = createPinia();
 * app.use(pinia);
 *
 * // 3. Lấy authStore instance *sau khi* pinia đã được use
 * const authStore = useAuthStore();
 *
 * // 4. Gọi checkAuth() để xử lý token từ localStorage (nếu có)
 * // Không cần await, để nó chạy ngầm kiểm tra và cập nhật state
 * authStore.checkAuth();
 *
 * // 5. Mount ứng dụng
 * app.mount('#app');
 *
 */