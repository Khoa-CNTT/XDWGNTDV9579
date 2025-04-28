import Axios from "axios";
import { toast } from "react-toastify";

// Định nghĩa base URL cho API
const baseURL = "http://localhost:3000/api/v1";

// Tạo instance của axios với base URL
const api = Axios.create({
  baseURL,
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(config.url.includes("/admin") ? "adminToken" : "token");
  const pathsWithoutToken = [
    "/users/login",
    "/users/register",
    "/users/password/forgot",
    "/admin/accounts/login",
  ];

  if (token && !pathsWithoutToken.some((path) => config.url.includes(path))) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi toàn cục
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || "Lỗi không xác định";
    if (error.response?.status === 401) {
      // Chỉ chuyển hướng khi rõ ràng là lỗi 401 (phiên hết hạn)
      if (error.config.url.includes("/admin")) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        window.location.href = "/loginadmin";
      } else {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cartId");
        window.location.href = "/login";
      }
    } else {
      // Hiển thị lỗi khác (bao gồm 400) mà không chuyển hướng
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default api;