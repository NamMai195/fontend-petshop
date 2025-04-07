<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-medium">
        {{ totalItems }} users found
      </h1>
      <VBtn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openAddUserDialog"
      >
        Add User
      </VBtn>
    </div>

    <!-- Filters -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="3">
            <VTextField
              v-model="filters.keyword"
              label="Search by name/username/email"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="handleSearch"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filters.role"
              label="Filter by role"
              variant="outlined"
              density="compact"
              clearable
              :items="[
                { title: 'Admin', value: 'ADMIN' },
                { title: 'User', value: 'USER' }
              ]"
              @update:model-value="fetchUsers"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filters.status"
              label="Filter by status"
              variant="outlined"
              density="compact"
              clearable
              :items="[
                { title: 'Active', value: 'ACTIVE' },
                { title: 'Inactive', value: 'INACTIVE' }
              ]"
              @update:model-value="fetchUsers"
            />
          </VCol>
          <VCol cols="12" sm="3">
            <VSelect
              v-model="filters.sortBy"
              label="Sort by"
              variant="outlined"
              density="compact"
              :items="[
                { title: 'Newest first', value: 'newest' },
                { title: 'Oldest first', value: 'oldest' },
                { title: 'Name A-Z', value: 'name_asc' },
                { title: 'Name Z-A', value: 'name_desc' }
              ]"
              @update:model-value="fetchUsers"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Users Table -->
    <VCard>
      <VCardText>
        <VProgressLinear
          v-if="loading"
          indeterminate
          color="primary"
        ></VProgressLinear>

        <VTable v-else>
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="d-flex align-center">
                  <VAvatar size="40" class="me-2">
                    <VIcon icon="mdi-account" />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">{{ user.fullName }}</div>
                    <div class="text-caption">@{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ user.email }}</div>
                <div class="text-caption">{{ user.phone || 'No phone' }}</div>
              </td>
              <td>
                <VChip
                  :color="user.role === 'ADMIN' ? 'primary' : 'success'"
                  size="small"
                >
                  {{ user.role }}
                </VChip>
              </td>
              <td>
                <VChip
                  :color="user.status === 'ACTIVE' ? 'success' : 'error'"
                  size="small"
                >
                  {{ user.status }}
                </VChip>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td class="text-center">
                <VBtn
                  color="primary"
                  variant="text"
                  size="small"
                  class="me-2"
                  @click="openViewUserDialog(user)"
                >
                  <VIcon icon="mdi-eye" />
                </VBtn>
                <VBtn
                  color="warning"
                  variant="text"
                  size="small"
                  class="me-2"
                  @click="openEditUserDialog(user)"
                >
                  <VIcon icon="mdi-pencil" />
                </VBtn>
                <VBtn
                  color="error"
                  variant="text"
                  size="small"
                  @click="openDeleteUserDialog(user)"
                >
                  <VIcon icon="mdi-delete" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Empty State -->
        <div
          v-if="!loading && (!users || users.length === 0)"
          class="text-center py-4"
        >
          <VIcon
            icon="mdi-account-group"
            size="48"
            color="grey-lighten-1"
            class="mb-2"
          />
          <p class="text-medium-emphasis">No users found</p>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-end mt-4">
          <VPagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="7"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- View User Dialog -->
    <VDialog
      v-model="viewDialog"
      max-width="600"
    >
      <VCard v-if="selectedUser">
        <VCardTitle class="text-h5 pa-4 d-flex justify-space-between align-center">
          <span>User Details</span>
          <VBtn
            icon
            variant="text"
            @click="viewDialog = false"
          >
            <VIcon icon="mdi-close" />
          </VBtn>
        </VCardTitle>

        <VCardText class="pt-4">
          <VRow>
            <VCol cols="12">
              <div class="d-flex align-center mb-4">
                <VAvatar size="64" class="me-3">
                  <VIcon icon="mdi-account" size="32" />
                </VAvatar>
                <div>
                  <div class="text-h6">{{ selectedUser.fullName }}</div>
                  <div class="text-caption">@{{ selectedUser.username }}</div>
                  <div class="d-flex align-center mt-2">
                    <VChip
                      :color="selectedUser.role === 'ADMIN' ? 'primary' : 'success'"
                      size="small"
                      class="me-2"
                    >
                      {{ selectedUser.role }}
                    </VChip>
                    <VChip
                      :color="selectedUser.status === 'ACTIVE' ? 'success' : 'error'"
                      size="small"
                    >
                      {{ selectedUser.status }}
                    </VChip>
                  </div>
                </div>
              </div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="text-subtitle-2 mb-1">Email</div>
              <div>{{ selectedUser.email }}</div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="text-subtitle-2 mb-1">Phone</div>
              <div>{{ selectedUser.phone || 'Not provided' }}</div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="text-subtitle-2 mb-1">Gender</div>
              <div>{{ selectedUser.gender || 'Not specified' }}</div>
            </VCol>

            <VCol cols="12" sm="6">
              <div class="text-subtitle-2 mb-1">Birthday</div>
              <div>{{ selectedUser.birthday ? formatDate(selectedUser.birthday) : 'Not specified' }}</div>
            </VCol>

            <VCol cols="12">
              <div class="text-subtitle-2 mb-1">Addresses</div>
              <div v-if="selectedUser.addresses && selectedUser.addresses.length > 0">
                <div v-for="(address, index) in selectedUser.addresses" :key="index" class="mb-2">
                  <div class="font-weight-medium">{{ address.type }}</div>
                  <div>{{ address.street }}, {{ address.city }}, {{ address.state }}, {{ address.country }}</div>
                </div>
              </div>
              <div v-else>No addresses provided</div>
            </VCol>

            <VCol cols="12">
              <div class="text-subtitle-2 mb-1">Joined Date</div>
              <div>{{ formatDate(selectedUser.createdAt) }}</div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Add/Edit User Dialog -->
    <VDialog
      v-model="editDialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="text-h5 pa-4 d-flex justify-space-between align-center">
          <span>{{ editedUser.id ? 'Edit User' : 'Add User' }}</span>
          <VBtn
            icon
            variant="text"
            @click="editDialog = false"
          >
            <VIcon icon="mdi-close" />
          </VBtn>
        </VCardTitle>

        <VCardText class="pt-4">
          <VForm
            ref="form"
            v-model="valid"
            @submit.prevent="saveUser"
          >
            <VRow>
              <VCol cols="12" sm="6">
                <VTextField
                  v-model="editedUser.firstName"
                  label="First Name"
                  :rules="[v => !!v || 'First name is required']"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="editedUser.lastName"
                  label="Last Name"
                  :rules="[v => !!v || 'Last name is required']"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="editedUser.username"
                  label="Username"
                  :rules="[v => !!v || 'Username is required']"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="editedUser.email"
                  label="Email"
                  type="email"
                  :rules="[
                    v => !!v || 'Email is required',
                    v => /.+@.+\..+/.test(v) || 'Email must be valid'
                  ]"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="editedUser.phone"
                  label="Phone"
                  :rules="[v => !v || /^[0-9+\-\s()]*$/.test(v) || 'Phone must be valid']"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="editedUser.gender"
                  label="Gender"
                  :items="['Male', 'Female', 'Other']"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="editedUser.birthday"
                  label="Birthday"
                  type="date"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="editedUser.type"
                  label="Role"
                  :items="['ADMIN', 'USER']"
                  :rules="[v => !!v || 'Role is required']"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="editedUser.status"
                  label="Status"
                  :items="['ACTIVE', 'INACTIVE']"
                  :rules="[v => !!v || 'Status is required']"
                  required
                />
              </VCol>

              <VCol cols="12" v-if="!editedUser.id">
                <VTextField
                  v-model="editedUser.password"
                  label="Password"
                  type="password"
                  :rules="[
                    v => !!v || 'Password is required',
                    v => v.length >= 6 || 'Password must be at least 6 characters'
                  ]"
                  required
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="secondary"
            variant="text"
            @click="editDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="updating"
            :disabled="!valid"
            @click="saveUser"
          >
            {{ editedUser.id ? 'Update' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete User Dialog -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle class="text-h5 pa-4">
          Delete User
        </VCardTitle>

        <VCardText class="pt-4">
          Are you sure you want to delete this user?
          <div class="mt-2">
            <strong>{{ selectedUser?.fullName }}</strong>
            <div class="text-caption">@{{ selectedUser?.username }}</div>
          </div>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="secondary"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            :loading="deleting"
            @click="deleteUser"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '../../plugins/axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const loading = ref(false)
const updating = ref(false)
const deleting = ref(false)
const valid = ref(false)
const users = ref([])
const totalItems = ref(0)
const totalPages = ref(0)
const page = ref(1)
const viewDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedUser = ref(null)
const editedUser = ref(null)
const form = ref(null)
const filters = ref({
  keyword: null,
  role: null,
  status: null,
  sortBy: 'newest'
})

// Methods
const fetchUsers = async () => {
  loading.value = true
  try {
    // Xây dựng tham số tìm kiếm
    const params = {
      page: page.value - 1,
      size: 20
    }

    // Thêm từ khóa tìm kiếm
    if (filters.value.keyword) {
      params.keyword = filters.value.keyword // Tìm theo tên, username, email
    }

    // Thêm lọc theo role
    if (filters.value.role) {
      params.type = filters.value.role // Lọc theo ADMIN hoặc USER
    }

    // Thêm lọc theo status
    if (filters.value.status) {
      params.status = filters.value.status // Lọc theo ACTIVE hoặc INACTIVE
    }

    // Thêm sắp xếp
    if (filters.value.sortBy) {
      switch (filters.value.sortBy) {
        case 'newest':
          params.sort = 'id,desc'
          break
        case 'oldest':
          params.sort = 'id,asc'
          break
        case 'name_asc':
          params.sort = 'firstName,asc'
          break
        case 'name_desc':
          params.sort = 'firstName,desc'
          break
      }
    }

    console.log('Fetching users with params:', params)

    const response = await axios.get('/api/v1/users', { params })

    console.log('Users response:', response.data)

    if (response.data) {
      // Xử lý dữ liệu trả về là mảng
      const userData = Array.isArray(response.data) ? response.data : []
      users.value = userData.map(user => ({
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'No phone',
        role: user.type || 'USER',
        status: user.status || 'INACTIVE',
        createdAt: user.createdAt || new Date().toISOString(),
        gender: user.gender || 'Not specified',
        birthday: user.birthday || null,
        addresses: user.addresses || [],
        firstName: user.firstName,
        lastName: user.lastName,
        type: user.type
      }))
      
      totalItems.value = userData.length
      totalPages.value = 1 // Vì API trả về tất cả dữ liệu trong 1 trang
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    if (error.response?.status === 403) {
      toast.error('Access denied. Please check your permissions.')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    } else {
      toast.error('Failed to load users')
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openViewUserDialog = (user) => {
  selectedUser.value = user
  viewDialog.value = true
}

const openAddUserDialog = () => {
  editedUser.value = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    type: 'USER',
    status: 'ACTIVE',
    password: '',
    addresses: []
  }
  editDialog.value = true
}

const openEditUserDialog = (user) => {
  editedUser.value = { ...user }
  editDialog.value = true
}

const openDeleteUserDialog = (user) => {
  selectedUser.value = user
  deleteDialog.value = true
}

const saveUser = async () => {
  if (!form.value.validate()) return

  updating.value = true
  try {
    // Chuẩn bị dữ liệu để gửi lên server
    const userData = {
      firstName: editedUser.value.firstName,
      lastName: editedUser.value.lastName,
      username: editedUser.value.username,
      email: editedUser.value.email,
      phone: editedUser.value.phone,
      gender: editedUser.value.gender,
      birthday: editedUser.value.birthday,
      type: editedUser.value.type,
      status: editedUser.value.status
    }

    // Thêm password nếu là tạo mới
    if (!editedUser.value.id) {
      userData.password = editedUser.value.password
    }

    if (editedUser.value.id) {
      // Update user
      await axios.put(`/api/v1/users/${editedUser.value.id}`, userData)
      toast.success('User updated successfully')
    } else {
      // Create user
      await axios.post('/api/v1/users', userData)
      toast.success('User created successfully')
    }
    editDialog.value = false
    fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    if (error.response?.status === 403) {
      toast.error('Access denied. Cannot save user.')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    } else {
      toast.error('Failed to save user')
    }
  } finally {
    updating.value = false
  }
}

const deleteUser = async () => {
  if (!selectedUser.value) return

  deleting.value = true
  try {
    await axios.delete(`/api/v1/users/${selectedUser.value.id}`)
    toast.success('User deleted successfully')
    deleteDialog.value = false
    fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    if (error.response?.status === 403) {
      toast.error('Access denied. Cannot delete user.')
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    } else {
      toast.error('Failed to delete user')
    }
  } finally {
    deleting.value = false
  }
}

// Thêm debounce để không gọi API quá nhiều khi người dùng gõ
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 500) // Đợi 500ms sau khi người dùng ngừng gõ
}

// Watchers
watch(page, () => {
  fetchUsers()
})

// Cập nhật watcher cho filters để không gọi API khi thay đổi keyword
watch([() => filters.value.role, () => filters.value.status, () => filters.value.sortBy], () => {
  page.value = 1
  fetchUsers()
})

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}
</style>