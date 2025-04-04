<template>
  <div class="home-page">
    <HeroSlider />
    <CategoriesSection />
    <ClothingSection />
    <FoodiesSection />
    <ClearanceSaleBanner />
    <TestimonialSlider />
    <BestsellingSection />
    <RegisterSection />
    <LatestBlogSection />
    <ServicesSection />
    <InstagramSection />

  </div>
</template>

<script setup>
import HeroSlider from '@/components/sections/HeroSlider.vue';
import CategoriesSection from '@/components/sections/CategoriesSection.vue';
import ClothingSection from '@/components/sections/ClothingSection.vue';
import FoodiesSection from '@/components/sections/FoodiesSection.vue';
import ClearanceSaleBanner from '@/components/common/ClearanceSaleBanner.vue';
import TestimonialSlider from '@/components/sections/TestimonialSlider.vue';
import BestsellingSection from '@/components/sections/BestsellingSection.vue';
import RegisterSection from '@/components/sections/RegisterSection.vue';
import LatestBlogSection from '@/components/sections/LatestBlogSection.vue';
import ServicesSection from '@/components/sections/ServicesSection.vue';
import InstagramSection from '@/components/sections/InstagramSection.vue';
</script>