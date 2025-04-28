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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    getTours,
    createTour,
    updateTour,
    deleteTour,
    getTourDetail,
    changeTourStatus,
    getCategories,
} from "./tourApi";
import { useAdminAuth } from "../../context/AdminContext";

const TourControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const [tours, setTours] = useState([]);
    const [allTours, setAllTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [deleteTourId, setDeleteTourId] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [currentTour, setCurrentTour] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentTourImages, setCurrentTourImages] = useState([]);
    const [newTour, setNewTour] = useState({
        title: "",
        code: "",
        price: "",
        discount: "",
        stock: "",
        category_id: "",
        timeStarts: [{ timeDepart: "", stock: "" }],
        status: "active",
        images: [],
        information: "",
        schedule: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedDates, setSelectedDates] = useState({});

    // Gộp các ngày khởi hành trùng lặp và cộng tổng số lượng
    const mergeDuplicateDates = (timeStarts) => {
        const merged = {};

        timeStarts.forEach(({ timeDepart, stock }) => {
            if (timeDepart && stock) {
                const dateKey = timeDepart;
                if (merged[dateKey]) {
                    merged[dateKey].stock += parseInt(stock) || 0;
                } else {
                    merged[dateKey] = {
                        timeDepart,
                        stock: parseInt(stock) || 0
                    };
                }
            }
        });

        return Object.values(merged);
    };

    // Lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            console.log("Categories from API:", data);
            setCategories(data);
            return data;
        } catch (err) {
            toast.error("Không thể tải danh sách danh mục!", { position: "top-right" });
            console.error("Fetch categories error:", err);
            return [];
        }
    };

    // Lấy danh sách tour
    const fetchTours = async (categoriesData) => {
        setLoading(true);
        try {
            const data = await getTours();
            console.log("Tours from API:", data);
            const formattedData = Array.isArray(data)
                ? data.map((item, index) => {
                    const category = categoriesData.find((cat) => cat._id === item.category_id);
                    console.log(`Tour ${item.title}: category_id=${item.category_id}, matched category=`, category);
                    if (!category) {
                        console.warn(`Tour ${item.title} has invalid category_id: ${item.category_id}`);
                    }
                    const tourStatus = category && category.status === "inactive" ? "inactive" : item.status || "active";
                    return {
                        ...item,
                        id: item._id,
                        stt: index + 1,
                        status: tourStatus,
                        price_special: item.price_special,
                        timeStarts: item.timeStarts || [],
                        selectedDate: item.timeStarts[0]?.timeDepart || null,
                        selectedStock: item.timeStarts[0]?.stock || item.stock,
                        tempStock: item.timeStarts[0]?.stock || item.stock,
                        categoryName: category ? category.title : "Không tìm thấy danh mục",
                    };
                })
                : [];
            setAllTours(formattedData);
            setTours(formattedData);
            const initialSelectedDates = {};
            formattedData.forEach((tour) => {
                initialSelectedDates[tour._id] = tour.timeStarts[0]?.timeDepart || null;
            });
            setSelectedDates(initialSelectedDates);
            if (formattedData.length === 0) {
                toast.info("Không có tour nào để hiển thị!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách tour!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Fetch tours error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm làm mới toàn bộ dữ liệu
    const refreshData = async () => {
        console.log("Starting to refresh data...");
        const fetchedCategories = await fetchCategories();
        if (fetchedCategories.length > 0) {
            console.log("Categories fetched, fetching tours...");
            await fetchTours(fetchedCategories);
            console.log("Tours fetched.");
        } else {
            toast.warn("Không có danh mục nào, vui lòng tạo danh mục trước!", { position: "top-right" });
        }
    };

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        if (token) {
            refreshData();
        } else {
            toast.error("Vui lòng điền đầy đủ thông tin để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                window.location.href = "/loginadmin";
            }, 2000);
        }
    }, [adminToken]);

    // Xử lý tìm kiếm
    useEffect(() => {
        const filteredTours = allTours.filter((tour) =>
            tour.title.toLowerCase().includes(searchText.toLowerCase())
        );
        setTours(filteredTours);
    }, [searchText, allTours]);

    const handleSearch = (e) => {
        e.preventDefault();
        const filteredTours = allTours.filter((tour) =>
            tour.title.toLowerCase().includes(searchText.toLowerCase())
        );
        setTours(filteredTours);
    };

    // Mở modal thêm mới
    const handleOpen = () => {
        setIsEdit(false);
        setNewTour({
            title: "",
            code: "",
            price: "",
            discount: "",
            stock: "",
            category_id: "",
            timeStarts: [{ timeDepart: "", stock: "" }],
            status: "active",
            images: [],
            information: "",
            schedule: "",
        });
        setError("");
        setOpen(true);
    };

    // Mở modal chỉnh sửa
    const handleEdit = (tour) => {
        setIsEdit(true);
        setCurrentId(tour._id);
        const formatDate = (date) => {
            if (!date) return "";
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) return "";
            return parsedDate.toISOString().split("T")[0];
        };
        setNewTour({
            title: tour.title || "",
            code: tour.code || "",
            price: tour.price?.toString() || "",
            discount: tour.discount?.toString() || "",
            stock: tour.stock?.toString() || "",
            category_id: tour.category_id || "",
            timeStarts: tour.timeStarts.map((item) => ({
                timeDepart: formatDate(item.timeDepart),
                stock: item.stock.toString()
            })),
            status: tour.status || "active",
            images: tour.images || [],
            information: tour.information || "",
            schedule: tour.schedule || "",
        });
        setError("");
        setOpen(true);
    };

    // Mở modal chi tiết
    const handleOpenDetail = async (tour) => {
        setLoading(true);
        try {
            const response = await getTourDetail(tour._id);
            const category = categories.find((cat) => cat._id === response.tour.category_id);
            setCurrentTour({
                ...response.tour,
                status: category && category.status === "inactive" ? "inactive" : response.tour.status
            });
            setOpenDetail(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải chi tiết tour!";
            toast.error(errorMessage, { position: "top-right" });
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
        setCurrentTour(null);
    };

    // Mở modal xác nhận xóa
    const handleOpenDeleteConfirm = (id) => {
        setDeleteTourId(id);
        setOpenDeleteConfirm(true);
    };

    // Đóng modal xác nhận xóa
    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
        setDeleteTourId(null);
    };

    // Xử lý click vào hình ảnh
    const handleImageClick = (images, tour) => {
        if (images && images.length > 0) {
            setSelectedImage(images[0]);
            setCurrentImageIndex(0);
            setCurrentTourImages(images);
            setOpenImageDialog(true);
        }
    };

    // Chuyển sang hình ảnh tiếp theo
    const handleNextImage = () => {
        const nextIndex = (currentImageIndex + 1) % currentTourImages.length;
        setCurrentImageIndex(nextIndex);
        setSelectedImage(currentTourImages[nextIndex]);
    };

    // Chuyển sang hình ảnh trước đó
    const handlePrevImage = () => {
        const prevIndex = (currentImageIndex - 1 + currentTourImages.length) % currentTourImages.length;
        setCurrentImageIndex(prevIndex);
        setSelectedImage(currentTourImages[prevIndex]);
    };

    // Đóng dialog hình ảnh
    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setSelectedImage(null);
        setCurrentTourImages([]);
        setCurrentImageIndex(0);
    };

    // Thêm tour
    const handleAdd = async () => {
        if (
            !newTour.title ||
            !newTour.price ||
            !newTour.discount ||
            !newTour.category_id ||
            !newTour.timeStarts[0].timeDepart ||
            !newTour.timeStarts[0].stock ||
            !newTour.schedule
        ) {
            setError("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        // Validate all timeStarts entries
        const invalidTimeStarts = newTour.timeStarts.some(
            (time) => !time.timeDepart || !time.stock || isNaN(parseInt(time.stock)) || parseInt(time.stock) < 0
        );
        if (invalidTimeStarts) {
            setError("Vui lòng điền đầy đủ và hợp lệ thông tin ngày khởi hành và số lượng!");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", newTour.title);
            formData.append("price", parseFloat(newTour.price));
            formData.append("discount", parseFloat(newTour.discount));
            formData.append("stock", parseInt(newTour.stock) || 0);
            formData.append("category_id", newTour.category_id);
            const category = categories.find((cat) => cat._id === newTour.category_id);
            formData.append("status", category && category.status === "inactive" ? "inactive" : newTour.status);
            formData.append("information", newTour.information || "");
            formData.append("schedule", newTour.schedule);

            // Gộp các ngày khởi hành trùng lặp
            const mergedTimeStarts = mergeDuplicateDates(newTour.timeStarts);
            console.log("Merged timeStarts:", mergedTimeStarts);

            // Gửi timeStarts đã gộp
            mergedTimeStarts.forEach((time, index) => {
                formData.append(`timeStarts[${index}][timeDepart]`, time.timeDepart);
                formData.append(`timeStarts[${index}][stock]`, time.stock);
                console.log(`timeStarts[${index}]:`, { timeDepart: time.timeDepart, stock: time.stock });
            });

            // Gửi images
            if (newTour.images.length > 0) {
                newTour.images.forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append("images", image);
                        console.log(`Image ${index}:`, image.name, image.size);
                    } else {
                        console.warn(`Image ${index} is not a File object:`, image);
                    }
                });
            } else {
                console.log("No images provided.");
            }

            console.log("FormData to send:", Object.fromEntries(formData));
            const response = await createTour(formData);
            if (response.code === 200) {
                await refreshData();
                handleClose();
                toast.success("Thêm tour thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Thêm tour thất bại!");
                toast.error(response.message || "Thêm tour thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.errors?.join(", ") ||
                err.response?.data?.message ||
                "Thêm tour thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Add tour error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật tour
    const handleUpdate = async () => {
        // Validate required fields
        if (
            !newTour.title ||
            !newTour.price ||
            !newTour.discount ||
            !newTour.category_id ||
            !newTour.schedule
        ) {
            setError("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        // Validate all timeStarts entries
        const invalidTimeStarts = newTour.timeStarts.some(
            (time) => !time.timeDepart || !time.stock || isNaN(parseInt(time.stock)) || parseInt(time.stock) < 0
        );
        if (invalidTimeStarts) {
            setError("Vui lòng điền đầy đủ và hợp lệ thông tin ngày khởi hành và số lượng!");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", newTour.title);
            formData.append("price", parseFloat(newTour.price));
            formData.append("discount", parseFloat(newTour.discount));
            formData.append("stock", parseInt(newTour.stock) || 0);
            formData.append("category_id", newTour.category_id);
            const category = categories.find((cat) => cat._id === newTour.category_id);
            formData.append("status", category && category.status === "inactive" ? "inactive" : newTour.status);
            formData.append("information", newTour.information || "");
            formData.append("schedule", newTour.schedule);
            newTour.timeStarts.forEach((time, index) => {
                formData.append(`timeStarts[${index}][timeDepart]`, time.timeDepart);
                formData.append(`timeStarts[${index}][stock]`, parseInt(time.stock));
            });
            newTour.images.forEach((image, index) => {
                if (image instanceof File) {
                    formData.append("images", image);
                    console.log(`Image ${index}:`, image.name, image.size);
                } else {
                    console.warn(`Image ${index} is not a File object:`, image);
                }
            });
            console.log("FormData to send:", Object.fromEntries(formData));
            const response = await updateTour(currentId, formData);
            if (response.code === 200) {
                await refreshData();
                handleClose();
                toast.success("Cập nhật tour thành công!", { position: "top-right" });
            } else {
                setError(response.message || "Cập nhật tour thất bại!");
                toast.error(response.message || "Cập nhật tour thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.errors?.join(", ") ||
                err.response?.data?.message ||
                "Cập nhật tour thất bại!";
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("Update tour error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật stock cho ngày khởi hành
    const updateTourStock = async (tourId, selectedDate, newStock) => {
        setLoading(true);
        try {
            const tour = tours.find((t) => t._id === tourId);
            if (!tour) {
                throw new Error("Tour không tồn tại!");
            }

            // Tạo mảng timeStarts mới với stock đã cập nhật
            const updatedTimeStarts = tour.timeStarts.map((time) =>
                time.timeDepart === selectedDate
                    ? { ...time, stock: parseInt(newStock) }
                    : time
            );

            // Chuẩn bị dữ liệu gửi lên server
            const formData = new FormData();
            formData.append("title", tour.title);
            formData.append("price", parseFloat(tour.price));
            formData.append("discount", parseFloat(tour.discount));
            formData.append("stock", parseInt(tour.stock) || 0);
            formData.append("category_id", tour.category_id);
            const category = categories.find((cat) => cat._id === tour.category_id);
            formData.append("status", category && category.status === "inactive" ? "inactive" : tour.status);
            formData.append("information", tour.information || "");
            formData.append("schedule", tour.schedule || "");
            updatedTimeStarts.forEach((time, index) => {
                formData.append(`timeStarts[${index}][timeDepart]`, time.timeDepart);
                formData.append(`timeStarts[${index}][stock]`, time.stock);
            });
            tour.images.forEach((image, index) => {
                if (image instanceof File) {
                    formData.append("images", image);
                }
            });

            console.log("FormData for stock update:", Object.fromEntries(formData));
            const response = await updateTour(tourId, formData);
            if (response.code === 200) {
                // Cập nhật state tours
                setTours((prev) =>
                    prev.map((t) =>
                        t._id === tourId
                            ? {
                                ...t,
                                timeStarts: updatedTimeStarts,
                                selectedStock: parseInt(newStock),
                                tempStock: parseInt(newStock),
                            }
                            : t
                    )
                );
                toast.success("Cập nhật số lượng thành công!", { position: "top-right" });
            } else {
                // Khôi phục tempStock nếu API thất bại
                setTours((prev) =>
                    prev.map((t) =>
                        t._id === tourId
                            ? { ...t, tempStock: t.selectedStock }
                            : t
                    )
                );
                toast.error(response.message || "Cập nhật số lượng thất bại!", { position: "top-right" });
            }
        } catch (err) {
            // Khôi phục tempStock nếu có lỗi
            setTours((prev) =>
                prev.map((t) =>
                    t._id === tourId
                        ? { ...t, tempStock: t.selectedStock }
                        : t
                )
            );
            const errorMessage =
                err.response?.data?.errors?.join(", ") ||
                err.response?.data?.message ||
                "Cập nhật số lượng thất bại!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Update stock error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi tạm thời của stock
    const handleStockChange = (tourId, value) => {
        if (value === "" || parseInt(value) >= 0) {
            setTours((prev) =>
                prev.map((t) =>
                    t._id === tourId
                        ? { ...t, tempStock: value === "" ? "" : parseInt(value) }
                        : t
                )
            );
        } else {
            toast.error("Số lượng phải là số không âm!", { position: "top-right" });
        }
    };

    // Xác nhận cập nhật stock khi nhấn Enter hoặc mất focus
    const commitStockChange = (tourId, selectedDate, value) => {
        if (value !== "" && !isNaN(parseInt(value)) && parseInt(value) >= 0) {
            updateTourStock(tourId, selectedDate, parseInt(value));
        } else if (value === "") {
            // Nếu để trống, khôi phục giá trị ban đầu
            setTours((prev) =>
                prev.map((t) =>
                    t._id === tourId
                        ? { ...t, tempStock: t.selectedStock }
                        : t
                )
            );
            toast.error("Số lượng không được để trống!", { position: "top-right" });
        }
    };

    // Xóa tour
    const handleConfirmDelete = async () => {
        if (!deleteTourId) return;
        setLoading(true);
        try {
            const response = await deleteTour(deleteTourId);
            if (response.code === 200) {
                await refreshData();
                toast.success("Xóa tour thành công!", { position: "top-right" });
            } else {
                toast.error(response.message || "Xóa tour thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Xóa tour thất bại!";
            toast.error(errorMessage, { position: "top-right" });
        } finally {
            setLoading(false);
            handleCloseDeleteConfirm();
        }
    };

    // Thay đổi trạng thái tour
    const handleToggleStatus = async (id, currentStatus) => {
        setLoading(true);
        try {
            const tour = tours.find((t) => t._id === id);
            const category = categories.find((cat) => cat._id === tour.category_id);
            if (category && category.status === "inactive" && currentStatus === "inactive") {
                toast.warn("Không thể kích hoạt tour vì danh mục đang tạm ngưng!", { position: "top-right" });
                return;
            }
            const newStatus = currentStatus === "active" ? "inactive" : "active";
            const response = await changeTourStatus(id, newStatus);
            if (response.code === 200) {
                await refreshData();
                toast.success(
                    `Thay đổi trạng thái thành ${newStatus === "active" ? "Hoạt động" : "Tạm ngưng"}!`,
                    { position: "top-right" }
                );
            } else {
                toast.error(response.message || "Thay đổi trạng thái thất bại!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Thay đổi trạng thái thất bại!";
            toast.error(errorMessage, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi ngày khởi hành
    const handleDateChange = (tourId, timeDepart) => {
        setSelectedDates((prev) => ({
            ...prev,
            [tourId]: timeDepart,
        }));
        const tour = tours.find((t) => t._id === tourId);
        const selectedTime = tour.timeStarts.find((t) => t.timeDepart === timeDepart);
        setTours((prev) =>
            prev.map((t) =>
                t._id === tourId
                    ? {
                        ...t,
                        selectedDate: timeDepart,
                        selectedStock: selectedTime?.stock || t.stock,
                        tempStock: selectedTime?.stock || t.stock,
                    }
                    : t
            )
        );
    };

    // Lọc danh mục hiển thị trong Select
    const getFilteredCategories = () => {
        if (isEdit && newTour.category_id) {
            const currentCategory = categories.find((cat) => cat._id === newTour.category_id);
            const activeCategories = categories.filter((cat) => cat.status === "active");
            if (currentCategory && currentCategory.status !== "active") {
                return [...activeCategories, currentCategory];
            }
            return activeCategories;
        }
        return categories.filter((cat) => cat.status === "active");
    };

    const columns = [
        { field: "stt", headerName: "STT", flex: 0.3 },
        { field: "code", headerName: "Mã tour", flex: 0.7 },
        {
            field: "images",
            headerName: "Hình ảnh",
            flex: 0.8,
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
                        src={
                            params.value && params.value.length > 0
                                ? params.value[0]
                                : "https://via.placeholder.com/100"
                        }
                        alt="Tour"
                        sx={{
                            width: 100,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 1,
                            "&:hover": { opacity: 0.8 },
                        }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                        }}
                    />
                </Box>
            ),
        },
        { field: "title", headerName: "Tiêu đề", flex: 1 },
        { field: "categoryName", headerName: "Danh mục", flex: 1.3 },
        { field: "price_special", headerName: "Giá (VNĐ)", flex: 0.7 },
        {
            field: "discount",
            headerName: "% Giảm giá",
            flex: 0.7,
            renderCell: (params) => `${params.value || 0}%`,
        },
        {
            field: "selectedStock",
            headerName: "Số lượng",
            flex: 0.7,
            renderCell: (params) => (
                <TextField
                    type="number"
                    value={params.row.tempStock || ""}
                    onChange={(e) => handleStockChange(params.row._id, e.target.value)}
                    onBlur={() => commitStockChange(params.row._id, params.row.selectedDate, params.row.tempStock)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            commitStockChange(params.row._id, params.row.selectedDate, params.row.tempStock);
                        }
                    }}
                    size="small"
                    inputProps={{ min: 0 }}
                    sx={{ width: "80px", mt: "20px" }}
                />
            ),
        },
        {
            field: "timeStarts",
            headerName: "Ngày khởi hành",
            flex: 1,
            renderCell: (params) => {
                const tour = params.row;
                return (
                    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                        <FormControl fullWidth>
                            <Select
                                value={selectedDates[tour._id] || tour.selectedDate || ""}
                                onChange={(e) => handleDateChange(tour._id, e.target.value)}
                                displayEmpty
                            >
                                {tour.timeStarts.map((time, index) => (
                                    <MenuItem key={index} value={time.timeDepart}>
                                        {new Date(time.timeDepart).toLocaleDateString("vi-VN")}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );
            },
        },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 0.7,
            renderCell: (params) => {
                const status = params.value;
                const displayText = status === "active" ? "Hoạt động" : "Tạm ngưng";
                const bgColor = status === "active" ? "green" : "orange";
                const hoverColor = status === "active" ? "darkgreen" : "darkorange";

                return (
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: bgColor,
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: hoverColor },
                        }}
                        onClick={() => handleToggleStatus(params.row._id, status)}
                        disabled={loading}
                    >
                        {displayText}
                    </Button>
                );
            },
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1.6,
            renderCell: (params) => (
                <Box display="flex" gap={1} sx={{ alignItems: "center", height: "100%" }}>
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

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
                <Box sx={{ gridColumn: "span 12" }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="h2" color={colors.grey[100]} fontWeight="bold">
                            Quản lý tour
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
                                    placeholder="Tìm kiếm tour (theo tiêu đề)"
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
                                Thêm mới tour
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ gridColumn: "span 12" }}>
                    <Box
                        height="75vh"
                        sx={{
                            "& .MuiDataGrid-root": { border: "none", width: "100%" },
                            "& .MuiDataGrid-main": { width: "100%" },
                            "& .MuiDataGrid-cell": { borderBottom: "none" },
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
                                rows={tours}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                disableSelectionOnClick
                                getRowHeight={() => 80}
                                sx={{ width: "100%" }}
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
                    {isEdit ? "Chỉnh sửa tour" : "Thêm mới tour"}
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
                        value={newTour.title}
                        onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Giá"
                        type="number"
                        value={newTour.price}
                        onChange={(e) => setNewTour({ ...newTour, price: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="% Giảm giá"
                        type="number"
                        value={newTour.discount}
                        onChange={(e) => setNewTour({ ...newTour, discount: e.target.value })}
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                            value={newTour.category_id}
                            onChange={(e) => setNewTour({ ...newTour, category_id: e.target.value })}
                            required
                        >
                            {getFilteredCategories().map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.title} {category.status === "inactive" ? "(Tạm ngưng)" : ""}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {newTour.timeStarts.map((time, index) => (
                        <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Ngày khởi hành"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={time.timeDepart}
                                onChange={(e) => {
                                    const updatedTimes = [...newTour.timeStarts];
                                    updatedTimes[index].timeDepart = e.target.value;
                                    setNewTour({ ...newTour, timeStarts: updatedTimes });
                                    const sameDateCount = updatedTimes.filter(t => t.timeDepart === e.target.value).length;
                                    if (sameDateCount > 1) {
                                        toast.warn("Ngày khởi hành bị trùng, số lượng sẽ được cộng lại!", { position: "top-right" });
                                    }
                                }}
                                required
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Số lượng"
                                type="number"
                                value={time.stock}
                                onChange={(e) => {
                                    const updatedTimes = [...newTour.timeStarts];
                                    updatedTimes[index].stock = e.target.value;
                                    setNewTour({ ...newTour, timeStarts: updatedTimes });
                                }}
                                required
                                inputProps={{ min: 0 }}
                            />
                            {newTour.timeStarts.length > 1 && (
                                <Button
                                    onClick={() => {
                                        const updatedTimes = newTour.timeStarts.filter((_, i) => i !== index);
                                        setNewTour({ ...newTour, timeStarts: updatedTimes });
                                    }}
                                    color="error"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        fontSize: "12px",
                                        padding: "4px 8px",
                                        minWidth: "60px",
                                    }}
                                >
                                    Xóa
                                </Button>
                            )}
                        </Box>
                    ))}
                    <Button
                        onClick={() =>
                            setNewTour({
                                ...newTour,
                                timeStarts: [...newTour.timeStarts, { timeDepart: "", stock: "" }],
                            })
                        }
                        variant="outlined"
                    >
                        Thêm ngày khởi hành
                    </Button>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Thông tin"
                        multiline
                        rows={3}
                        value={newTour.information}
                        onChange={(e) => setNewTour({ ...newTour, information: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Lịch trình"
                        multiline
                        rows={3}
                        value={newTour.schedule}
                        onChange={(e) => setNewTour({ ...newTour, schedule: e.target.value })}
                        required
                    />
                    <Box mt={2}>
                        <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="images-upload"
                            type="file"
                            multiple
                            onChange={(e) => setNewTour({ ...newTour, images: Array.from(e.target.files) })}
                        />
                        <label htmlFor="images-upload">
                            <Button variant="contained" component="span" color="primary">
                                Chọn ảnh
                            </Button>
                        </label>
                        {newTour.images.length > 0 && (
                            <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                                {newTour.images.map((image, index) => (
                                    <Box
                                        key={index}
                                        component="img"
                                        src={typeof image === "string" ? image : URL.createObjectURL(image)}
                                        alt={`Tour Preview ${index}`}
                                        sx={{
                                            width: 100,
                                            height: 60,
                                            objectFit: "cover",
                                            borderRadius: 1,
                                        }}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/100";
                                        }}
                                    />
                                ))}
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

            {/* Modal chi tiết */}
            <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="xs" fullWidth>
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                        textAlign: "center",
                    }}
                >
                    Chi tiết tour
                </DialogTitle>
                <DialogContent>
                    {currentTour ? (
                        <Box color={colors.grey[100]} mb={1}>
                            <Typography variant="h6">
                                <strong>Tiêu đề:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentTour.title || "Không xác định"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Mã tour:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentTour.code || "Không xác định"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Giá:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentTour.price || 0}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>% Giảm giá:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentTour.discount || 0}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Danh mục:</strong>
                                <span style={{ marginLeft: "8px" }}>
                                    {categories.find((cat) => cat._id === currentTour.category_id)?.title || "Không xác định"}
                                </span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Hình ảnh:</strong>
                                <Box display="flex" gap={1} mt={1}>
                                    {currentTour.images && currentTour.images.length > 0 ? (
                                        currentTour.images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Tour ${index}`}
                                                style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "4px" }}
                                            />
                                        ))
                                    ) : (
                                        <Typography>Không có ảnh</Typography>
                                    )}
                                </Box>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Ngày khởi hành:</strong>
                                <ul>
                                    {currentTour.timeStarts.map((time, index) => (
                                        <li key={index}>
                                            {new Date(time.timeDepart).toLocaleDateString("vi-VN")} - Số lượng: {time.stock}
                                        </li>
                                    ))}
                                </ul>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Thông tin:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentTour.information || "Không xác định"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Lịch trình:</strong>
                                <span style={{ marginLeft: "8px" }}>{currentTour.schedule || "Không xác định"}</span>
                            </Typography>
                            <Typography variant="h6">
                                <strong>Trạng thái:</strong>
                                <span style={{ marginLeft: "8px" }}>
                                    {currentTour.status === "active" ? "Hoạt động" : "Tạm ngưng"}
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
                    Xác nhận xóa tour
                </DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa tour này không?</Typography>
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
                        src={selectedImage || "https://via.placeholder.com/100"}
                        alt="Tour"
                        sx={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                        }}
                    />
                    {currentTourImages.length > 1 && (
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

export default TourControl;