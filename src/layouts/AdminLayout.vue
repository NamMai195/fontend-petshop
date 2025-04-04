<template>
  <div class="admin-layout app-wrapper bg-body-tertiary">
    <AdminHeader />
    <AdminSidebar />
    <main class="app-main">
      <router-view />
    </main>
    <AdminFooter />
  </div>
</template>

<script setup>
import AdminHeader from '@/components/Layout/Admin/AdminHeader.vue';
import AdminSidebar from '@/components/Layout/Admin/AdminSidebar.vue';
import AdminFooter from '@/components/Layout/Admin/AdminFooter.vue';
</script>

<style>
</style>