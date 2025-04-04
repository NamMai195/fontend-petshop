<template>
  <section id="banner" style="background: #F9F3EC;">
    <div class="container">
      <div class="swiper main-swiper" ref="mainSwiper">
        <div class="swiper-wrapper">

          <div class="swiper-slide py-5">
            <div class="row banner-content align-items-center">
              <div class="img-wrapper col-md-5">
                <img src="/src/assets/images/banner-img.png" class="img-fluid" alt="Banner Image 1">
              </div>
              <div class="content-wrapper col-md-7 p-5 mb-5">
                <div class="secondary-font text-primary text-uppercase mb-4">Save 10 - 20 % off</div>
                <h2 class="banner-title display-1 fw-normal">Best destination for <span class="text-primary">your pets</span></h2>
                <a href="#" class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
                  shop now
                  <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
                    <use xlink:href="#arrow-right"></use>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div class="swiper-slide py-5">
            <div class="row banner-content align-items-center">
              <div class="img-wrapper col-md-5">
                 <img src="/src/assets/images/banner-img3.png" class="img-fluid" alt="Banner Image 2">
              </div>
              <div class="content-wrapper col-md-7 p-5 mb-5">
                <div class="secondary-font text-primary text-uppercase mb-4">Save 10 - 20 % off</div>
                <h2 class="banner-title display-1 fw-normal">Best destination for <span class="text-primary">your pets</span></h2>
                <a href="#" class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
                  shop now
                  <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
                    <use xlink:href="#arrow-right"></use>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div class="swiper-slide py-5">
            <div class="row banner-content align-items-center">
              <div class="img-wrapper col-md-5">
                 <img src="/src/assets/images/banner-img4.png" class="img-fluid" alt="Banner Image 3">
              </div>
              <div class="content-wrapper col-md-7 p-5 mb-5">
                <div class="secondary-font text-primary text-uppercase mb-4">Save 10 - 20 % off</div>
                <h2 class="banner-title display-1 fw-normal">Best destination for <span class="text-primary">your pets</span></h2>
                <a href="#" class="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
                  shop now
                  <svg width="24" height="24" viewBox="0 0 24 24" class="mb-1">
                    <use xlink:href="#arrow-right"></use>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div class="swiper-pagination mb-5"></div>

      </div>
    </div>
  </section>
</template>

<script>
import Swiper from 'swiper/core';
import { Pagination, Autoplay } from 'swiper/modules';

// Import CSS
import 'swiper/swiper-bundle.css';


export default {
  name: 'BannerSlider', 
  mounted() {
    this.$nextTick(() => {
      Swiper.use([Pagination, Autoplay]);

      new Swiper(this.$refs.mainSwiper || '.main-swiper', {
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      
        autoplay: {
          delay: 3000, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true, 
        },
      });
    });
  },
  beforeDestroy() {
    const swiperInstance = this.$refs.mainSwiper?.swiper;
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
    }
  }
}
</script>
