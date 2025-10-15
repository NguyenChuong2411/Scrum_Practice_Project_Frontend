<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Login Form -->
      <div class="login-form-container">
        <div class="login-form-card">
          <!-- Logo & Title -->
          <div class="form-header">
            <img src="@/assets/logo.svg" alt="Enly Logo" class="login-logo" />
            <h1 class="form-title">{{ isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập' }}</h1>
            <p class="form-subtitle">
              {{ isRegisterMode 
                ? 'Tạo tài khoản mới để trải nghiệm đầy đủ tính năng' 
                : 'Chào mừng bạn trở lại với Enly!' 
              }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="login-form">
            <!-- Name Field (Only for Register) -->
            <div v-if="isRegisterMode" class="form-group">
              <div class="input-wrapper">
                <input
                  type="text"
                  id="fullName"
                  v-model="formData.fullName"
                  class="form-input"
                  :class="{ 'error': errors.fullName }"
                  placeholder=" "
                  required
                />
                <label for="fullName" class="form-label">Họ và tên</label>
              </div>
              <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
            </div>

            <!-- Email Field -->
            <div class="form-group">
              <div class="input-wrapper">
                <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  class="form-input"
                  :class="{ 'error': errors.email }"
                  placeholder=" "
                  required
                />
                <label for="email" class="form-label">Email</label>
              </div>
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <div class="input-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="formData.password"
                  class="form-input"
                  :class="{ 'error': errors.password }"
                  placeholder=" "
                  required
                />
                <label for="password" class="form-label">Mật khẩu</label>
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <!-- Confirm Password Field (Only for Register) -->
            <div v-if="isRegisterMode" class="form-group">
              <div class="input-wrapper">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  class="form-input"
                  :class="{ 'error': errors.confirmPassword }"
                  placeholder=" "
                  required
                />
                <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                <button
                  type="button"
                  class="toggle-password"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>

            <!-- Remember Me & Forgot Password (Only for Login) -->
            <div v-if="!isRegisterMode" class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="formData.rememberMe" />
                <span class="checkmark"></span>
                <span class="checkbox-text">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" class="forgot-password">Quên mật khẩu?</a>
            </div>

            <!-- Terms Agreement (Only for Register) -->
            <!-- <div v-if="isRegisterMode" class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="formData.agreeTerms" required />
                <span class="checkmark"></span>
                <span class="checkbox-text">
                  Tôi đồng ý với 
                  <a href="#" class="terms-link">Điều khoản sử dụng</a> và 
                  <a href="#" class="terms-link">Chính sách bảo mật</a>
                </span>
              </label>
            </div> -->

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-button"
              :disabled="isLoading"
              :class="{ 'loading': isLoading }"
            >
              <span v-if="!isLoading">
                {{ isRegisterMode ? 'Đăng ký' : 'Đăng nhập' }}
              </span>
              <span v-else class="loading-text">
                <i class="fa-solid fa-spinner fa-spin"></i>
                {{ isRegisterMode ? 'Đang đăng ký...' : 'Đang đăng nhập...' }}
              </span>
            </button>

            <!-- Switch Mode -->
            <div class="switch-mode">
              <p>
                {{ isRegisterMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?' }}
                <button
                  type="button"
                  class="switch-button"
                  @click="toggleMode"
                >
                  {{ isRegisterMode ? 'Đăng nhập ngay' : 'Đăng ký ngay' }}
                </button>
              </p>
            </div>

            <!-- Social Login -->
            <div class="social-login">
              <div class="divider">
                <span>hoặc</span>
              </div>
              <div class="social-buttons">
                <button type="button" class="social-button google" @click="loginWithGoogle">
                  <i class="fa-brands fa-google"></i>
                  <span>{{ isRegisterMode ? 'Đăng ký' : 'Đăng nhập' }} với Google</span>
                </button>
                <button type="button" class="social-button facebook" @click="loginWithFacebook">
                  <i class="fa-brands fa-facebook-f"></i>
                  <span>{{ isRegisterMode ? 'Đăng ký' : 'Đăng nhập' }} với Facebook</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI } from '@/services/AuthAPI.js'

const route = useRoute()
const router = useRouter()

// Form state
const isRegisterMode = ref(route.query.mode === 'register')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Form data
const formData = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false,
  agreeTerms: false
})

// Errors
const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Methods
const clearFormAndErrors = () => {
  // Clear form data
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      formData[key] = ''
    } else if (typeof formData[key] === 'boolean') {
      formData[key] = false
    }
  })
  // Clear errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

