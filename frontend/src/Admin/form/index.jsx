import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  useTheme,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from "@mui/material";
import { tokens } from "../../theme";
import { useAdminAuth } from "../../context/AdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAdminInfo, updateAdminInfo } from "./FormApi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Form = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const [adminInfo, setAdminInfo] = useState({
    _id: "",
    fullName: "",
    email: "",
    phone: "",
    avatar: "../../assets/user.png",
  });
  const [newAvatar, setNewAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy thông tin admin từ backend khi component mount
  useEffect(() => {
    const fetchAdminInfo = async () => {
      const storedAdminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      console.log("Stored adminInfo:", JSON.stringify(storedAdminInfo, null, 2));

      const initialInfo = {
        _id: storedAdminInfo._id || "",
        fullName: storedAdminInfo.fullName || "",
        email: storedAdminInfo.email || "",
        phone: storedAdminInfo.phone || "",
        avatar: storedAdminInfo.avatar || "../../assets/user.png",
      };
      setAdminInfo(initialInfo);

      if (!adminToken) {
        toast.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!storedAdminInfo._id) {
        toast.error("Không tìm thấy ID tài khoản! Vui lòng đăng nhập lại.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      setLoading(true);
      try {
        const response = await getAdminInfo(storedAdminInfo._id);
        console.log("Fetch admin info response:", JSON.stringify(response, null, 2));
        if (response.code === 200 && response.data) {
          const data = response.data;
          const updatedInfo = {
            _id: data._id || storedAdminInfo._id,
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar || "../../assets/user.png",
          };
          setAdminInfo(updatedInfo);
          localStorage.setItem("adminInfo", JSON.stringify(updatedInfo));
        } else {
          toast.error(response.message || "Không thể tải thông tin tài khoản!", {
            position: "top-right",
          });
        }
      } catch (err) {
        const errorMessage = err.message || "Không thể tải thông tin tài khoản!";
        toast.error(errorMessage, { position: "top-right" });
        if (err.response?.status === 401) {
          toast.error("Phiên đăng nhập không hợp lệ! Vui lòng đăng nhập lại.", {
            position: "top-right",
          });
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else if (err.response?.status === 400 && errorMessage.includes("quyền")) {
          toast.error("Vui lòng liên hệ quản trị viên để cấp quyền account_view!", {
            position: "top-right",
          });
        } else if (errorMessage.includes("Không tìm thấy tài khoản")) {
          toast.error("Tài khoản không tồn tại! Vui lòng kiểm tra ID tài khoản.", {
            position: "top-right",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, [adminToken]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else {
      setAdminInfo({ ...adminInfo, [name]: value });
    }
  };

  // Xử lý khi chọn file ảnh mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File ảnh không được lớn hơn 5MB!", {
          position: "top-right",
        });
        return;
      }
      console.log("Selected file:", file);
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminInfo({ ...adminInfo, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý bật/tắt hiển thị mật khẩu
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Xử lý lưu thay đổi
  const handleSave = async () => {
    if (!adminInfo._id) {
      toast.error("Không tìm thấy ID tài khoản! Vui lòng đăng nhập lại.", {
        position: "top-right",
      });
      return;
    }

    // Kiểm tra xem có thay đổi nào không
    const storedAdminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
    const hasChanges =
      newAvatar ||
      adminInfo.fullName !== (storedAdminInfo.fullName || "") ||
      adminInfo.email !== (storedAdminInfo.email || "") ||
      adminInfo.phone !== (storedAdminInfo.phone || "") ||
      password !== "";

    if (!hasChanges) {
      toast.info("Không có thay đổi để lưu!", { position: "top-right" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (newAvatar) {
        formData.append("avatar", newAvatar);
      }
      formData.append("fullName", adminInfo.fullName);
      formData.append("email", adminInfo.email);
      formData.append("phone", adminInfo.phone);
      if (password) {
        formData.append("password", password);
      }
      console.log("FormData entries:", [...formData.entries()]);

      const response = await updateAdminInfo(adminInfo._id, formData);
      if (response.code === 200) {
        const updatedResponse = await getAdminInfo(adminInfo._id);
        if (updatedResponse.code === 200 && updatedResponse.data) {
          const updatedInfo = {
            _id: updatedResponse.data._id,
            fullName: updatedResponse.data.fullName || "",
            email: updatedResponse.data.email || "",
            phone: updatedResponse.data.phone || "",
            avatar: updatedResponse.data.avatar || adminInfo.avatar,
          };
          setAdminInfo(updatedInfo);
          localStorage.setItem("adminInfo", JSON.stringify(updatedInfo));
          setPassword(""); // Xóa mật khẩu sau khi lưu
          toast.success("Cập nhật thông tin thành công!", {
            position: "top-right",
          });
          setNewAvatar(null);
        } else {
          toast.error("Không thể làm mới thông tin tài khoản sau khi cập nhật!", {
            position: "top-right",
          });
        }
      } else {
        toast.error(response.message || "Cập nhật thông tin thất bại!", {
          position: "top-right",
        });
      }
    } catch (err) {
      const errorMessage = err.message || "Cập nhật thông tin thất bại!";
      toast.error(errorMessage, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập không hợp lệ! Vui lòng đăng nhập lại.", {
          position: "top-right",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (errorMessage.includes("quyền")) {
        toast.error("Vui lòng liên hệ quản trị viên để cấp quyền account_edit!", {
          position: "top-right",
        });
      } else if (errorMessage.includes("Email đã tồn tại")) {
        toast.error("Email đã được sử dụng! Vui lòng chọn email khác.", {
          position: "top-right",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ margin: '40px' }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      <Card sx={{ backgroundColor: colors.primary[400] }}>
        <CardHeader
          title={
            <Typography variant="h4" color={colors.grey[100]}>
              Cài đặt tài khoản
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              {/* Hiển thị avatar */}
              <Avatar
                src={adminInfo.avatar}
                alt="Admin Avatar"
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
                disabled={loading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="contained"
                  component="span"
                  color="primary"
                  disabled={loading}
                >
                  Thay đổi Avatar
                </Button>
              </label>

              {/* Hiển thị và chỉnh sửa thông tin admin */}
              <Box mt={3} width="50%">
                <TextField
                  fullWidth
                  margin="normal"
                  label="Họ và tên"
                  name="fullName"
                  value={adminInfo.fullName || ""}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  value={adminInfo.email || ""}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Số điện thoại"
                  name="phone"
                  value={adminInfo.phone || ""}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mật khẩu mới"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  variant="outlined"
                  onChange={handleInputChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Nút lưu thay đổi */}
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 3, fontWeight: "bold" }}
                onClick={handleSave}
                disabled={loading}
              >
                Lưu thay đổi
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Form;