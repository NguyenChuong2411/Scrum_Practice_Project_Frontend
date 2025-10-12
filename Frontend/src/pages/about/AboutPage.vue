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
    
    <!-- View Section -->
<section class="view-section">
  <div class="view-main">
    
    <!-- Left content -->
    <div class="view-card">
      <h2 class="view-title">Tầm nhìn</h2>
      <p class="view-desc">
        Đào tạo hàng triệu học viên Việt Nam nói tiếng Anh như người bản ngữ.

        Trở thành 1 trong top 5 thương hiệu đào tạo ngôn ngữ, đặc biệt là tiếng Anh.

        Trở thành hệ thống được kiểm định khảo thí quốc tế.
      </p>
    </div>

    <!-- Middle image
    <div class="view-middle">
      <img src="@/images/2_about/Banner về chúng tôi.png" alt="Học viên" />
    </div> -->

    <!-- Right content -->
    <div class="view-card">
      <h2 class="view-title">Sứ mệnh</h2>
      <p class="view-desc">
        Giúp học viên phát triển toàn diện, tự tin vươn ra thế giới, hiện thực
        khát vọng, cống hiến cho xã hội, đất nước Việt Nam.
      </p>
    </div>

  </div>
</section>
    


  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import './AboutPage.css'

// Component logic
onMounted(() => {
  console.log('Home page loaded')
})
</script>

<style src="./AboutPage.css" scoped></style>