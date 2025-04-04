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
import AdminHeader from '@/components/layout/admin/AdminHeader.vue';
import AdminSidebar from '@/components/layout/admin/AdminSidebar.vue';
import AdminFooter from '@/components/layout/admin/AdminFooter.vue';
</script>

<style>
</style>