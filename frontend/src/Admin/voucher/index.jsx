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
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getVoucherDetail,
    toggleVoucherStatus,
} from "./VoucherApi";
import { useAdminAuth } from "../../context/AdminContext";

const VoucherControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const [vouchers, setVouchers] = useState([]);
    const [allVouchers, setAllVouchers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // State cho modal xóa
    const [deleteVoucherId, setDeleteVoucherId] = useState(null); // Lưu ID voucher cần xóa
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [currentVoucher, setCurrentVoucher] = useState(null);
    const [newVoucher, setNewVoucher] = useState({
        title: "",
        code: "",
        description: "",
        quantity: "",
        discount: "",
        startDate: "",
        endDate: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Lấy danh sách voucher
    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const data = await getVouchers();
            const formattedData = Array.isArray(data)
                ? data.map((item, index) => ({
                    ...item,
                    id: item._id,
                    stt: index + 1,
                    status: new Date(item.endDate) < new Date() ? "expired" : (item.status || "active"),
                    endDate: item.endDate,
                    formattedEndDate: new Date(item.endDate).toLocaleString("vi-VN"),
                }))
                : [];
            setAllVouchers(formattedData);
            setVouchers(formattedData);
            console.log("Vouchers loaded:", formattedData);
            if (formattedData.length === 0) {
                toast.info("Không có voucher nào để hiển thị!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách voucher!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Fetch vouchers error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        console.log("adminToken in VoucherControl:", token);
        if (token) {
            fetchVouchers();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                window.location.href = "/loginadmin";
            }, 2000);
        }
    }, [adminToken]);

    // Xử lý tìm kiếm ở frontend (thời gian thực)
    useEffect(() => {
        const filteredVouchers = allVouchers.filter((voucher) =>
            voucher.title.toLowerCase().includes(searchText.toLowerCase())
        );
        setVouchers(filteredVouchers);
    }, [searchText, allVouchers]);

    // Xử lý tìm kiếm thủ công khi nhấn nút
    const handleSearch = (e) => {
        e.preventDefault();
        const filteredVouchers = allVouchers.filter((voucher) =>
            voucher.title.toLowerCase().includes(searchText.toLowerCase())
        );
        setVouchers(filteredVouchers);
    };

    // Mở modal thêm mới
    const handleOpen = () => {
        setIsEdit(false);
        setNewVoucher({
            title: "",
            code: "",
            description: "",
            quantity: "",
            discount: "",
            startDate: "",
            endDate: "",
        });
        setError("");
        setOpen(true);
    };

    // Mở modal chỉnh sửa
    const handleEdit = (voucher) => {
        console.log("Editing voucher:", voucher);
        setIsEdit(true);
        setCurrentId(voucher._id);
        const formatDate = (date) => {
            if (!date) {
                console.warn(`Date is undefined or null: ${date}`);
                return "";
            }
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                console.warn(`Invalid date value: ${date}`);
                return "";
            }
            return parsedDate.toISOString().split("T")[0];
        };
        setNewVoucher({
            title: voucher.title || "",
            code: voucher.code || "",
            description: voucher.description || "",
            quantity: voucher.quantity || "",
            discount: voucher.discount || "",
            startDate: formatDate(voucher.startDate),
            endDate: formatDate(voucher.endDate),
        });
        setError("");
        setOpen(true);
    };

    // Mở modal chi tiết
    const handleOpenDetail = async (voucher) => {
        setLoading(true);
        try {
            const response = await getVoucherDetail(voucher._id);
            if (response.code === 200) {
                setCurrentVoucher(response.data);
                setOpenDetail(true);
            } else {
                toast.error(response.message || "Không thể tải chi tiết voucher!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải chi tiết voucher!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Get voucher detail error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setError("");
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setCurrentVoucher(null);
    };

    // Mở modal xác nhận xóa
    const handleOpenDeleteConfirm = (id) => {
        setDeleteVoucherId(id);
        setOpenDeleteConfirm(true);
    };

    // Đóng modal xác nhận xóa
    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
        setDeleteVoucherId(null);
    };

    // Thêm voucher
    const handleAdd = async () => {
        if (
            !newVoucher.title ||
            !newVoucher.code ||
            !newVoucher.description ||
            !newVoucher.quantity ||
            !newVoucher.discount ||
            !newVoucher.startDate ||
            !newVoucher.endDate
        ) {
            setError("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setLoading(true);
        try {
            const response = await createVoucher(newVoucher);
            if (response.code === 200) {
                fetchVouchers();
                handleClose();
                toast.success("Thêm voucher thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Thêm voucher thất bại!");
                toast.error(response.message || "Thêm voucher thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.errors?.join(", ") ||
                err.response?.data?.message ||
                "Thêm voucher thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Add voucher error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật voucher
    const handleUpdate = async () => {
        if (
            !newVoucher.title ||
            !newVoucher.code ||
            !newVoucher.description ||
            !newVoucher.quantity ||
            !newVoucher.discount ||
            !newVoucher.startDate ||
            !newVoucher.endDate
        ) {
            setError("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setLoading(true);
        try {
            const response = await updateVoucher(currentId, newVoucher);
            if (response.code === 200) {
                fetchVouchers();
                handleClose();
                toast.success("Cập nhật voucher thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Cập nhật voucher thất bại!");
                toast.error(response.message || "Cập nhật voucher thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.errors?.join(", ") ||
                err.response?.data?.message ||
                "Cập nhật voucher thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Update voucher error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xác nhận xóa voucher
    const handleConfirmDelete = async () => {
        if (!deleteVoucherId) return;
        setLoading(true);
        try {
            const response = await deleteVoucher(deleteVoucherId);
            if (response.code === 200) {
                fetchVouchers();
                toast.success("Xóa voucher thành công!", { position: "top-right" });
            } else {
                toast.error(response.message || "Xóa voucher thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Xóa voucher thất bại!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Delete voucher error:", err.response?.data);
        } finally {
            setLoading(false);
            handleCloseDeleteConfirm();
        }
    };

    // Chuyển đổi trạng thái voucher (giả lập cục bộ vì API không tồn tại)
    const handleToggleStatus = async (id, currentStatus) => {
        if (currentStatus === "expired") {
            toast.error("Không thể thay đổi trạng thái của voucher đã hết hạn!", { position: "top-right" });
            return;
        }
        setLoading(true);
        try {
            // Giả lập thay đổi trạng thái cục bộ
            const newStatus = currentStatus === "active" ? "paused" : "active";
            setVouchers((prev) =>
                prev.map((voucher) =>
                    voucher._id === id ? { ...voucher, status: newStatus } : voucher
                )
            );
            setAllVouchers((prev) =>
                prev.map((voucher) =>
                    voucher._id === id ? { ...voucher, status: newStatus } : voucher
                )
            );
            toast.success(
                `Thay đổi trạng thái thành ${newStatus === "active" ? "Hoạt động" : "Tạm ngưng"}!`,
                { position: "top-right" }
            );
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Thay đổi trạng thái thất bại!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Toggle status error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: "stt", headerName: "STT", flex: 0.3 },
        { field: "code", headerName: "Mã voucher", flex: 0.7 },
        { field: "title", headerName: "Tiêu đề", flex: 1 },
        { field: "discount", headerName: "% Giảm giá", flex: 0.5 },
        { field: "quantity", headerName: "Số lượng", flex: 0.5 },
        { field: "formattedEndDate", headerName: "Thời gian hết hạn", flex: 1 },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 1,
            renderCell: (params) => {
                const status = params.value;
                let displayText, bgColor, hoverColor;
                if (status === "expired") {
                    displayText = "Đã hết hạn";
                    bgColor = "red";
                    hoverColor = "darkred";
                } else if (status === "paused") {
                    displayText = "Tạm ngưng";
                    bgColor = "orange";
                    hoverColor = "darkorange";
                } else {
                    displayText = "Hoạt động";
                    bgColor = "green";
                    hoverColor = "darkgreen";
                }

                return (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: bgColor,
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: hoverColor,
                            },
                        }}
                        onClick={() => handleToggleStatus(params.row._id, status)}
                        disabled={status === "expired" || loading}
                    >
                        {displayText}
                    </Button>
                );
            },
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
                        Xem
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
                        onClick={() => handleOpenDeleteConfirm(params.row._id)}
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
                            Quản lý voucher
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
                                    placeholder="Tìm kiếm voucher (theo mã)"
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
                                Thêm mới voucher
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
                        ) : (
                            <DataGrid
                                rows={vouchers}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                disableSelectionOnClick
                                getRowHeight={() => 80}
                                // autoHeight
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
                    {isEdit ? "Chỉnh sửa voucher" : "Thêm mới voucher"}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Typography color="error" mb={2}>
                            {error}
                        </Typography>
                    )}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Tiêu đề"
                        value={newVoucher.title}
                        onChange={(e) => setNewVoucher({ ...newVoucher, title: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mã voucher"
                        value={newVoucher.code}
                        onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mô tả"
                        multiline
                        rows={3}
                        value={newVoucher.description}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, description: e.target.value })
                        }
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Số lượng"
                        type="number"
                        value={newVoucher.quantity}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, quantity: e.target.value })
                        }
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="% Giảm giá"
                        type="number"
                        value={newVoucher.discount}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, discount: e.target.value })
                        }
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ngày bắt đầu"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={newVoucher.startDate}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, startDate: e.target.value })
                        }
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ngày hết hạn"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={newVoucher.endDate}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, endDate: e.target.value })
                        }
                        required
                    />
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
                    Chi tiết voucher
                </DialogTitle>
                <DialogContent>
                    {currentVoucher ? (
                        <Box color={colors.grey[100]} mb={1}>
                            <Typography variant="h6">
                                <strong>Tiêu đề:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentVoucher.title || "N/A"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Mã voucher:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentVoucher.code || "N/A"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Mô tả:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentVoucher.description || "N/A"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Số lượng:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentVoucher.quantity || 0}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>% Giảm giá:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentVoucher.discount || 0}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Ngày bắt đầu:</strong>
                                <span style={{ marginLeft: "8px" }}>
                                    {currentVoucher.startDate
                                        ? new Date(currentVoucher.startDate).toLocaleDateString("vi-VN")
                                        : "N/A"}
                                </span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Ngày hết hạn:</strong>
                                <span style={{ marginLeft: "8px" }}>
                                    {currentVoucher.endDate
                                        ? new Date(currentVoucher.endDate).toLocaleDateString("vi-VN")
                                        : "N/A"}
                                </span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Trạng thái:</strong>
                                <span style={{ marginLeft: "8px" }}>
                                    {new Date(currentVoucher.endDate) < new Date()
                                        ? "Đã hết hạn"
                                        : currentVoucher.status === "paused"
                                            ? "Tạm ngưng"
                                            : "Hoạt động"}
                                </span>
                            </Typography>
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

            {/* Modal xác nhận xóa */}
            <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                        textAlign: "center",
                    }}
                >
                    Xác nhận xóa voucher
                </DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa voucher này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDeleteConfirm}
                        color="primary"
                        variant="contained"
                        sx={{ fontWeight: "bold" }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        sx={{ fontWeight: "bold" }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Xóa"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VoucherControl;