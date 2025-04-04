<template>
  <div class="container py-4 py-lg-5">
    <h1 class="mb-4">Thông Tin Tài Khoản</h1>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Đang tải dữ liệu tài khoản...</p>
    </div>

    <div v-else-if="fetchError" class="alert alert-danger" role="alert">
      <span v-html="fetchError"></span>
      <p class="small mt-2">Gợi ý: Vui lòng kiểm tra kết nối mạng và đảm bảo bạn đã đăng nhập. Nếu lỗi tiếp diễn, hãy thử tải lại trang hoặc liên hệ hỗ trợ.</p>
    </div>

    <div v-else-if="user" class="row g-4">
      <div class="col-lg-8"> <div class="card shadow-sm mb-4">
          <div class="card-header bg-light py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Thông tin cá nhân</h5>
             <button v-if="!isEditing" @click="startEditing" class="btn btn-sm btn-outline-primary">
                <iconify-icon icon="mdi:edit-outline" class="me-1"></iconify-icon>
                Chỉnh sửa
              </button>
          </div>
          <div class="card-body p-4">
            <div v-if="!isEditing">
              <dl class="row mb-0">
                <dt class="col-sm-4">Họ và tên:</dt>
                <dd class="col-sm-8">{{ user.lastName }} {{ user.firstName }}</dd>
                <dt class="col-sm-4">Tên đăng nhập:</dt>
                <dd class="col-sm-8">{{ user.username }}</dd>
                <dt class="col-sm-4">Email:</dt>
                <dd class="col-sm-8">{{ user.email }}</dd>
                <dt class="col-sm-4">Số điện thoại:</dt>
                <dd class="col-sm-8">{{ user.phone || 'Chưa cập nhật' }}</dd>
                <dt class="col-sm-4">Giới tính:</dt>
                <dd class="col-sm-8">{{ formatGender(user.gender) || 'Chưa cập nhật' }}</dd>
                <dt class="col-sm-4">Ngày sinh:</dt>
                <dd class="col-sm-8">{{ formatDate(user.birthday) || 'Chưa cập nhật' }}</dd>
                <dt class="col-sm-4">Trạng thái:</dt>
                <dd class="col-sm-8"><span :class="statusBadgeClass(user.status)">{{ formatStatus(user.status) }}</span></dd>
              </dl>
            </div>
            <form v-else @submit.prevent="saveUserProfile">
               <div v-if="editError" class="alert alert-danger small p-2 mb-3" v-html="editError"></div>
              <div class="row g-3">
                <div class="col-md-6 mb-2"><label for="editLastName" class="form-label">Họ</label><input type="text" class="form-control form-control-sm" id="editLastName" v-model="editFormData.lastName" required :disabled="editLoading"></div>
                <div class="col-md-6 mb-2"><label for="editFirstName" class="form-label">Tên</label><input type="text" class="form-control form-control-sm" id="editFirstName" v-model="editFormData.firstName" required :disabled="editLoading"></div>
                <div class="col-md-6 mb-2"><label for="editUsername" class="form-label">Tên đăng nhập</label><input type="text" class="form-control form-control-sm" id="editUsername" :value="editFormData.username" :disabled="true"></div>
                <div class="col-md-6 mb-2"><label for="editEmail" class="form-label">Email</label><input type="email" class="form-control form-control-sm" id="editEmail" :value="editFormData.email" :disabled="true"></div>
                <div class="col-md-6 mb-2"><label for="editPhone" class="form-label">Số điện thoại</label><input type="tel" class="form-control form-control-sm" id="editPhone" v-model="editFormData.phone" :disabled="editLoading"></div>
                <div class="col-md-6 mb-2"><label for="editGender" class="form-label">Giới tính</label><select class="form-select form-select-sm" id="editGender" v-model="editFormData.gender" :disabled="editLoading"><option :value="null">-- Chọn --</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></div>
                <div class="col-12 mb-2"><label for="editBirthday" class="form-label">Ngày sinh</label><input type="date" class="form-control form-control-sm" id="editBirthday" :value="formatDateForInput(editFormData.birthday)" @input="handleDateInput($event)" :disabled="editLoading"></div>
              </div>
              </form>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-header bg-light py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Sổ địa chỉ</h5>
            <button v-if="isEditing" @click="openAddressModal()" class="btn btn-sm btn-success" :disabled="editLoading">
              <iconify-icon icon="mdi:plus-circle-outline" class="me-1"></iconify-icon>
              Thêm địa chỉ
            </button>
          </div>
          <div class="card-body p-4">
             <div v-if="!isEditing">
              <div v-if="!user.addresses || user.addresses.length === 0" class="text-muted">Chưa có địa chỉ nào được lưu.</div>
              <ul v-else class="list-group list-group-flush">
                <li v-for="(address, index) in user.addresses" :key="address.id || index" class="list-group-item px-0 d-flex justify-content-between align-items-start">
                  <div>
                    <p class="mb-1 fw-semibold">
                      {{ formatAddress(address) }}
                      <span v-if="index === 0" class="badge bg-primary ms-2">Mặc định</span>
                    </p>
                     <small class="text-muted">
                       {{ [address.streetNumber, address.street, address.ward, address.district, address.city, address.country].filter(Boolean).join(', ') }}
                    </small>
                  </div>
                </li>
              </ul>
            </div>
            <div v-else>
               <div v-if="!editFormData.addresses || editFormData.addresses.length === 0" class="text-muted mb-3">Chưa có địa chỉ nào. Nhấn "Thêm địa chỉ" để bắt đầu.</div>
               <ul v-else class="list-group list-group-flush mb-3">
                  <li v-for="(address, index) in editFormData.addresses" :key="index" class="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <p class="mb-1">
                        {{ formatAddress(address) }}
                        <span v-if="index === 0" class="badge bg-primary ms-2">Mặc định</span>
                      </p>
                       <small class="text-muted">
                        {{ [address.streetNumber, address.street, address.ward, address.district, address.city, address.country].filter(Boolean).join(', ') }}
                      </small>
                    </div>
                    <div>
                      <button v-if="index !== 0" @click.prevent="setDefaultAddress(index)" type="button" class="btn btn-sm btn-outline-success me-1" title="Đặt làm mặc định" :disabled="editLoading"><iconify-icon icon="mdi:check-circle-outline"></iconify-icon></button>
                      <button @click.prevent="openAddressModal(address, index)" type="button" class="btn btn-sm btn-outline-secondary me-1" title="Sửa" :disabled="editLoading"><iconify-icon icon="mdi:edit-outline"></iconify-icon></button>
                      <button @click.prevent="removeAddress(index)" type="button" class="btn btn-sm btn-outline-danger" title="Xóa" :disabled="editLoading"><iconify-icon icon="mdi:delete-outline"></iconify-icon></button>
                    </div>
                  </li>
                </ul>
                <div class="mt-4 border-top pt-3">
                  <button type="button" @click="saveUserProfile" class="btn btn-primary me-2" :disabled="editLoading">
                    <span v-if="editLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Lưu thay đổi
                  </button>
                  <button type="button" class="btn btn-secondary" @click="cancelEditing" :disabled="editLoading">Hủy</button>
                </div>
            </div>
          </div>
        </div>

         <div v-if="!isEditing" class="mt-4">
            <button @click="goToChangePassword" class="btn btn-outline-danger">
                <iconify-icon icon="mdi:lock-reset" class="me-1"></iconify-icon>
                Đổi mật khẩu
            </button>
         </div>
         </div>
      </div>

    <div class="modal fade" id="addressModal" tabindex="-1" aria-labelledby="addressModalLabel" aria-hidden="true" ref="addressModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addressModalLabel">{{ modalMode === 'add' ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSaveAddress">
              <div v-if="addressModalError" class="alert alert-danger small p-2 mb-3">{{ addressModalError }}</div>
              <div class="row g-3">
                <div class="col-md-6"><label for="modalStreetNumber" class="form-label">Số nhà</label><input type="text" class="form-control" id="modalStreetNumber" v-model="currentAddress.streetNumber"></div>
                <div class="col-md-6"><label for="modalStreet" class="form-label">Tên đường</label><input type="text" class="form-control" id="modalStreet" v-model="currentAddress.street" required></div>
                <div class="col-md-6"><label for="modalApartmentNumber" class="form-label">Số căn hộ</label><input type="text" class="form-control" id="modalApartmentNumber" v-model="currentAddress.apartmentNumber"></div>
                <div class="col-md-6"><label for="modalFloor" class="form-label">Lầu/Tầng</label><input type="text" class="form-control" id="modalFloor" v-model="currentAddress.floor"></div>
                <div class="col-md-6"><label for="modalBuilding" class="form-label">Tòa nhà/Block</label><input type="text" class="form-control" id="modalBuilding" v-model="currentAddress.building"></div>

                <div class="col-md-6">
                  <label for="modalProvince" class="form-label">Tỉnh/Thành phố <span v-if="provincesLoading" class="spinner-border spinner-border-sm text-secondary ms-1" role="status" aria-hidden="true"></span></label>
                  <select class="form-select" id="modalProvince" v-model="selectedProvinceCode" required :disabled="provincesLoading">
                    <option :value="null" disabled>-- Chọn Tỉnh/Thành phố --</option>
                    <option v-for="province in provincesList" :key="province.code" :value="province.code">
                      {{ province.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                   <label for="modalDistrict" class="form-label">Quận/Huyện <span v-if="districtsLoading" class="spinner-border spinner-border-sm text-secondary ms-1" role="status" aria-hidden="true"></span></label>
                   <select class="form-select" id="modalDistrict" v-model="selectedDistrictCode" required :disabled="!selectedProvinceCode || districtsLoading || provincesLoading">
                     <option :value="null" disabled>-- Chọn Quận/Huyện --</option>
                     <option v-for="district in districtsList" :key="district.code" :value="district.code">
                       {{ district.name }}
                     </option>
                   </select>
                </div>

                <div class="col-md-6">
                   <label for="modalWard" class="form-label">Phường/Xã <span v-if="wardsLoading" class="spinner-border spinner-border-sm text-secondary ms-1" role="status" aria-hidden="true"></span></label>
                   <select class="form-select" id="modalWard" v-model="selectedWardCode" required :disabled="!selectedDistrictCode || wardsLoading || districtsLoading || provincesLoading">
                     <option :value="null" disabled>-- Chọn Phường/Xã --</option>
                     <option v-for="ward in wardsList" :key="ward.code" :value="ward.code">
                       {{ ward.name }}
                     </option>
                   </select>
                 </div>

                <div class="col-md-6"><label for="modalCountry" class="form-label">Quốc gia</label><input type="text" class="form-control" id="modalCountry" v-model="currentAddress.country" required></div>
                <div class="col-md-6"><label for="modalAddressType" class="form-label">Loại địa chỉ</label><select class="form-select" id="modalAddressType" v-model="currentAddress.addressType"><option :value="null">-- Chọn loại --</option><option value="0">Nhà riêng</option><option value="1">Cơ quan</option></select></div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="handleSaveAddress" :disabled="provincesLoading || districtsLoading || wardsLoading">Lưu địa chỉ</button>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router'; // Import useRouter

const user = ref(null);
const loading = ref(true);
const fetchError = ref(null);

const isEditing = ref(false);
const editFormData = ref({ addresses: [] });
const editLoading = ref(false);
const editError = ref(null);

// --- Removed password related refs/reactive objects ---
// const passwordData = reactive({ password: '', confirmPassword: '' });
// const passwordLoading = ref(false);
// const passwordError = ref(null);
// const passwordSuccess = ref(null);
// ---

const toast = useToast();
const router = useRouter(); // Get router instance

const addressModalRef = ref(null);
let addressModalInstance = null;
const modalMode = ref('add');
const currentAddress = ref({});
const currentAddressIndex = ref(null);
const addressModalError = ref(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
let currentUserId = null;

const PROVINCE_API_HOST = "https://provinces.open-api.vn/api/";
const provincesList = ref([]);
const districtsList = ref([]);
const wardsList = ref([]);
const provincesLoading = ref(false);
const districtsLoading = ref(false);
const wardsLoading = ref(false);
const selectedProvinceCode = ref(null);
const selectedDistrictCode = ref(null);
const selectedWardCode = ref(null);

// --- getAuthApiClient function remains the same ---
const getAuthApiClient = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    fetchError.value = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      fetchError.value = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
       // Optionally redirect to login
      // router.push('/login');
      return null;
    }
     // Store userId globally within this component instance
     currentUserId = decoded.userId || decoded.sub;
      if (!currentUserId) {
           fetchError.value = "Thông tin định danh người dùng không hợp lệ trong phiên đăng nhập.";
            return null;
      }
  } catch (e) {
     fetchError.value = "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
      // Optionally redirect to login
     // router.push('/login');
     return null;
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// --- fetchUserData function remains the same ---
const fetchUserData = async (userId) => {
   if (!userId) {
        fetchError.value = "Không thể tải dữ liệu do thiếu thông tin người dùng.";
        loading.value = false;
        return;
   }

  loading.value = true;
  fetchError.value = null;
  const apiClient = getAuthApiClient();
  if (!apiClient) {
    loading.value = false;
    // Error message already set in getAuthApiClient
    return;
  }

  try {
    const response = await apiClient.get(`/api/v1/users/${userId}`);
    user.value = response.data;
    // Ensure addresses is always an array
    user.value.addresses = Array.isArray(user.value.addresses) ? user.value.addresses : [];
  } catch (err) {
    if (err.response) {
       if (err.response.status === 401 || err.response.status === 403) {
          fetchError.value = "Phiên đăng nhập không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.";
           // Optionally redirect to login
          // router.push('/login');
       } else {
          fetchError.value = `Lỗi ${err.response.status}: Không thể tải dữ liệu. (${err.response.data?.message || 'Lỗi máy chủ'})`;
       }
    } else if (err.request) {
        fetchError.value = "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.";
    }
     else {
      fetchError.value = "Lỗi không xác định khi tải dữ liệu.";
      console.error("Fetch User Error:", err);
    }
    user.value = null;
  } finally {
    loading.value = false;
  }
};

// --- startEditing function remains the same ---
const startEditing = () => {
  if (!user.value) return;
  // Deep clone user data for editing
  editFormData.value = JSON.parse(JSON.stringify(user.value));
  // Ensure addresses is an array in the edit form data
  if (!Array.isArray(editFormData.value.addresses)) {
      editFormData.value.addresses = [];
  }
  isEditing.value = true;
  editError.value = null; // Clear previous edit errors
};

// --- cancelEditing function remains the same ---
const cancelEditing = () => {
  isEditing.value = false;
  editError.value = null;
  // No need to reset editFormData, it will be overwritten on next edit start
};

// --- saveUserProfile function remains the same ---
const saveUserProfile = async () => {
  if (!currentUserId || !editFormData.value) {
      editError.value = "Dữ liệu không hợp lệ để lưu.";
      return;
  }

  editLoading.value = true;
  editError.value = null;
  const apiClient = getAuthApiClient();
   if (!apiClient) {
      editLoading.value = false;
      // Error already set, potentially redirecting
      editError.value = "Lỗi xác thực. Không thể lưu."; // Fallback message
      return;
   }

  // Prepare data, excluding fields that shouldn't be updated (like username, email, status)
  const updateData = {
    id: currentUserId, // Ensure ID is sent if required by backend
    firstName: editFormData.value.firstName,
    lastName: editFormData.value.lastName,
    gender: editFormData.value.gender,
    birthday: editFormData.value.birthday, // Make sure this is ISO string or null
    phone: editFormData.value.phone,
    addresses: editFormData.value.addresses.map(addr => ({
        // Map address fields, ensure correct types and handle nulls
        apartmentNumber: addr.apartmentNumber || null,
        floor: addr.floor || null,
        building: addr.building || null,
        streetNumber: addr.streetNumber || null,
        street: addr.street, // Required
        ward: addr.ward || null,
        district: addr.district || null,
        city: addr.city || null,
        country: addr.country, // Required
        // Ensure addressType is number or null
        addressType: addr.addressType !== null && addr.addressType !== undefined ? parseInt(addr.addressType, 10) : null,
        provinceCode: addr.provinceCode || null,
        districtCode: addr.districtCode || null,
        wardCode: addr.wardCode || null,
        // Include id if needed for backend update/delete mapping
        // id: addr.id || null
    }))
  };

  try {
    // Use PUT for update
    const response = await apiClient.put(`/api/v1/users/${currentUserId}`, updateData);
    user.value = response.data; // Update local user data with response
    // Ensure addresses is always an array
    user.value.addresses = Array.isArray(user.value.addresses) ? user.value.addresses : [];
    isEditing.value = false; // Exit editing mode
    toast.success("Cập nhật thông tin thành công!");
  } catch (err) {
    if (err.response) {
       editError.value = `Lỗi ${err.response.status}: ${err.response.data?.message || 'Không thể lưu thay đổi.'}`;
       // Optionally display validation errors
       if(err.response.data?.errors) {
           const errorDetails = Object.entries(err.response.data.errors)
               .map(([field, message]) => `<li>${field}: ${message}</li>`)
               .join('');
           editError.value += `<br/>Chi tiết lỗi: <ul>${errorDetails}</ul>`;
       }
     } else if (err.request) {
         editError.value = "Không nhận được phản hồi khi lưu. Kiểm tra kết nối mạng.";
     }
     else {
       editError.value = "Lỗi không xác định khi lưu.";
       console.error("Save Profile Error:", err);
     }
  } finally {
    editLoading.value = false;
  }
};

// --- Removed changePassword function ---

// --- Address Modal Functions (addNewAddress, updateAddress, removeAddress, setDefaultAddress) remain the same ---
const addNewAddress = (newAddress) => {
    // Ensure the addresses array exists
    if (!Array.isArray(editFormData.value.addresses)) {
        editFormData.value.addresses = [];
    }
    editFormData.value.addresses.push(newAddress);
};

const updateAddress = (index, updatedAddress) => {
    if (editFormData.value.addresses?.[index]) {
        // Replace the item at the index
        editFormData.value.addresses[index] = updatedAddress;
        // Or use splice for reactivity if needed, though direct assignment often works
        // editFormData.value.addresses.splice(index, 1, updatedAddress);
    } else {
        console.error("ADDR: Attempted to update non-existent address at index", index);
        toast.error("Lỗi: Không tìm thấy địa chỉ để cập nhật.");
    }
};

const removeAddress = (index) => {
    if (editFormData.value.addresses) {
        editFormData.value.addresses.splice(index, 1);
        toast.info("Đã xóa địa chỉ. Lưu thay đổi để cập nhật.");
    }
};

const setDefaultAddress = (index) => {
    // Check if addresses exist and index is valid and not already the default (index 0)
    if (editFormData.value.addresses && index > 0 && index < editFormData.value.addresses.length) {
        // Remove the item from its current position
        const [itemToMove] = editFormData.value.addresses.splice(index, 1);
        // Add it to the beginning of the array
        editFormData.value.addresses.unshift(itemToMove);
        toast.info("Đã đặt làm mặc định. Lưu thay đổi để cập nhật.");
    }
};


// --- Province/District/Ward Fetching & Watching logic remains the same ---
const fetchProvinces = async () => {
  // Avoid refetching if list is already populated
  if (provincesList.value.length > 0 && !provincesLoading.value) return;
  provincesLoading.value = true;
  addressModalError.value = null; // Clear previous modal errors
  try {
    const response = await axios.get(PROVINCE_API_HOST + "?depth=1");
    provincesList.value = response.data || [];
  } catch (error) {
    console.error("Fetch Provinces Error:", error);
    addressModalError.value = "Lỗi tải danh sách Tỉnh/Thành phố. Vui lòng thử lại.";
    provincesList.value = []; // Reset on error
  } finally {
    provincesLoading.value = false;
  }
};

const fetchDistricts = async (provinceCode) => {
  // If no province code, reset districts and wards
  if (!provinceCode) {
    districtsList.value = [];
    wardsList.value = [];
    selectedDistrictCode.value = null; // Reset selection
    selectedWardCode.value = null;
    return;
  }
  districtsLoading.value = true;
  wardsList.value = []; // Reset wards when province changes
  selectedDistrictCode.value = null; // Reset district selection
  selectedWardCode.value = null;   // Reset ward selection
  addressModalError.value = null; // Clear previous modal errors
  try {
    const response = await axios.get(`${PROVINCE_API_HOST}p/${provinceCode}?depth=2`);
    districtsList.value = response.data?.districts || [];
  } catch (error) {
    console.error("Fetch Districts Error:", error);
    addressModalError.value = "Lỗi tải danh sách Quận/Huyện. Vui lòng thử lại.";
    districtsList.value = []; // Reset on error
  } finally {
    districtsLoading.value = false;
  }
};

const fetchWards = async (districtCode) => {
  // If no district code, reset wards
  if (!districtCode) {
    wardsList.value = [];
    selectedWardCode.value = null; // Reset selection
    return;
  }
  wardsLoading.value = true;
  selectedWardCode.value = null;   // Reset ward selection when district changes
  addressModalError.value = null; // Clear previous modal errors
  try {
    const response = await axios.get(`${PROVINCE_API_HOST}d/${districtCode}?depth=2`);
    wardsList.value = response.data?.wards || [];
  } catch (error) {
    console.error("Fetch Wards Error:", error);
    addressModalError.value = "Lỗi tải danh sách Phường/Xã. Vui lòng thử lại.";
    wardsList.value = []; // Reset on error
  } finally {
    wardsLoading.value = false;
  }
};

// Watchers for cascading dropdowns
watch(selectedProvinceCode, (newProvinceCode) => {
  fetchDistricts(newProvinceCode);
});

watch(selectedDistrictCode, (newDistrictCode) => {
  fetchWards(newDistrictCode);
});

// --- openAddressModal, closeAddressModal, handleSaveAddress logic remains the same ---
const openAddressModal = async (address = null, index = null) => {
  addressModalError.value = null;
  // Reset dependent dropdowns and selections
  districtsList.value = [];
  wardsList.value = [];
  selectedProvinceCode.value = null;
  selectedDistrictCode.value = null;
  selectedWardCode.value = null;

  // Always fetch provinces (or ensure they are fetched)
  await fetchProvinces(); // Make sure provinces are loaded before proceeding

  if (address && index !== null) {
    // --- Edit Mode ---
    modalMode.value = 'edit';
    // Deep clone the address to avoid modifying the original object directly
    currentAddress.value = JSON.parse(JSON.stringify(address));
    currentAddressIndex.value = index;

    // Pre-select province, district, ward if codes are available
    if (currentAddress.value.provinceCode && provincesList.value.some(p => p.code === currentAddress.value.provinceCode)) {
      selectedProvinceCode.value = currentAddress.value.provinceCode;
      // Wait for districts to load based on the selected province
      await fetchDistricts(selectedProvinceCode.value);
       if (currentAddress.value.districtCode && districtsList.value.some(d => d.code === currentAddress.value.districtCode)) {
         selectedDistrictCode.value = currentAddress.value.districtCode;
         // Wait for wards to load based on the selected district
         await fetchWards(selectedDistrictCode.value);
          if (currentAddress.value.wardCode && wardsList.value.some(w => w.code === currentAddress.value.wardCode)) {
             selectedWardCode.value = currentAddress.value.wardCode;
          } else {
             // Ward code missing or invalid, keep selection null
             selectedWardCode.value = null;
          }
       } else {
          // District code missing or invalid, keep selections null
          selectedDistrictCode.value = null;
          selectedWardCode.value = null;
       }
    } else {
        // Province code missing or invalid, keep selections null
         console.warn("ADDR EDIT: Could not pre-fill province/district/ward based on codes. Address data:", currentAddress.value);
         selectedProvinceCode.value = null;
         selectedDistrictCode.value = null;
         selectedWardCode.value = null;
    }

  } else {
    // --- Add Mode ---
    modalMode.value = 'add';
    currentAddress.value = { country: 'Việt Nam', addressType: null }; // Default values
    currentAddressIndex.value = null;
    // Reset selections explicitly for add mode
    selectedProvinceCode.value = null;
    selectedDistrictCode.value = null;
    selectedWardCode.value = null;
  }

  // Show the modal
  if (addressModalInstance) {
    addressModalInstance.show();
  } else {
     console.error("Cannot open modal, instance not available.");
     toast.error("Không thể mở cửa sổ địa chỉ. Vui lòng tải lại trang.");
  }
};

const closeAddressModal = () => {
     if (addressModalInstance) {
        addressModalInstance.hide();
        // Resetting state is now handled by the 'hidden.bs.modal' event listener
     }
};

const handleSaveAddress = () => {
    // Basic validation
    if (!currentAddress.value.street || !selectedProvinceCode.value || !selectedDistrictCode.value || !selectedWardCode.value || !currentAddress.value.country) {
        addressModalError.value = "Vui lòng điền các trường bắt buộc (Tên đường, Tỉnh/Thành, Quận/Huyện, Phường/Xã, Quốc gia).";
        return;
    }
    addressModalError.value = null; // Clear error if validation passes

    // Find selected names
    const selectedProvince = provincesList.value.find(p => p.code === selectedProvinceCode.value);
    const selectedDistrict = districtsList.value.find(d => d.code === selectedDistrictCode.value);
    const selectedWard = wardsList.value.find(w => w.code === selectedWardCode.value);

    // Double-check if names were found (should always be true if codes are selected)
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
        addressModalError.value = "Thông tin Tỉnh/Quận/Phường không hợp lệ. Vui lòng chọn lại.";
        console.error("Address save failed: Could not find names for selected codes.", {
            selectedProvinceCode: selectedProvinceCode.value,
            selectedDistrictCode: selectedDistrictCode.value,
            selectedWardCode: selectedWardCode.value
        });
        return;
    }

    // Create the address object to save, including codes and names
    const addressToSave = {
        ...JSON.parse(JSON.stringify(currentAddress.value)), // Clone current edits
        provinceCode: selectedProvince.code,
        districtCode: selectedDistrict.code,
        wardCode: selectedWard.code,
        city: selectedProvince.name,      // Save city name (Province name)
        district: selectedDistrict.name, // Save district name
        ward: selectedWard.name         // Save ward name
    };
    // Ensure addressType is correctly formatted (number or null)
     addressToSave.addressType = addressToSave.addressType !== null && addressToSave.addressType !== undefined ? parseInt(addressToSave.addressType, 10) : null;


    // Add or Update the address in the main form data (editFormData)
    if (modalMode.value === 'edit' && currentAddressIndex.value !== null) {
        updateAddress(currentAddressIndex.value, addressToSave);
        toast.info("Đã cập nhật địa chỉ. Nhấn 'Lưu thay đổi' để hoàn tất.");
    } else {
        addNewAddress(addressToSave);
        toast.info("Đã thêm địa chỉ mới. Nhấn 'Lưu thay đổi' để hoàn tất.");
    }
    closeAddressModal(); // Close modal on successful add/update
};


// --- Formatting functions remain the same ---
const formatGender = (gender) => {
    if (!gender) return '';
    switch (gender.toUpperCase()) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return gender; // Return original if not recognized
    }
};
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        // Use options for clarity and consistency
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
    catch (e) {
        console.warn("Could not format date:", dateString, e);
        return dateString; // Return original string if formatting fails
    }
};
const formatDateForInput = (dateString) => {
   if (!dateString) return '';
   try {
      const date = new Date(dateString);
      // Ensure the date is valid before converting
      if (isNaN(date.getTime())) return '';
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
   } catch(e) {
       console.warn("Could not format date for input:", dateString, e);
       return '';
   }
};
const formatStatus = (status) => {
   if (!status) return 'Không xác định';
   switch (status.toUpperCase()) {
      case 'ACTIVE': return 'Đã kích hoạt';
      case 'INACTIVE': return 'Đã khóa';
      case 'PENDING_VERIFICATION': return 'Chờ xác minh';
      case 'NONE': return 'Chưa xác định';
      default: return status; // Return original if not recognized
   }
};
const statusBadgeClass = (status) => {
   if (!status) return 'badge bg-secondary';
   switch (status.toUpperCase()) {
      case 'ACTIVE': return 'badge bg-success';
      case 'INACTIVE': return 'badge bg-danger';
      case 'PENDING_VERIFICATION': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary'; // Default badge for unrecognized status
   }
};
// Improved address formatting
const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [
        // Combine apartment/floor/building logically
        (address.apartmentNumber ? `Căn hộ ${address.apartmentNumber}` : null),
        (address.floor ? `Lầu ${address.floor}` : null),
        address.building,
        // Combine street number and name
        [address.streetNumber, address.street].filter(Boolean).join(' '),
        address.ward,
        address.district,
        address.city,
        address.country
    ].filter(Boolean); // Remove null/empty parts
    return parts.join(', ');
};


