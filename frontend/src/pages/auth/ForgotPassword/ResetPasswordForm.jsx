// src/pages/Auth/ResetPassword/ResetPasswordForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOtp, resetPassword } from "../../../services/authService";
import "./resetPassword.css"; // Tạo file CSS tương tự forgotPassword.css

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy email từ query parameter
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) setEmail(decodeURIComponent(emailFromQuery));
  }, [location]);

  const validateField = (field, value) => {
    let newErrors = { ...errors };
    if (field === "otp") {
      if (!value.trim()) newErrors.otp = "OTP không được để trống";
      else if (value.length !== 6) newErrors.otp = "OTP phải có 6 chữ số";
      else delete newErrors.otp;
    }
    if (field === "password") {
      if (!value.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (value.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      else delete newErrors.password;
    }
    if (field === "confirmPassword") {
      if (!value.trim()) newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống";
      else if (value !== password) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      else delete newErrors.confirmPassword;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setTouched({ ...touched, [field]: true });
    if (field === "otp") setOtp(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    validateField(field, value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP không được để trống";
    else if (otp.length !== 6) newErrors.otp = "OTP phải có 6 chữ số";
    if (!token) {
      if (!password.trim()) newErrors.password = "Mật khẩu không được để trống";
      else if (password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      if (!confirmPassword.trim()) newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống";
      else if (confirmPassword !== password) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        // Bước 1: Xác thực OTP
        const otpResult = await verifyOtp(email, otp);
        toast.success(otpResult.message || "Xác thực OTP thành công!");
        setToken(otpResult.token); // Lưu token để dùng cho bước reset
      } else {
        // Bước 2: Đặt lại mật khẩu
        const resetResult = await resetPassword(token, password);
        toast.success(resetResult.message || "Đặt lại mật khẩu thành công!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      const errorMessage = error.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reset-password-form">
      <div className={`input-group ${errors.email ? "input-error" : ""}`}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          disabled={true} // Email không thay đổi được
        />
      </div>

      <div className={`input-group ${errors.otp ? "input-error" : ""}`}>
        <label>Mã OTP:</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => handleInputChange("otp", e.target.value)}
          onBlur={() => setTouched({ ...touched, otp: true })}
          placeholder="Nhập mã OTP 6 chữ số"
          disabled={loading || token}
        />
        <div className="error-container">
          {touched.otp && errors.otp && (
            <p className="error-message">{errors.otp}</p>
          )}
        </div>
      </div>

      {token && (
        <>
          <div className={`input-group ${errors.password ? "input-error" : ""}`}>
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
            <div className="error-container">
              {touched.password && errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>
          </div>

          <div className={`input-group ${errors.confirmPassword ? "input-error" : ""}`}>
            <label>Xác nhận mật khẩu:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              placeholder="Xác nhận mật khẩu mới"
              disabled={loading}
            />
            <div className="error-container">
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        className="reset-password-button"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : token ? "Đặt lại mật khẩu" : "Xác thực OTP"}
      </button>

      <div className="reset-password-links">
        <p onClick={() => navigate("/login")}>
          Quay lại <span>Đăng nhập</span>
        </p>
      </div>
    </form>
  );
};

export default ResetPasswordForm;