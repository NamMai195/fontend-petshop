<template>
    <aside class="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div class="sidebar-brand">
        <router-link :to="{ name: 'admin-dashboard' }" class="brand-link">
          <img
            src="/src/assets/images/logo.png"
            alt="AdminLTE Logo"
            class="brand-image opacity-75 shadow"
          />
          <span class="brand-text fw-light">Admin Panel</span>
        </router-link>
      </div>
      <div class="sidebar-wrapper">
        <nav class="mt-2">
          <ul
            class="nav sidebar-menu flex-column"
            data-lte-toggle="treeview"
            role="menu"
            data-accordion="false"
          >
            <li class="nav-item">
              <router-link :to="{ name: 'admin-dashboard' }" class="nav-link" active-class="active">
                <i class="nav-icon bi bi-speedometer"></i>
                <p>Dashboard</p>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'admin-product-list' }" class="nav-link" active-class="active">
                 <i class="nav-icon bi bi-box-seam-fill"></i>
                <p>Products</p>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .nav-link.active {
     font-weight: bold;
  }
  </style>