import { authAPI } from '@/services/AuthAPI.js'

/**
 * Route guard để kiểm tra xác thực
 * Sử dụng trong router/index.js để bảo vệ các route cần đăng nhập
 */
export const requireAuth = (to, from, next) => {
  if (authAPI.isAuthenticated()) {
    // Người dùng đã đăng nhập, cho phép truy cập
    next()
  } else {
    // Chưa đăng nhập, chuyển hướng đến trang login với redirect
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

/**
 * Route guard cho trang login - nếu đã đăng nhập thì redirect về home
 */
export const requireGuest = (to, from, next) => {
  if (authAPI.isAuthenticated()) {
    // Đã đăng nhập, redirect về trang chủ
    next('/')
  } else {
    // Chưa đăng nhập, cho phép truy cập trang login
    next()
  }
}