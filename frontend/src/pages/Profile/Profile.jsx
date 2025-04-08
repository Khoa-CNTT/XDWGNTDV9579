import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "./profile.css";

const Profile = () => {
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Hồ sơ - GoTravel";
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (giới hạn 3MB)
      if (file.size > 2 * 1024 * 1024* 1204) {
        toast.error("Ảnh đại diện không được vượt quá 3MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Kiểm tra kích thước chuỗi base64 của avatar (giới hạn khoảng 2.5MB)
    if (formData.avatar && formData.avatar.length > 2.5 * 1024 * 1024) {
      toast.error("Dữ liệu ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.patch("/users/edit", formData);
      if (response.data.code === 200) {
        const updatedUser = response.data.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        login(updatedUser, localStorage.getItem("token"), localStorage.getItem("cartId"));
        toast.success("Cập nhật hồ sơ thành công!");
        setEditMode(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      if (error.response?.status === 413) {
        toast.error("Dữ liệu gửi lên quá lớn! Vui lòng chọn ảnh nhỏ hơn.");
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs title="Hồ sơ cá nhân" pagename="Hồ sơ" />
      <div className="profile-container">
        <h1>Hồ sơ cá nhân</h1>
        <div className="profile-content">
          {!editMode ? (
            <div className="profile-view">
              <img
                src={
                  formData.avatar ||
                  "https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/Hinh-dai-dien-hai-huoc-cam-dep-duoi-ai-do.jpg?1704789789335"
                }
                alt="Avatar"
                className="profile-avatar"
              />
              <div className="profile-info">
                <p>
                  <strong>Họ tên:</strong> {formData.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {formData.phone || "Chưa cập nhật"}
                </p>
                <p>
                  <strong>Ngày tham gia:</strong>{" "}
                  {new Date(user?.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Chỉnh sửa
              </button>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Ảnh đại diện (tối đa 3MB):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
                {formData.avatar && (
                  <img src={formData.avatar} alt="Preview" className="avatar-preview" />
                )}
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;