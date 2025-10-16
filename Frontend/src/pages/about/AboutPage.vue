<template>
  <div class="about-page">
    <section class="native-section">
      <div class="native-bg">
        <img src="../../images/2_about/Container.png" alt="Background" class="native-bg-img" />
      </div>
      <div class="native-main">
        <div class="native-left">
          <h1 class="native-big-title">Một thập kỷ<br>"Nói tiếng Anh<br>như người bản ngữ"</h1>
        </div>
        <div class="native-right">
          <div class="native-desc">
            Enly English được thành lập vào 2013 với sứ mệnh đào tạo ngôn ngữ cho thế hệ trẻ Việt Nam,với tôn chỉ "Native-like speakers" hơn 10 năm qua Enly tự hào đã giúp 5000 học viên "nói tiếng Anh như người bản ngữ". Nhiều học viên đạt thành tựu xuất sắc trong các kỳ thi quốc tế, giành học bổng giá trị tại các trường đại học danh tiếng trên thế giới.<br><br>
            Tới hiện tại, Enly đã phát triển trở thành hệ thống trung tâm đào tạo tiếng Anh bản ngữ hàng đầu với 5 trung tâm tại Hà Nội, chương trình tiếng Anh phổ thông Cambridge tại Era School.
          </div>
        </div>
      </div>
      <div class="native-images-row">
        <img src="../../images/2_about/Banner về chúng tôi.png" alt="Banner" class="native-img-card native-img-main" />
      </div>
    </section>
    
<section class="view-section">
  <div class="view-main">
    <!-- Left content -->
    <div class="view-card view-left">
      <h2 class="view-title">Tầm nhìn</h2>
      <p class="view-desc">
        Đào tạo hàng triệu học viên Việt Nam nói tiếng Anh như người bản ngữ.<br>
        Trở thành hệ thống được kiểm định khảo thí quốc tế.
      </p>
    </div>

    <!-- Center image -->
    <div class="view-image-wrapper">
      <img src="../../images/2_about/Banner về chúng tôi_ Tầm nhìn & sứ mệnh.png"
           alt="Tầm nhìn & Sứ mệnh" class="view-center-img" />
    </div>

    <!-- Right content -->
    <div class="view-card view-right">
      <h2 class="view-title">Sứ mệnh</h2>
      <p class="view-desc">
        Giúp học viên phát triển toàn diện, tự tin vươn ra thế giới, hiện thực<br>
        khát vọng, cống hiến cho xã hội, đất nước Việt Nam.
      </p>
    </div>
  </div>
</section>

<!-- Core section -->
 <section class="core-section">
  <div class="core-bg"></div>

  <div class="core-content">
    <h2 class="core-title">Giá trị cốt lõi</h2>
    <p class="core-subtitle">
      Enly English đặt tâm huyết vào việc xây dựng và duy trì những giá trị cốt lõi quan trọng:
    </p>

    <div class="core-cards">
      <div class="core-card">
        <img src="../../images/2_about/1.png" alt="Chuẩn quốc tế" class="core-icon" />
        <h3>Chuẩn quốc tế</h3>
        <p>Đảm bảo chương trình học đạt tiêu chuẩn quốc tế, giúp học viên tự tin sử dụng tiếng Anh trong môi trường đa văn hóa.</p>
      </div>

      <div class="core-card">
        <img src="../../images/2_about/2.png" alt="Sáng tạo" class="core-icon" />
        <h3>Sáng tạo</h3>
        <p>Các phương pháp giáo dục, hoạt động tiếp cận ngôn ngữ mới được cập nhật liên tục, đảm bảo học viên học hiệu quả nhất.</p>
      </div>

      <div class="core-card">
        <img src="../../images/2_about/3.png" alt="Tận tâm" class="core-icon" />
        <h3>Tận tâm</h3>
        <p>Hiểu rõ nhu cầu học viên, liên tục thiết kế lộ trình cá nhân hóa giúp đạt mục tiêu nhanh nhất.</p>
      </div>

      <div class="core-card">
        <img src="../../images/2_about/4.png" alt="Phát triển" class="core-icon" />
        <h3>Phát triển</h3>
        <p>Không ngừng nâng cao chất lượng đào tạo, mang lại giá trị bền vững cho học viên và cộng đồng.</p>
      </div>
    </div>
  </div>
</section>

  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import './AboutPage.css'

let scrollPos = 0;
let cards = null;
let wheelHandler = null;

onMounted(() => {
  cards = document.querySelector('.core-cards');
  scrollPos = 0;
  wheelHandler = (e) => {
    if (!cards) return;
    if (window.innerWidth > 900) {
      // Chỉ áp dụng cho desktop
      if (e.target.closest('.core-section')) {
        e.preventDefault();
        // deltaY < 0: cuộn lên (dịch phải), deltaY > 0: cuộn xuống (dịch trái)
        scrollPos += e.deltaY * 0.7;
        const maxScroll = cards.scrollWidth - window.innerWidth;
        if (scrollPos < 0) scrollPos = 0;
        if (scrollPos > maxScroll) scrollPos = maxScroll;
        cards.style.transform = `translateX(-${scrollPos}px)`;
      }
    }
  };
  window.addEventListener('wheel', wheelHandler, { passive: false });
  console.log('Home page loaded')
});

onBeforeUnmount(() => {
  if (wheelHandler) window.removeEventListener('wheel', wheelHandler);
});
</script>
