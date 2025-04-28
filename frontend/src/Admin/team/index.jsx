import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputBase,
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountDetail,
  changeAccountStatus,
  getRoleDetail,
} from "./TeamApi";
import { useAdminAuth } from "../../context/AdminContext";
import Header from "../../components/Scenes/Header";
import api from "../../utils/api";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]); // Lưu toàn bộ tài khoản từ API
  const [roles, setRoles] = useState({});
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role_id: "",
    status: "active",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); // State để lưu URL tạm thời của ảnh

  // Reference for hidden file input
  const fileInputRef = React.useRef(null);

  // Lấy danh sách tài khoản và nhóm quyền
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await getAccounts(); // Không gửi tham số tìm kiếm
      const formattedData = Array.isArray(data)
        ? data.map((item, index) => ({
          ...item,
          id: item._id,
          stt: index + 1,
        }))
        : [];
      setAllAccounts(formattedData); // Lưu toàn bộ tài khoản
      setAccounts(formattedData); // Hiển thị ban đầu

      // Lấy thông tin nhóm quyền cho từng tài khoản
      const rolePromises = formattedData.map(async (account) => {
        if (account.role_id) {
          const roleData = await getRoleDetail(account.role_id);
          return { id: account.role_id, title: roleData.title || "N/A" };
        }
        return { id: account.role_id, title: "N/A" };
      });
      const roleResults = await Promise.all(rolePromises);
      const roleMap = roleResults.reduce((acc, role) => {
        acc[role.id] = role.title;
        return acc;
      }, {});
      setRoles(roleMap);

      if (formattedData.length === 0) {
        toast.info("Không có tài khoản nào để hiển thị!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải danh sách tài khoản!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách nhóm quyền để hiển thị trong dropdown
  const fetchRoleOptions = async () => {
    try {
      const response = await api.get("http://localhost:3000/api/v1/admin/roles");
      const roles = Array.isArray(response.data)
        ? response.data.map((role) => ({
          id: role._id,
          title: role.title,
        }))
        : [];
      setRoleOptions(roles);
    } catch (err) {
      toast.error("Không thể tải danh sách nhóm quyền!", { position: "top-right" });
    }
  };

  useEffect(() => {
    const token = adminToken || localStorage.getItem("adminToken");
    if (token) {
      fetchAccounts();
      fetchRoleOptions();
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      setTimeout(() => {
        window.location.href = "/loginadmin";
      }, 2000);
    }
  }, [adminToken]);

  // Xử lý tìm kiếm ở frontend (thời gian thực)
  useEffect(() => {
    const filteredAccounts = allAccounts.filter((account) =>
      account.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      account.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setAccounts(filteredAccounts);
  }, [searchText, allAccounts]);

  // Xử lý tìm kiếm thủ công khi nhấn nút
  const handleSearch = (e) => {
    e.preventDefault();
    const filteredAccounts = allAccounts.filter((account) =>
      account.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      account.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setAccounts(filteredAccounts);
  };

  // Mở modal thêm mới
  const handleOpen = () => {
    setIsEdit(false);
    setNewAccount({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role_id: "",
      status: "active",
      avatar: null,
    });
    setPreviewImage(null); // Reset preview image
    setError("");
    setOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (account) => {
    setIsEdit(true);
    setCurrentId(account._id);
    setNewAccount({
      fullName: account.fullName || "",
      email: account.email || "",
      password: "",
      confirmPassword: "",
      phone: account.phone || "",
      role_id: account.role_id || "",
      status: account.status || "active",
      avatar: null,
    });
    setPreviewImage(account.avatar || null); // Hiển thị ảnh hiện tại của tài khoản
    setError("");
    setOpen(true);
  };

  // Mở modal chi tiết
  const handleOpenDetail = async (account) => {
    setLoading(true);
    try {
      const data = await getAccountDetail(account._id);
      setCurrentAccount(data);
      setOpenDetail(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải chi tiết tài khoản!";
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    setPreviewImage(null); // Reset preview image khi đóng modal
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setCurrentAccount(null);
  };

  // Thêm tài khoản
  const handleAdd = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!newAccount.fullName) {
      setError("Vui lòng nhập họ tên!");
      return;
    }
    if (!newAccount.email || !/^\S+@\S+\.\S+$/.test(newAccount.email)) {
      setError("Vui lòng nhập email hợp lệ!");
      return;
    }
    if (!newAccount.password) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }
    if (!newAccount.confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu!");
      return;
    }
    if (newAccount.password !== newAccount.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!newAccount.role_id) {
      setError("Vui lòng chọn nhóm quyền!");
      return;
    }
    if (newAccount.phone && !/^\d{10,11}$/.test(newAccount.phone)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }
    if (newAccount.avatar && !(newAccount.avatar instanceof File)) {
      setError("Ảnh đại diện không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", newAccount.fullName);
      formData.append("email", newAccount.email);
      formData.append("password", newAccount.password);
      formData.append("confirmPassword", newAccount.confirmPassword);
      formData.append("phone", newAccount.phone || "");
      formData.append("role_id", newAccount.role_id);
      formData.append("status", newAccount.status || "active");
      if (newAccount.avatar) {
        formData.append("avatar", newAccount.avatar);
      }

      const response = await createAccount(formData, adminToken);
      if (response.code === 200) {
        const newAccountData = {
          ...response.data,
          id: response.data._id,
          stt: allAccounts.length + 1,
        };
        setAllAccounts([...allAccounts, newAccountData]);
        setAccounts([...accounts, newAccountData]);
        handleClose();
        toast.success("Thêm tài khoản thành công!", { position: "top-right" });
      } else {
        setError(response.message || "Thêm tài khoản thất bại!");
        toast.error(response.message || "Thêm tài khoản thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Thêm tài khoản thất bại!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật tài khoản
  const handleUpdate = async () => {
    if (!newAccount.fullName || !newAccount.email || !newAccount.role_id) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", newAccount.fullName);
      formData.append("email", newAccount.email);
      if (newAccount.password) {
        formData.append("password", newAccount.password);
      }
      formData.append("phone", newAccount.phone || "");
      formData.append("role_id", newAccount.role_id);
      formData.append("status", newAccount.status);
      if (newAccount.avatar) {
        formData.append("avatar", newAccount.avatar);
      }

      // Log formData để debug
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await updateAccount(currentId, formData);
      if (response.code === 200) {
        // Làm mới danh sách tài khoản bằng cách gọi lại fetchAccounts
        await fetchAccounts();
        handleClose();
        toast.success("Cập nhật tài khoản thành công!", { position: "top-right" });
      } else {
        setError(response.message || "Cập nhật tài khoản thất bại!");
        toast.error(response.message || "Cập nhật tài khoản thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Cập nhật tài khoản thất bại!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  // Xóa tài khoản
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      setLoading(true);
      try {
        const response = await deleteAccount(id);
        if (response.code === 200) {
          setAllAccounts(allAccounts.filter((acc) => acc._id !== id));
          setAccounts(accounts.filter((acc) => acc._id !== id));
          toast.success("Xóa tài khoản thành công!", { position: "top-right" });
        } else {
          toast.error(response.message || "Xóa tài khoản thất bại!", { position: "top-right" });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Xóa tài khoản thất bại!";
        toast.error(errorMessage, { position: "top-right" });
      } finally {
        setLoading(false);
      }
    }
  };

  // Thay đổi trạng thái tài khoản
  const handleChangeStatus = async (id, status) => {
    setLoading(true);
    try {
      const response = await changeAccountStatus(id, status);
      if (response.code === 200) {
        setAllAccounts(allAccounts.map((acc) =>
          acc._id === id ? { ...acc, status } : acc
        ));
        setAccounts(accounts.map((acc) =>
          acc._id === id ? { ...acc, status } : acc
        ));
        toast.success("Cập nhật trạng thái tài khoản thành công!", { position: "top-right" });
      } else {
        toast.error(response.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Cập nhật trạng thái thất bại!";
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "stt", headerName: "STT", flex: 0.3 },
    {
      field: "fullName",
      headerName: "Tên",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      flex: 1,
    },
    {
      field: "role_id",
      headerName: "Chức vụ",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          width="60%"
          mt="25px"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={colors.greenAccent[600]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {roles[row.role_id] || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          color={row.status === "active" ? "success" : "error"}
          onClick={() =>
            handleChangeStatus(row._id, row.status === "active" ? "inactive" : "active")
          }
        >
          {row.status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 2,
      renderCell: (params) => (
        <Box display="flex" gap={1} mt="25px">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpenDetail(params.row)}
          >
            Chi tiết
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.blueAccent[300],
              color: "white",
              "&:hover": {
                backgroundColor: colors.blueAccent[200],
              },
            }}
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEdit(params.row)}
          >
            Sửa
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row._id)}
          >
            Xóa
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
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

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
        <Box sx={{ gridColumn: 'span 12' }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold">
              Quản lý nhân viên
            </Typography>
            <Box display="flex" gap={2}>
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 300,
                  backgroundColor: colors.primary[400],
                }}
                onSubmit={handleSearch}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Tìm kiếm nhân viên (theo tên hoặc email)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={handleOpen}
              >
                Thêm mới nhân viên
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ gridColumn: 'span 12' }}>
          <Box
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
                width: "100%",
              },
              "& .MuiDataGrid-main": {
                width: "100%",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.blueAccent[700],
                borderBottom: "none",
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                color: colors.grey[100],
                fontWeight: "bold",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.blueAccent[700],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : accounts.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="h4" color={colors.grey[100]}>
                  Không có tài khoản nào để hiển thị
                </Typography>
              </Box>
            ) : (
              <DataGrid
                rows={accounts}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                getRowHeight={() => 80}
                sx={{
                  width: "100%",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal thêm mới/chỉnh sửa */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          {isEdit ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}
          {isEdit && (
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <img
                src={
                  previewImage ||
                  "/assets/default-avatar.png" // Thay bằng đường dẫn ảnh mặc định thực tế
                }
                alt="Avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${colors.grey[100]}`,
                }}
              />
              <Box mt={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => fileInputRef.current.click()}
                  sx={{ fontWeight: "bold" }}
                >
                  Chọn ảnh
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setNewAccount({ ...newAccount, avatar: file });
                    setPreviewImage(file ? URL.createObjectURL(file) : null);
                  }}
                />
              </Box>
            </Box>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Họ và tên"
            value={newAccount.fullName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, fullName: e.target.value })
            }
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={newAccount.email}
            onChange={(e) =>
              setNewAccount({ ...newAccount, email: e.target.value })
            }
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mật khẩu"
            type="password"
            value={newAccount.password}
            onChange={(e) =>
              setNewAccount({ ...newAccount, password: e.target.value })
            }
            required={!isEdit}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Xác nhận mật khẩu"
            type="password"
            value={newAccount.confirmPassword}
            onChange={(e) =>
              setNewAccount({ ...newAccount, confirmPassword: e.target.value })
            }
            required={!isEdit}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Số điện thoại"
            value={newAccount.phone}
            onChange={(e) =>
              setNewAccount({ ...newAccount, phone: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Nhóm quyền</InputLabel>
            <Select
              value={newAccount.role_id}
              onChange={(e) =>
                setNewAccount({ ...newAccount, role_id: e.target.value })
              }
              label="Nhóm quyền"
              required
            >
              {roleOptions.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newAccount.status}
              onChange={(e) =>
                setNewAccount({ ...newAccount, status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          {!isEdit && (
            <TextField
              fullWidth
              margin="normal"
              label="Ảnh đại diện"
              type="file"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => {
                const file = e.target.files[0];
                setNewAccount({ ...newAccount, avatar: file });
                setPreviewImage(file ? URL.createObjectURL(file) : null);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="error"
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Hủy
          </Button>
          <Button
            onClick={isEdit ? handleUpdate : handleAdd}
            color="success"
            variant="contained"
            sx={{ fontWeight: "bold" }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEdit ? (
              "Cập nhật"
            ) : (
              "Thêm mới"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chi tiết */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          Chi tiết tài khoản
        </DialogTitle>
        <DialogContent>
          {currentAccount ? (
            <Box display="flex" gap={3}>
              {/* Left: Avatar */}
              <Box ml="20px" mt="25px">
                <img
                  src={
                    currentAccount.avatar ||
                    "/assets/default-avatar.png" 
                  }
                  alt="Avatar"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${colors.grey[100]}`,
                  }}
                />
              </Box>
              {/* Right: Account Details */}
              <Box flex={1}>
                <Box ml={6} mt={1}>
                  <Typography component="span" fontWeight="bold">
                    Họ và tên:
                  </Typography>{" "}
                  <Typography component="span">{currentAccount.fullName || "N/A"}</Typography>
                </Box>
                <Box ml={6} mt={1}>
                  <Typography component="span" fontWeight="bold">
                    Email:
                  </Typography>{" "}
                  <Typography component="span">{currentAccount.email || "N/A"}</Typography>
                </Box>
                <Box ml={6} mt={1}>
                  <Typography component="span" fontWeight="bold">
                    Số điện thoại:
                  </Typography>{" "}
                  <Typography component="span">{currentAccount.phone || "N/A"}</Typography>
                </Box>
                <Box ml={6} mt={1}>
                  <Typography component="span" fontWeight="bold">
                    Chức vụ:
                  </Typography>{" "}
                  <Typography component="span">{roles[currentAccount.role_id] || "N/A"}</Typography>
                </Box>
                <Box ml={6} mt={1}>
                  <Typography component="span" fontWeight="bold">
                    Trạng thái:
                  </Typography>{" "}
                  <Typography component="span">
                    {currentAccount.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDetail}
            color="error"
            variant="contained"
            sx={{ fontWeight: "bold" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;