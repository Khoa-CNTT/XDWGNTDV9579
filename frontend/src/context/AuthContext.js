import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { verifyToken, logout } from "../services/authService";

const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          const result = await verifyToken();
          if (result.success && result.code === 200) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Lỗi khi xác thực token:", error);
        toast.error("Đã có lỗi xảy ra. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    toast.success("Đăng nhập thành công!");
  };

  const logout = async () => {
    try {
      const result = await logout();
      if (result.success && result.code === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        toast.success("Đăng xuất thành công!");
      } else {
        toast.error(result.message || "Đăng xuất thất bại!");
      }
    } catch (error) {
      toast.error("Đăng xuất thất bại!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};