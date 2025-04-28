import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputBase,
  Paper,
  MenuItem,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  getInvoices,
  changeInvoiceStatus,
  getInvoiceDetail,
  deleteInvoice,
} from "./InvoicesApi";
import { useAdminAuth } from "../../context/AdminContext";
import PrintIcon from '@mui/icons-material/Print';

const InvoicesControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      console.log("Raw data from API:", data);

      const formattedData = Array.isArray(data)
        ? data.map((item, index) => ({
          ...item,
          id: item._id,
          stt: index + 1,
          orderCode: item.orderCode || "N/A",
          customerName: item.userInfor?.fullName || "N/A",
          customerPhone: item.userInfor?.phone || "N/A",
          totalPrice: item.totalPrice || 0,
          createdAt: item.createdAt, // Giữ nguyên định dạng ngày tháng
        }))
        : [];

      setAllInvoices(formattedData);
      setInvoices(formattedData);
      console.log("Formatted invoices:", formattedData);

      if (formattedData.length === 0) {
        toast.info("Không có hóa đơn nào để hiển thị!", { position: "top-right" });
      }
    } catch (err) {
      console.error("Error in fetchInvoices:", err);
      const errorMessage = err.message || "Không thể tải danh sách hóa đơn!";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = adminToken || localStorage.getItem("adminToken");
    console.log("adminToken in InvoicesControl:", token);
    if (token) {
      fetchInvoices();
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      setTimeout(() => {
        window.location.href = "/loginadmin";
      }, 2000);
    }
  }, [adminToken]);

  // Xử lý tìm kiếm theo mã hóa đơn (realtime)
  useEffect(() => {
    if (searchText) {
      const filteredInvoices = allInvoices.filter((invoice) => {
        // Kiểm tra xem invoice.orderCode có tồn tại không
        if (!invoice.orderCode) return false;
        return invoice.orderCode.toLowerCase().includes(searchText.toLowerCase());
      });
      setInvoices(filteredInvoices);
    } else {
      setInvoices(allInvoices);
    }
  }, [searchText, allInvoices]);

  // Xử lý tìm kiếm theo ngày
  const handleDateSearch = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Kiểm tra nếu ngày bắt đầu lớn hơn ngày kết thúc
      if (start > end) {
        toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!", { position: "top-right" });
        return;
      }

      end.setHours(23, 59, 59, 999);

      const filteredInvoices = allInvoices.filter((invoice) => {
        if (!invoice.createdAt) return false;
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= start && invoiceDate <= end;
      });

      if (filteredInvoices.length === 0) {
        toast.info("Không tìm thấy hóa đơn trong khoảng thời gian này!", { position: "top-right" });
      }
      setInvoices(filteredInvoices);
    } else {
      toast.warning("Vui lòng chọn khoảng thời gian!", { position: "top-right" });
    }
  };

  // Reset tìm kiếm theo ngày
  const handleResetDateSearch = () => {
    setStartDate("");
    setEndDate("");
    setInvoices(allInvoices);
    toast.success("Đã reset tìm kiếm theo ngày!");
  };

  // Mở modal chi tiết
  const handleOpenDetail = async (invoice) => {
    setLoading(true);
    try {
      const response = await getInvoiceDetail(invoice._id);
      if (response.code === 200) {
        setCurrentInvoice(response.data);
        setOpenDetail(true);
      } else {
        toast.error(response.message || "Không thể tải chi tiết hóa đơn!", { position: "top-right" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải chi tiết hóa đơn!";
      toast.error(errorMessage, { position: "top-right" });
      console.error("Get invoice detail error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setCurrentInvoice(null);
  };

  // Thay đổi trạng thái
  const handleChangeStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const response = await changeInvoiceStatus(id, newStatus);
      if (response.code === 200) {
        fetchInvoices();
        toast.success("Cập nhật trạng thái thành công!", { position: "top-right" });
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

  // Xóa hóa đơn
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) {
      setLoading(true);
      try {
        const response = await deleteInvoice(id);
        if (response.code === 200) {
          fetchInvoices();
          toast.success("Xóa hóa đơn thành công!", { position: "top-right" });
        } else {
          toast.error(response.message || "Xóa hóa đơn thất bại!", { position: "top-right" });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Xóa hóa đơn thất bại!";
        toast.error(errorMessage, { position: "top-right" });
        console.error("Delete invoice error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  // Hàm xử lý in hóa đơn
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('invoice-detail').innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn tour Gotravel</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .no-print {
                display: none;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              .total-price {
                text-align: right;
                font-weight: bold;
                margin-top: 20px;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const columns = [
    { field: "stt", headerName: "STT", flex: 0.3 },
    { field: "orderCode", headerName: "Mã hóa đơn", flex: 0.5 },
    { field: "customerName", headerName: "Khách hàng", flex: 1 },
    { field: "customerPhone", headerName: "Số điện thoại", flex: 0.7 },
    {
      field: "totalPrice",
      headerName: "Tổng giá (VNĐ)",
      flex: 0.7,
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          height="100%"
        >
          <Typography color={colors.grey[100]}>
            {params.value.toLocaleString("vi-VN")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 0.7,
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          height="100%"
        >
          <TextField
            select
            value={params.value}
            onChange={(e) => handleChangeStatus(params.row._id, e.target.value)}
            size="small"
            sx={{ width: "120px" }}
          >
            <MenuItem value="pending">Chờ xử lý</MenuItem>
            <MenuItem value="confirmed">Đã xác nhận</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
          </TextField>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Box
            display="flex"
            alignItems="center"
            height="100%"
          >
            {date.toLocaleDateString("vi-VN")}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1,
      renderCell: (params) => (
        <Box
          display="flex"
          gap={1}
          alignItems="center"
          height="100%"
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpenDetail(params.row)}
          >
            Xem
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
        {/* Tiêu đề */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mb={2}>
            Quản lý hóa đơn
          </Typography>
        </Box>

        {/* Phần tìm kiếm */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box display="flex" gap={2}>
              {/* Tìm kiếm theo mã hóa đơn */}
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 300,
                  backgroundColor: colors.primary[400],
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Tìm kiếm hóa đơn (theo mã)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <IconButton sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
              </Paper>

              {/* Tìm kiếm theo ngày */}
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: 150,
                    backgroundColor: colors.primary[400],
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                  }}
                />
                <Typography>đến</Typography>
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: 150,
                    backgroundColor: colors.primary[400],
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDateSearch}
                  sx={{
                    ml: 1,
                    backgroundColor: colors.blueAccent[400],
                    '&:hover': {
                      backgroundColor: colors.blueAccent[300],
                    },
                  }}
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleResetDateSearch}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bảng dữ liệu */}
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
            ) : invoices.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="h4" color={colors.grey[100]}>
                  Không có hóa đơn nào để hiển thị
                </Typography>
              </Box>
            ) : (
              <DataGrid
                rows={invoices}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                getRowHeight={() => 60}
                // autoHeight
                sx={{
                  width: "100%",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '600px',
            width: '100%'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textAlign: "center",
          }}
        >
          Chi tiết hóa đơn
        </DialogTitle>
        <DialogContent>
          {currentInvoice ? (
            <Box id="invoice-detail">
              <Typography variant="h4" color={colors.grey[100]} mb={2}>
                Mã hóa đơn: {currentInvoice.order?.orderCode}
              </Typography>
              <Typography variant="h5" color={colors.grey[100]} mb={1}>
                Thông tin khách hàng
              </Typography>
              <Box mb={2}>
                <Typography>Họ tên: {currentInvoice.order?.userInfor?.fullName || "N/A"}</Typography>
                <Typography>Số điện thoại: {currentInvoice.order?.userInfor?.phone || "N/A"}</Typography>
                <Typography>Ghi chú: {currentInvoice.order?.userInfor?.note || "Không có"}</Typography>
              </Box>
              <Typography variant="h5" color={colors.grey[100]} mb={1}>
                Danh sách tour
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="40%">Tiêu đề</TableCell>
                      <TableCell width="20%" align="center">Số lượng</TableCell>
                      <TableCell width="40%" align="right">Giá (VNĐ)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentInvoice.tours.map((tour, index) => (
                      <TableRow key={index}>
                        <TableCell>{tour.tourInfo?.title || "N/A"}</TableCell>
                        <TableCell align="center">{tour.quantity}</TableCell>
                        <TableCell align="right">{tour.priceNew.toLocaleString("vi-VN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Chỉ hiển thị danh sách khách sạn nếu có dữ liệu */}
              {currentInvoice.hotels && currentInvoice.hotels.length > 0 && (
                <>
                  <Typography variant="h5" color={colors.grey[100]} mb={1}>
                    Danh sách khách sạn
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width="35%">Tên khách sạn</TableCell>
                          <TableCell width="25%">Phòng</TableCell>
                          <TableCell width="20%" align="center">Số lượng</TableCell>
                          <TableCell width="20%" align="right">Giá (VNĐ)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentInvoice.hotels.map((hotel, index) => (
                          hotel.rooms.map((room, roomIndex) => (
                            <TableRow key={`${index}-${roomIndex}`}>
                              <TableCell>{hotel.hotelInfo?.name || "N/A"}</TableCell>
                              <TableCell>{room.roomInfo?.name || "N/A"}</TableCell>
                              <TableCell align="center">{room.quantity}</TableCell>
                              <TableCell align="right">{room.price.toLocaleString("vi-VN")}</TableCell>
                            </TableRow>
                          ))
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              <Typography
                variant="h5"
                sx={{
                  mt: 2,
                  textAlign: "right",
                  fontWeight: "bold",
                  color: colors.grey[100]
                }}
              >
                Tổng giá: {currentInvoice.order?.totalPrice.toLocaleString("vi-VN")} VNĐ
              </Typography>
            </Box>
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            variant="contained"
            color="primary"
          >
            In hóa đơn
          </Button>
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

export default InvoicesControl;