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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    changeCategoryStatus,
} from "./CategoryApi";
import { useAdminAuth } from "../../context/AdminContext";

const CategoryControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // Lưu toàn bộ danh mục từ API
    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [newCategory, setNewCategory] = useState({
        title: "",
        image: "",
        description: "",
        status: "active",
    });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentCategoryImages, setCurrentCategoryImages] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Thêm event listener để theo dõi sự thay đổi của Sidebar
    useEffect(() => {
        const handleSidebarChange = (event) => {
            setIsSidebarCollapsed(event.detail.isCollapsed);
        };

        window.addEventListener('sidebarCollapse', handleSidebarChange);
        return () => {
            window.removeEventListener('sidebarCollapse', handleSidebarChange);
        };
    }, []);

    // Lấy danh sách danh mục từ API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories(); // Không gửi tham số title
            const formattedData = Array.isArray(data)
                ? data.map((item, index) => ({
                    ...item,
                    id: item._id,
                    stt: index + 1,
                }))
                : [];
            setAllCategories(formattedData); // Lưu toàn bộ danh mục
            setCategories(formattedData); // Hiển thị ban đầu
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách danh mục!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Fetch categories error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        console.log("adminToken in CategoryControl:", token);
        if (token) {
            fetchCategories();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                window.location.href = "/loginadmin";
            }, 2000); // Đợi 2 giây để hiển thị toast
        }
    }, [adminToken]);

    // Xử lý tìm kiếm ở frontend
    useEffect(() => {
        const filteredCategories = allCategories.filter((category) =>
            category.title.toLowerCase().includes(searchText.toLowerCase())
        );
        setCategories(filteredCategories);
    }, [searchText, allCategories]);

    // Xử lý tìm kiếm thủ công khi nhấn nút
    const handleSearch = (e) => {
        e.preventDefault();
        const filteredCategories = allCategories.filter((category) =>
            category.title.toLowerCase().includes(searchText.toLowerCase())
        );
        setCategories(filteredCategories);
    };

    // Mở modal thêm mới
    const handleOpen = () => {
        setIsEdit(false);
        setNewCategory({ title: "", image: "", description: "", status: "active" });
        setImageFile(null);
        setError("");
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError("");
    };

    // Xử lý upload ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setNewCategory({ ...newCategory, image: URL.createObjectURL(file) });
        }
    };

    // Thêm danh mục
    const handleAdd = async () => {
        if (!newCategory.title || !newCategory.description) {
            setError("Vui lòng điền đầy đủ tiêu đề và mô tả!");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", newCategory.title);
            formData.append("description", newCategory.description);
            formData.append("status", newCategory.status);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await createCategory(formData);
            if (response.code === 200) {
                fetchCategories();
                handleClose();
                toast.success("Thêm danh mục thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Thêm danh mục thất bại!");
                toast.error(response.message || "Thêm danh mục thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Thêm danh mục thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Add category error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Mở modal chỉnh sửa
    const handleEdit = (category) => {
        setIsEdit(true);
        setCurrentId(category._id);
        setNewCategory({
            title: category.title,
            image: category.image || "",
            description: category.description || "",
            status: category.status,
        });
        setImageFile(null);
        setError("");
        setOpen(true);
    };

    // Cập nhật danh mục
    const handleUpdate = async () => {
        if (!newCategory.title || !newCategory.description) {
            setError("Vui lòng điền đầy đủ tiêu đề và mô tả!");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", newCategory.title);
            formData.append("description", newCategory.description);
            formData.append("status", newCategory.status);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await updateCategory(currentId, formData);
            if (response.code === 200) {
                fetchCategories();
                handleClose();
                toast.success("Cập nhật danh mục thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Cập nhật danh mục thất bại!");
                toast.error(response.message || "Cập nhật danh mục thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Cập nhật danh mục thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Update category error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Xóa danh mục
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            setLoading(true);
            try {
                const response = await deleteCategory(id);
                if (response.code === 200) {
                    fetchCategories();
                    toast.success("Xóa danh mục thành công!", { position: "top-right" });
                } else {
                    setError(response.message || "Xóa danh mục thất bại!");
                    toast.error(response.message || "Xóa danh mục thất bại!", { position: "top-right" });
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || "Xóa danh mục thất bại!";
                setError(errorMessage);
                toast.error(errorMessage, { position: "top-right" });
                console.error("Delete category error:", err.response?.data);
            } finally {
                setLoading(false);
            }
        }
    };

    // Thay đổi trạng thái
    const handleChangeStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        setLoading(true);
        try {
            const response = await changeCategoryStatus(id, newStatus);
            if (response.code === 200) {
                fetchCategories();
                toast.success("Cập nhật trạng thái thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Cập nhật trạng thái thất bại!");
                toast.error(response.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Cập nhật trạng thái thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Change status error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (image, category) => {
        setSelectedImage(image);
        setCurrentImageIndex(0);
        setCurrentCategoryImages([image]); // Khởi tạo với hình ảnh hiện tại
        setOpenImageDialog(true);
    };

    const handleNextImage = () => {
        const nextIndex = (currentImageIndex + 1) % currentCategoryImages.length;
        setCurrentImageIndex(nextIndex);
        setSelectedImage(currentCategoryImages[nextIndex]);
    };

    const handlePrevImage = () => {
        const prevIndex = (currentImageIndex - 1 + currentCategoryImages.length) % currentCategoryImages.length;
        setCurrentImageIndex(prevIndex);
        setSelectedImage(currentCategoryImages[prevIndex]);
    };

    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setSelectedImage(null);
        setCurrentCategoryImages([]);
        setCurrentImageIndex(0);
    };

    const columns = [
        {
            field: "stt",
            headerName: "STT",
            flex: 0.3,
            headerClassName: 'header-stt',
        },
        {
            field: "image",
            headerName: "Hình ảnh",
            flex: 0.5,
            headerClassName: 'header-image',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        width: "100%",
                        cursor: "pointer",
                    }}
                    onClick={() => handleImageClick(params.value, params.row)}
                >
                    <Box
                        component="img"
                        src={params.value || "https://via.placeholder.com/100"}
                        alt="Category"
                        sx={{
                            width: 100,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 1,
                            "&:hover": {
                                opacity: 0.8,
                            },
                        }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                        }}
                    />
                </Box>
            ),
        },
        {
            field: "title",
            headerName: "Tiêu đề",
            flex: 1,
            headerClassName: 'header-title',
        },
        {
            field: "description",
            headerName: "Mô tả",
            flex: 1,
            headerClassName: 'header-description',
        },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 0.5,
            headerClassName: 'header-status',
            renderCell: (params) => (
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
                        onClick={() => handleChangeStatus(params.row._id, params.value)}
                        sx={{
                            backgroundColor: params.value === "active" ? "green" : "orange",
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: params.value === "active" ? "darkgreen" : "darkorange",
                            },
                        }}
                    >
                        {params.value === "active" ? "Hoạt động" : "Tạm ngưng"}
                    </Button>
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 0.8,
            headerClassName: 'header-actions',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        height: "100%",
                    }}
                >
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
                            Quản lý danh mục tour
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
                                    placeholder="Tìm kiếm danh mục (theo tiêu đề)"
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
                                Thêm mới danh mục tour
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
                                rows={categories}
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

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                        textAlign: "center",
                    }}
                >
                    {isEdit ? "Chỉnh sửa danh mục" : "Thêm mới danh mục"}
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
                        value={newCategory.title}
                        onChange={(e) =>
                            setNewCategory({ ...newCategory, title: e.target.value })
                        }
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mô tả"
                        value={newCategory.description}
                        onChange={(e) =>
                            setNewCategory({ ...newCategory, description: e.target.value })
                        }
                        multiline
                        rows={4}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        select
                        label="Trạng thái"
                        value={newCategory.status}
                        onChange={(e) =>
                            setNewCategory({ ...newCategory, status: e.target.value })
                        }
                    >
                        <MenuItem value="active">Hoạt động</MenuItem>
                        <MenuItem value="inactive">Tạm ngưng</MenuItem>
                    </TextField>
                    <Box mt={2}>
                        <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="image-upload"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="image-upload">
                            <Button variant="contained" component="span" color="primary">
                                Chọn ảnh
                            </Button>
                        </label>
                        {newCategory.image && (
                            <Box mt={2}>
                                <img
                                    src={newCategory.image}
                                    alt="Preview"
                                    style={{ width: "100px", borderRadius: "8px" }}
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/100";
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
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

            {/* Dialog xem hình ảnh to */}
            <Dialog
                open={openImageDialog}
                onClose={handleCloseImageDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0, position: "relative" }}>
                    <Box
                        component="img"
                        src={selectedImage}
                        alt="Category"
                        sx={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                    {currentCategoryImages.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrevImage}
                                sx={{
                                    position: "absolute",
                                    left: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                                onClick={handleNextImage}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    },
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default CategoryControl;