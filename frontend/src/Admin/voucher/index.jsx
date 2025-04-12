import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";

const VoucherControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Dữ liệu mẫu
    const [vouchers, setVouchers] = useState([
        {
            id: 1,
            code: "DANGCAP01",
            discount: 99,
            remaining: 1,
            expiration: "07/03/2025 13:00:00",
            status: "Đã hết hạn",
        },
    ]);

    // State quản lý modal
    const [open, setOpen] = useState(false);
    const [newVoucher, setNewVoucher] = useState({
        id: "",
        code: "",
        discount: "",
        remaining: "",
        expiration: "",
        status: "Đã hết hạn",
    });

    // Hàm mở/đóng modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Hàm xử lý thêm voucher mới
    const handleAdd = () => {
        if (!newVoucher.code || !newVoucher.discount || !newVoucher.expiration) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setVouchers([...vouchers, { ...newVoucher, id: vouchers.length + 1 }]);
        setNewVoucher({
            id: "",
            code: "",
            discount: "",
            remaining: "",
            expiration: "",
            status: "Đã hết hạn",
        });
        handleClose();
    };

    // Hàm xử lý sửa, xóa
    const handleEdit = (id) => {
        alert(`Sửa voucher có ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
            setVouchers(vouchers.filter((voucher) => voucher.id !== id));
        }
    };

    // Cấu hình các cột trong DataGrid
    const columns = [
        { field: "id", headerName: "STT", flex: 0.3 },
        { field: "code", headerName: "Mã voucher", flex: 1 },
        { field: "discount", headerName: "% Giảm giá", flex: 0.5 },
        { field: "remaining", headerName: "Còn lại", flex: 0.5 },
        { field: "expiration", headerName: "Thời gian hết hạn", flex: 1 },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 0.5,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: params.value === "Đã hết hạn" ? "red" : "green",
                        color: "white",
                        fontWeight: "bold",
                    }}
                >
                    {params.value}
                </Button>
            ),
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            renderCell: (params) => (
                <Box display="flex" gap={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(params.row.id)}
                    >
                        Sửa
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Xóa
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            {/* Tiêu đề */}
            <Typography variant="h4" fontWeight="bold" mb={2}>
                Danh sách voucher
            </Typography>

            {/* Thanh công cụ */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                    placeholder="Nhập từ khóa"
                    variant="outlined"
                    size="small"
                    sx={{ width: "300px" }}
                />
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Thêm mới
                </Button>
            </Box>

            {/* Bảng dữ liệu */}
            <Box
                height="60vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                        color: colors.grey[100],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontWeight: "bold",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                    },
                }}
            >
                <DataGrid rows={vouchers} columns={columns} />
            </Box>

            {/* Modal thêm mới */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                        textAlign: "center",
                    }}
                >
                    Thêm mới voucher
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mã voucher"
                        value={newVoucher.code}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, code: e.target.value })
                        }
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
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Còn lại"
                        type="number"
                        value={newVoucher.remaining}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, remaining: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Thời gian hết hạn"
                        value={newVoucher.expiration}
                        onChange={(e) =>
                            setNewVoucher({ ...newVoucher, expiration: e.target.value })
                        }
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
                        onClick={handleAdd}
                        color="success"
                        variant="contained"
                        sx={{ fontWeight: "bold" }}
                    >
                        Thêm mới
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VoucherControl;