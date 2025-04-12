import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TourControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Dữ liệu mẫu
    const [tours, setTours] = useState([
        {
            id: 1,
            name: "Tour Hà Nội - Hạ Long",
            image: "https://via.placeholder.com/100",
            slots: 40,
            status: "Còn chỗ",
            price: "5.000.000 đ",
            category: "Tour biển",
        },
        {
            id: 2,
            name: "Tour Đà Nẵng - Hội An",
            image: "https://via.placeholder.com/100",
            slots: 30,
            status: "Còn chỗ",
            price: "7.000.000 đ",
            category: "Tour miền Trung",
        },
    ]);

    // State quản lý modal
    const [open, setOpen] = useState(false);
    const [newTour, setNewTour] = useState({
        id: "",
        name: "",
        image: "",
        slots: "",
        status: "Còn chỗ",
        price: "",
        category: "",
    });

    // Hàm mở/đóng modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Hàm xử lý thêm tour mới
    const handleAdd = () => {
        if (!newTour.name || !newTour.price || !newTour.category) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setTours([...tours, { ...newTour, id: tours.length + 1 }]);
        setNewTour({
            id: "",
            name: "",
            image: "",
            slots: "",
            status: "Còn chỗ",
            price: "",
            category: "",
        });
        handleClose();
    };

    // Hàm xử lý sửa, xóa
    const handleEdit = (id) => {
        alert(`Sửa tour có ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tour này?")) {
            setTours(tours.filter((tour) => tour.id !== id));
        }
    };

    // Cấu hình các cột trong DataGrid
    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "name", headerName: "Tên tour", flex: 1 },
        {
            field: "image",
            headerName: "Hình ảnh",
            flex: 1,
            renderCell: (params) => (
                <img
                    src={params.value}
                    alt="Tour"
                    style={{ width: "100px", borderRadius: "8px" }}
                />
            ),
        },
        { field: "slots", headerName: "Số lượng chỗ", flex: 0.5 },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 0.5,
            renderCell: (params) => (
                <span
                    style={{
                        color: params.value === "Còn chỗ" ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    {params.value}
                </span>
            ),
        },
        { field: "price", headerName: "Giá tiền", flex: 1 },
        { field: "category", headerName: "Danh mục", flex: 1 },
        {
            field: "actions",
            headerName: "Chức năng",
            flex: 0.5,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        color="primary"
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            {/* Thanh công cụ */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Thêm mới tour
                </Button>
            </Box>

            {/* Bảng dữ liệu */}
            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
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
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={tours}
                    columns={columns}
                    components={{ Toolbar: GridToolbar }}
                />
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
                    Thêm mới tour
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Tên tour"
                        value={newTour.name}
                        onChange={(e) => setNewTour({ ...newTour, name: e.target.value })}
                    />
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{
                                marginTop: "10px",
                                whiteSpace: "nowrap",
                                color: "white",
                                backgroundColor: "#333333",
                                "&:hover": {
                                    backgroundColor: "#777777",
                                },
                            }}
                        >
                            Tải ảnh từ máy
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                multiple // Cho phép chọn nhiều file
                                onChange={(e) => {
                                    const files = Array.from(e.target.files); // Lấy danh sách file
                                    const readers = files.map((file) => {
                                        return new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.onload = () => resolve(reader.result);
                                            reader.readAsDataURL(file);
                                        });
                                    });

                                    Promise.all(readers).then((images) => {
                                        setNewTour({ ...newTour, images }); // Lưu danh sách ảnh vào state
                                    });
                                }}
                            />
                        </Button>

                        {/* Hiển thị danh sách ảnh xem trước */}
                        {newTour.images && (
                            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                                {newTour.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Preview ${index + 1}`}
                                        style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "8px" }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                    {newTour.image && (
                        <Box mt={2} textAlign="center">
                            <img
                                src={newTour.image}
                                alt="Preview"
                                style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
                            />
                        </Box>
                    )}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Số lượng chỗ"
                        type="number"
                        value={newTour.slots}
                        onChange={(e) => setNewTour({ ...newTour, slots: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Giá tiền"
                        value={newTour.price}
                        onChange={(e) => setNewTour({ ...newTour, price: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Danh mục"
                        value={newTour.category}
                        onChange={(e) =>
                            setNewTour({ ...newTour, category: e.target.value })
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

export default TourControl;