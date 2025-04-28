import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Paper,
  CircularProgress,
  Typography,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getContacts,
  changeContactStatus,
  getContactDetail,
  deleteContact,
} from "./ContactsApi";
import { useAdminAuth } from "../../context/AdminContext";

const ContactsControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy danh sách khách hàng
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      const formattedData = Array.isArray(data)
        ? data.map((item, index) => ({
          ...item,
          id: item._id,
          stt: index + 1,
          createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
        }))
        : [];
      setAllContacts(formattedData);
      setContacts(formattedData);
      console.log("Contacts loaded:", formattedData);
      if (formattedData.length === 0) {
        toast.info("Không có khách hàng nào để hiển thị!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải danh sách khách hàng!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      console.error("Fetch contacts error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = adminToken || localStorage.getItem("adminToken");
    console.log("adminToken in ContactsControl:", token);
    if (token) {
      fetchContacts();
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      setTimeout(() => {
        window.location.href = "/loginadmin";
      }, 2000);
    }
  }, [adminToken]);

  // Xử lý tìm kiếm ở frontend (thời gian thực)
  useEffect(() => {
    const filteredContacts = allContacts.filter((contact) =>
      contact.fullName.toLowerCase().includes(searchText.toLowerCase())
    );
    setContacts(filteredContacts);
  }, [searchText, allContacts]);

  // Xử lý tìm kiếm thủ công khi nhấn nút
  const handleSearch = (e) => {
    e.preventDefault();
    const filteredContacts = allContacts.filter((contact) =>
      contact.fullName.toLowerCase().includes(searchText.toLowerCase())
    );
    setContacts(filteredContacts);
  };

  // Mở modal chi tiết
  const handleOpenDetail = async (contact) => {
    setLoading(true);
    try {
      const response = await getContactDetail(contact._id);
      if (response.code === 200) {
        setCurrentContact(response.data);
        setOpenDetail(true);
      } else {
        toast.error(response.message || "Không thể tải chi tiết khách hàng!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải chi tiết khách hàng!";
      toast.error(errorMessage, { position: "top-right" });
      console.error("Get contact detail error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setCurrentContact(null);
  };

  // Thay đổi trạng thái
  const handleChangeStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setLoading(true);
    try {
      const response = await changeContactStatus(id, newStatus);
      if (response.code === 200) {
        setAllContacts(allContacts.map(contact =>
          contact._id === id ? { ...contact, status: newStatus } : contact
        ));
        setContacts(contacts.map(contact =>
          contact._id === id ? { ...contact, status: newStatus } : contact
        ));
        toast.success(`Tài khoản đã được ${newStatus === "active" ? "kích hoạt" : "tạm ngưng"} thành công!`, { position: "top-right" });
      } else {
        toast.error(response.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Cập nhật trạng thái thất bại!";
      toast.error(errorMessage, { position: "top-right" });
      console.error("Change status error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Xóa khách hàng
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      setLoading(true);
      try {
        const response = await deleteContact(id);
        if (response.code === 200) {
          setAllContacts(allContacts.filter(contact => contact._id !== id));
          setContacts(contacts.filter(contact => contact._id !== id));
          toast.success("Xóa khách hàng thành công!", { position: "top-right" });
        } else {
          toast.error(response.message || "Xóa khách hàng thất bại!", { position: "top-right" });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Xóa khách hàng thất bại!";
        toast.error(errorMessage, { position: "top-right" });
        console.error("Delete contact error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { field: "stt", headerName: "STT", flex: 0.3 },
    { field: "fullName", headerName: "Tên", flex: 1, cellClassName: "name-column--cell" },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Số điện thoại", flex: 0.7 },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 0.7,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => handleChangeStatus(row._id, row.status)}
            sx={{
              backgroundColor: row.status === "active" ? "green" : "red",
              color: "white",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: row.status === "active" ? "darkgreen" : "darkred",
              },
            }}
          >
            {row.status === "active" ? "Hoạt động" : "Tạm ngưng"}
          </Button>
        </Box>
      ),
    },
    { field: "createdAt", headerName: "Ngày tạo", flex: 0.5 },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1} mt="25px">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpenDetail(row)}
          >
            Xem
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(row._id)}
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
              Quản lý liên hệ
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
                  placeholder="Tìm kiếm liên hệ (theo tên)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
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
            ) : (
              <DataGrid
                rows={contacts}
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

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          Chi tiết khách hàng
        </DialogTitle>
        <DialogContent>
          {currentContact ? (
            <Grid container spacing={8}>
              <Grid item xs={4} display="flex" justifyContent="center" alignItems="center">
                {currentContact.avatar ? (
                  <img
                    src={currentContact.avatar}
                    alt="Avatar"
                    style={{ width: "120px", height: "120px", borderRadius: "50%" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/120";
                    }}
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/120"
                    alt="Avatar Placeholder"
                    style={{ width: "120px", height: "120px", borderRadius: "50%" }}
                  />
                )}
              </Grid>

              <Grid item xs={8}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <strong>Họ tên: </strong> {currentContact.fullName || "N/A"}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <strong>Email: </strong> {currentContact.email || "N/A"}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <strong>Số điện thoại: </strong> {currentContact.phone || "N/A"}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <strong>Trạng thái: </strong> {currentContact.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <strong>Ngày tạo: </strong> {new Date(currentContact.createdAt).toLocaleDateString("vi-VN")}
                </Typography>
              </Grid>
            </Grid>
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

export default ContactsControl;