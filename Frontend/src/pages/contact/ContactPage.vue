<template>
  <div class="contact-page">
    <!-- Header Section -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Xin chào bạn</h1>
        <p class="page-subtitle">Hãy kết nối với chúng tôi để bắt đầu hành trình học tiếng Anh</p>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="contact-content">
      <div class="container">
        <div class="contact-layout">
          <!-- Contact Form -->
          <div class="contact-form-section">
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Họ</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    v-model="form.firstName" 
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Tên</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    v-model="form.lastName" 
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="form.email" 
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="phone">Số điện thoại</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    v-model="form.phone" 
                    class="form-input"
                  />
                </div>
              </div>
              <div class="form-row full-width">
                <div class="form-group">
                  <label for="message">Tin nhắn</label>
                  <textarea
                    id="message" 
                    v-model="form.message" 
                    rows="5" 
                    class="form-textarea"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  ></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">Đang gửi...</span>
                <span v-else>Gửi tin nhắn</span>
              </button>
            </form>

            <div v-if="submitMessage" class="submit-message" :class="submitSuccess ? 'success' : 'error'">
              {{ submitMessage }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// Reactive data
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// Methods
const submitForm = async () => {
  isSubmitting.value = true
  submitMessage.value = ''
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    
    submitMessage.value = 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24h.'
    submitSuccess.value = true
    
    // Clear message after 5 seconds
    setTimeout(() => {
      submitMessage.value = ''
    }, 5000)
    
  } catch (error) {
    submitMessage.value = 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.'
    submitSuccess.value = false
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  console.log('Contact page loaded')
})
</script>

<style src="./ContactPage.css" scoped></style>