// --- handleDateInput function remains the same ---
const handleDateInput = (event) => {
  const value = event.target.value; // YYYY-MM-DD format from input type="date"
  if (value) {
      try {
          // Convert YYYY-MM-DD to ISO string Z (UTC) to store consistently
          // Adding T00:00:00Z ensures it's treated as the start of the day in UTC
          editFormData.value.birthday = new Date(value + 'T00:00:00Z').toISOString();
      } catch (e) {
          console.error("Error converting date input:", e);
          editFormData.value.birthday = null; // Set to null if conversion fails
      }
  } else {
      editFormData.value.birthday = null; // Set to null if input is cleared
  }
};

// --- NEW: Function to navigate to the change password page ---
const goToChangePassword = () => {
    // Navigate to the named route 'change-password'.
    // Ensure you have defined this route in your Vue Router setup.
    router.push({ name: 'change-password' });
};

// --- onMounted remains largely the same, fetches user data ---
onMounted(() => {
  // Initialize Bootstrap Modal for addresses
  if (addressModalRef.value) {
    // Ensure Bootstrap is loaded
    if (window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      try {
        addressModalInstance = new window.bootstrap.Modal(addressModalRef.value);

        // Add event listener to clear modal state when it's hidden
        addressModalRef.value.addEventListener('hidden.bs.modal', () => {
          // Reset modal-specific state
          currentAddress.value = {};
          currentAddressIndex.value = null;
          modalMode.value = 'add'; // Default to 'add' mode
          addressModalError.value = null; // Clear modal error
          // Reset dropdown selections and lists
          selectedProvinceCode.value = null;
          selectedDistrictCode.value = null;
          selectedWardCode.value = null;
          districtsList.value = [];
          wardsList.value = [];
        });

      } catch (e) {
        console.error("Failed to initialize Bootstrap modal:", e);
        fetchError.value = "Lỗi khởi tạo cửa sổ địa chỉ. Vui lòng thử tải lại trang.";
      }
    } else {
        console.error("Bootstrap Modal function not found. Ensure Bootstrap JS is loaded.");
        fetchError.value = "Không thể tải thành phần cửa sổ địa chỉ. Bootstrap JS có thể chưa được tải đúng cách.";
    }
  } else {
     console.error("MOUNTED: Modal element ref ('addressModalRef') not found!");
  }

   // Initial data fetch
   const initialApiClient = getAuthApiClient(); // This also decodes token and sets currentUserId
    if (initialApiClient && currentUserId) {
       fetchUserData(currentUserId); // Fetch data using the obtained userId
    } else {
        // Handle case where user is not authenticated or userId couldn't be obtained
        loading.value = false;
        // fetchError should be set by getAuthApiClient if there was an issue
        if (!fetchError.value) {
             fetchError.value = "Không thể xác thực người dùng để tải dữ liệu.";
        }
    }
});

</script>

<style scoped>
/* Styles remain the same */
.card { margin-bottom: 1.5rem; }
dt { font-weight: 600; color: #6c757d; margin-bottom: 0.5rem; }
dd { margin-bottom: 1rem; }
.badge { font-size: 0.85em; padding: 0.4em 0.7em; }
.form-label { font-size: 0.85rem; margin-bottom: 0.2rem; }
.list-group-item { border-bottom: 1px solid #eee !important; }
.list-group-item:last-child { border-bottom: 0 !important; }
input:disabled,
select:disabled {
    background-color: #e9ecef;
    opacity: 0.7;
    cursor: not-allowed;
}
.form-label .spinner-border {
    width: 0.8rem;
    height: 0.8rem;
    vertical-align: text-bottom;
}
.alert span[class*='math-inline'] { /* Basic fix for escaped span */
    display: inline; /* Reset display if needed */
}
.alert ul {
    padding-left: 1.5rem;
    margin-bottom: 0;
}
.alert li {
    font-size: 0.9em;
}
</style>