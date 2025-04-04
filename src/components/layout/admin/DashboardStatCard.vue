<template>
    <div class="col-lg-3 col-6">
      <div class="small-box" :class="colorClass">
        <div class="inner">
          <h3>{{ value }}<sup v-if="supValue" class="fs-5">{{ supValue }}</sup></h3>
          <p>{{ title }}</p>
        </div>
        <div class="icon">
           <i :class="iconClass" v-if="iconClass"></i>
        </div>
        <router-link :to="moreInfoLink" class="small-box-footer">
          More info <i class="bi bi-arrow-right-circle-fill"></i>
        </router-link>
      </div>
    </div>
  </template>
  
<script setup>

  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    supValue: {
      type: String,
      default: ''
    },
    colorClass: {
      type: String,
      required: true
    },
    iconClass: {
      type: String,
      default: ''
    },
    moreInfoLink: {
      type: Object,
      required: true,
      default: () => ({ name: 'admin-dashboard' })
    }
  });
  </script>
  
  <style scoped>
  .small-box {
    position: relative;
  }
  .small-box .icon {
      position: absolute;
      top: auto;
      bottom: 5px;
      right: 15px;
      z-index: 0;
      font-size: 70px;
      color: rgba(0, 0, 0, 0.15);
  }
  .small-box > .small-box-footer {
      background-color: rgba(0, 0, 0, 0.1);
      color: rgba(255, 255, 255, 0.8);
      display: block;
      padding: 3px 0;
      position: relative;
      text-align: center;
      text-decoration: none;
      z-index: 10;
      transition: all 0.3s ease-in-out;
  }
  .small-box:hover > .small-box-footer {
      background-color: rgba(0, 0, 0, 0.2);
      color: #fff;
  }
  </style>
