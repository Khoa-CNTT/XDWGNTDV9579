import Axios from "axios";

// Định nghĩa base URL cho API
const baseURL = "http://localhost:3000/api/v1"; // Cập nhật port và prefix đúng với backend

// Tạo instance của axios với base URL
const api = Axios.create({
  baseURL,
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const pathsWithoutToken = ["/users/login", "/users/register", "/users/password/forgot"];

  // Chỉ thêm token vào header nếu token tồn tại và không phải các endpoint không cần xác thực
  if (token && !pathsWithoutToken.some((path) => config.url.includes(path))) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi toàn cục
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cartId");
      window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default api;