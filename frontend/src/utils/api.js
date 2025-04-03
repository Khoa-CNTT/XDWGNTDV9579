// src/utils/api.js
import Axios from "axios";

// Định nghĩa base URL cho API (thay đổi nếu cần)
const baseURL = "http://localhost:5000/api";

// Tạo instance của axios với base URL
const api = Axios.create({
  baseURL,
});

// Interceptor để thêm token vào header (nếu cần xác thực)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const pathsWithoutToken = ["/login", "/register", "/forgot-password"];

  // Chỉ thêm token vào header nếu token tồn tại và không phải các endpoint không cần xác thực
  if (token && !pathsWithoutToken.some((path) => config.url.includes(path))) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi toàn cục (tùy chọn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi chung, ví dụ: nếu nhận mã lỗi 401 (Unauthorized), đăng xuất người dùng
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default api;