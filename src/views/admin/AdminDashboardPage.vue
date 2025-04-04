<template>
  <div>
    <div class="app-content-header">
      <div class="container-fluid">
        <div class="row">
          <div class="col-sm-6"><h3 class="mb-0">Dashboard</h3></div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-end">
              <li class="breadcrumb-item"><router-link :to="{ name: 'admin-dashboard'}">Home</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div class="app-content">
      <div class="container-fluid">
        <div class="row">
          <DashboardStatCard
            v-for="(stat, index) in statsData"
            :key="index"
            :title="stat.title"
            :value="stat.value"
            :supValue="stat.supValue"
            :colorClass="stat.colorClass"
            :iconClass="stat.iconClass"
            :moreInfoLink="stat.moreInfoLink"
          />
        </div>

        <div class="row">
          <div class="col-lg-7">
            <div class="card mb-4">
              <div class="card-header"><h3 class="card-title">Sales Value Chart (Placeholder)</h3></div>
              <div class="card-body">Chart content goes here...</div>
            </div>
             <div class="card direct-chat direct-chat-primary mb-4">
              <div class="card-header"><h3 class="card-title">Direct Chat (Placeholder)</h3></div>
              <div class="card-body">Chat content goes here...</div>
            </div>
          </div>
           <div class="col-lg-5">
             <div class="card text-white bg-primary bg-gradient border-primary mb-4">
               <div class="card-header border-0"><h3 class="card-title">World Map Widget (Placeholder)</h3></div>
                <div class="card-body">Map content goes here...</div>
             </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DashboardStatCard from '@/components/layout/admin/DashboardStatCard.vue';

const statsData = ref([
  {
    title: 'New Orders',
    value: 150,
    colorClass: 'text-bg-primary',
    iconClass: 'bi bi-bag-check-fill',
    moreInfoLink: { name: 'admin-dashboard' }
  },
  {
    title: 'Bounce Rate',
    value: 53,
    supValue: '%',
    colorClass: 'text-bg-success',
    iconClass: 'bi bi-graph-up-arrow',
    moreInfoLink: { name: 'admin-dashboard' }
  },
   {
    title: 'User Registrations',
    value: 44,
    colorClass: 'text-bg-warning',
    iconClass: 'bi bi-person-plus-fill',
    moreInfoLink: { name: 'admin-dashboard' }
  },
   {
    title: 'Unique Visitors',
    value: 65,
    colorClass: 'text-bg-danger',
    iconClass: 'bi bi-pie-chart-fill',
    moreInfoLink: { name: 'admin-dashboard' }
  }
]);
</script>

<style scoped>
</style>