// Watch cho sự thay đổi của route để cập nhật mode
watch(
  () => route.query.mode,
  (newMode) => {
    isRegisterMode.value = newMode === 'register'
    // Clear form và errors khi chuyển mode
    clearFormAndErrors()
  },
  { immediate: true }
)

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Validate full name (register only)
  if (isRegisterMode.value && !formData.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập họ và tên'
    isValid = false
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    errors.email = 'Vui lòng nhập email'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Email không hợp lệ'
    isValid = false
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Vui lòng nhập mật khẩu'
    isValid = false
  } else if (isRegisterMode.value && formData.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }

  // Validate confirm password (register only)
  if (isRegisterMode.value) {
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    if (isRegisterMode.value) {
      // Handle register
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      }
      
      const result = await authAPI.register(registerData)
      
      if (result.success) {
        alert('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.')
        // Chuyển sang chế độ đăng nhập
        router.push('/login')
        // Clear form data
        clearFormAndErrors()
        // Keep email for convenience
        formData.email = registerData.email
      } else {
        // Hiển thị lỗi từ server
        if (result.error.includes('email')) {
          errors.email = 'Email này đã được sử dụng'
        } else {
          alert(`Đăng ký thất bại: ${result.error}`)
        }
      }
    } else {
      // Handle login
      const loginData = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      }
      
      const result = await authAPI.login(loginData)
      
      if (result.success) {
        alert('Đăng nhập thành công!')
        // Emit event để NavigationBar cập nhật trạng thái
        window.dispatchEvent(new Event('auth-state-changed'))
        // Redirect to home page or previous page
        const redirectTo = route.query.redirect || '/'
        router.push(redirectTo)
      } else {
        // Hiển thị lỗi từ server
        if (result.error.includes('email') || result.error.includes('password') || result.error.includes('không chính xác')) {
          errors.email = 'Email hoặc mật khẩu không chính xác'
          errors.password = 'Email hoặc mật khẩu không chính xác'
        } else {
          alert(`Đăng nhập thất bại: ${result.error}`)
        }
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    alert('Có lỗi xảy ra. Vui lòng kiểm tra kết nối internet và thử lại!')
  } finally {
    isLoading.value = false
  }
}

const toggleMode = () => {
  const newMode = !isRegisterMode.value
  // Update URL - watcher sẽ tự động handle việc clear form
  router.push({
    path: '/login',
    query: newMode ? { mode: 'register' } : {}
  })
}

const loginWithGoogle = () => {
  console.log('Login with Google')
  // TODO: Implement Google OAuth
}

const loginWithFacebook = () => {
  console.log('Login with Facebook')
  // TODO: Implement Facebook OAuth
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: var(--font-family-base);
}

.login-container {
  width: 100%;
  /* height: 100%; */
  max-width: 480px;
}

.login-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.login-form-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  height: 60px;
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #6b7280;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1.5rem 1rem 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: transparent;
}

.form-input:focus {
  outline: none;
  border-color: #F6871F;
  box-shadow: 0 0 0 3px rgba(246, 135, 31, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-label {
  position: absolute;
  left: 1rem;
  top: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  font-size: 1rem;
  transition: all 0.3s ease;
  pointer-events: none;
  transform-origin: left top;
  background-color: white;
  padding: 0 0.25rem;
}

/* Floating label animation */
.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-1.5rem) scale(0.85);
  color: #F6871F;
  font-weight: 600;
}

.form-input.error + .form-label {
  color: #ef4444;
}

.form-input:focus.error + .form-label {
  color: #ef4444;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  z-index: 10;
}

.toggle-password:hover {
  color: #6b7280;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-wrapper input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #F6871F;
  border-color: #F6871F;
}

.checkbox-wrapper input:checked ~ .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  color: #374151;
}

.forgot-password, .terms-link {
  color: #F6871F;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.forgot-password:hover, .terms-link:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  background-color: #F6871F;
  color: white;
  font-weight: 600;
  padding: 0.875rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #e67e22;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(246, 135, 31, 0.3);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.switch-mode {
  text-align: center;
  margin-bottom: 1.5rem;
}

.switch-mode p {
  color: #6b7280;
  margin: 0;
}

.switch-button {
  background: none;
  border: none;
  color: #F6871F;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.switch-button:hover {
  color: #e67e22;
}

.social-login {
  margin-top: 1.5rem;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 1.5rem;
}

.divider span {
  background-color: white;
  color: #9ca3af;
  padding: 0 1rem;
  font-size: 0.875rem;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-button:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.social-button.google:hover {
  border-color: #db4437;
  color: #db4437;
}

.social-button.facebook:hover {
  border-color: #4267b2;
  color: #4267b2;
}

.social-button i {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 640px) {
  .login-form-card {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .social-buttons {
    flex-direction: column;
  }
}
</style>