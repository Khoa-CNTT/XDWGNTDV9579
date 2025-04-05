import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/users";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

const handleError = (error) => {
  if (error.response) {
    const message = error.response.data.message || "Đã có lỗi xảy ra";
    return { success: false, code: error.response.data.code || 500, message };
  } else if (error.request) {
    return {
      success: false,
      code: 503,
      message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!",
    };
  } else {
    return {
      success: false,
      code: 500,
      message: error.message || "Đã có lỗi xảy ra",
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/register", userData);
    return { success: true, ...response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);
    return { success: true, ...response.data };
  } catch (error) {
    console.log("Chi tiết lỗi:", error);
    return handleError(error);
  }
};

export const logout = async () => {
  try {
    const response = await api.get("/logout");
    return { success: true, ...response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/forgot-password", { email });
    return { success: true, ...response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get("/verify-token");
    return { success: true, ...response.data };
  } catch (error) {
    return handleError(error);
  }
};
