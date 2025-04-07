<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        title="Admin User"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon.icon"
          :title="item.title"
          :to="item.to"
          rounded="lg"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Admin Dashboard</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-filter</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view :key="$route.fullPath"></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
// import { useRoute, useRouter } from 'vue-router' // Vẫn comment nếu watch đã xóa
import navigation from '@/navigation/vertical' // Đảm bảo file này đúng cấu trúc

// const route = useRoute() // Vẫn comment nếu watch đã xóa
// const router = useRouter() // Vẫn comment nếu watch đã xóa

const drawer = ref(true)
const rail = ref(true)
const menuItems = ref(navigation) // Đảm bảo navigation chứa đúng cấu trúc { title, icon, to }

// **** QUAN TRỌNG: Đảm bảo khối watch dưới đây đã được xóa hoặc comment ****
/*
watch(() => route.name, async (newRouteName) => {
  if (newRouteName === 'admin-dashboard') {
    // Force a reload of the dashboard component
    await router.replace({ name: 'admin-dashboard', query: { _ts: Date.now() } })
  }
}, { immediate: true })
*/
</script>

<style scoped>
.v-navigation-drawer {
  transition: 0.2s ease-in-out;
}
</style>