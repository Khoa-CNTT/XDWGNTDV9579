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

const CategoryControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Dữ liệu mẫu
    const [categories, setCategories] = useState([
        {
            id: 1,
            title: "Du lịch trong nước",
            image: "https://via.placeholder.com/100",
            status: "Hoạt động",
        },
        {
            id: 2,
            title: "Du lịch nước ngoài",
            image: "https://via.placeholder.com/100",
            status: "Hoạt động",
        },
        {
            id: 3,
            title: "Tour mùa hè",
            image: "https://via.placeholder.com/100",
            status: "Hoạt động",
        },
        {
            id: 4,
            title: "Tour mùa đông",
            image: "https://via.placeholder.com/100",
            status: "Hoạt động",
        },
        {
            id: 5,
            title: "Tour thám hiểm",
            image: "https://via.placeholder.com/100",
            status: "Hoạt động",
        },
    ]);

    // State quản lý modal
    const [open, setOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        id: "",
        title: "",
        image: "",
        status: "Hoạt động",
    });
    // Hàm mở/đóng modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Hàm xử lý thêm danh mục mới
    const handleAdd = () => {
        if (!newCategory.title || !newCategory.image) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setCategories([...categories, { ...newCategory, id: categories.length + 1 }]);
        setNewCategory({ id: "", title: "", image: "", status: "Hoạt động" });
        handleClose();
    };


    // Hàm xử lý sửa, xóa
    const handleEdit = (id) => {
        alert(`Sửa danh mục có ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            setCategories(categories.filter((category) => category.id !== id));
        }
    };

    // Cấu hình các cột trong DataGrid
    const columns = [
        { field: "id", headerName: "STT", flex: 0.3 },
        {
            field: "image",
            headerName: "Hình ảnh",
            flex: 1,
            renderCell: (params) => (
                <img
                    src={params.value}
                    alt="Category"
                    style={{ width: "100px", borderRadius: "8px" }}
                />
            ),
        },
        { field: "title", headerName: "Tiêu đề", flex: 1 },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 0.5,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: params.value === "Hoạt động" ? "green" : "red",
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
            {/* Thanh công cụ */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Thêm mới danh mục tour
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
                <DataGrid rows={categories} columns={columns} />
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
                    Thêm mới danh mục
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Tiêu đề"
                        value={newCategory.title}
                        onChange={(e) =>
                            setNewCategory({ ...newCategory, title: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Hình ảnh (URL)"
                        value={newCategory.image}
                        onChange={(e) =>
                            setNewCategory({ ...newCategory, image: e.target.value })
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

export default CategoryControl;

