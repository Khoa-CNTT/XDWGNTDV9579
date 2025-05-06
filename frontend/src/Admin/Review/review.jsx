import { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, useTheme, Paper, InputBase, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import Header from "../../components/Scenes/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHotelReviews, getHotels, deleteReview } from "./reviewApi";
import { getContactDetail } from "../contacts/ContactsApi";
import { useAdminAuth } from "../../context/AdminContext";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

const Reviews = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const { adminToken } = useAdminAuth();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [userCache, setUserCache] = useState({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [rowCount, setRowCount] = useState(0);
    const [selectedReview, setSelectedReview] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [viewedReviews, setViewedReviews] = useState(() => {
        // Load viewed reviews from localStorage
        const saved = localStorage.getItem("viewedReviews");
        return saved ? JSON.parse(saved) : {};
    });

    // Save viewed reviews to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("viewedReviews", JSON.stringify(viewedReviews));
    }, [viewedReviews]);

    // Lấy danh sách khách sạn
    const fetchHotels = async () => {
        setLoading(true);
        try {
            const response = await getHotels(adminToken);
            if (response.code === 200 && Array.isArray(response.data)) {
                setHotels(response.data);
                if (response.data.length === 0) {
                    toast.info("Không có khách sạn nào để hiển thị!", { position: "top-right" });
                } else {
                    setSelectedHotel(response.data[0]);
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách khách sạn!", { position: "top-right" });
                setHotels([]);
            }
        } catch (err) {
            console.error("Error fetching hotels:", err);
            toast.error(err.response?.data?.message || "Không thể tải danh sách khách sạn!", { position: "top-right" });
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("adminToken");
                navigate("/loginadmin");
            }
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy tổng số đánh giá
    const fetchTotalReviews = async (hotelId) => {
        try {
            const response = await getHotelReviews(hotelId, {
                page: 1,
                limit: 9999,
                sortKey: "createdAt",
                sortValue: "desc",
            }, adminToken);
            return Array.isArray(response) ? response.length : 0;
        } catch (err) {
            console.error("Error fetching total reviews:", err);
            return 0;
        }
    };

    // Lấy thông tin người dùng dựa trên user_id
    const fetchUserDetails = async (userId) => {
        if (userCache[userId]) {
            return userCache[userId];
        }
        try {
            const response = await getContactDetail(userId, adminToken);
            if (response.code === 200 && response.data) {
                const userData = {
                    username: response.data.username || response.data.fullName || "N/A",
                    email: response.data.email || "N/A",
                };
                setUserCache((prev) => ({ ...prev, [userId]: userData }));
                return userData;
            }
            return { username: "N/A", email: "N/A" };
        } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            return { username: "N/A", email: "N/A" };
        }
    };

    // Lấy danh sách đánh giá và thông tin người dùng
    const fetchReviews = async (hotelId) => {
        if (!hotelId) return;
        setLoading(true);
        try {
            const response = await getHotelReviews(hotelId, {
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
                sortKey: "createdAt",
                sortValue: "desc",
            }, adminToken);
            if (Array.isArray(response)) {
                setAllReviews(response);
                const reviewsWithUsers = await Promise.all(
                    response.map(async (review, index) => {
                        const userData = await fetchUserDetails(review.user_id);
                        return {
                            ...review,
                            userData,
                            stt: index + 1 + paginationModel.page * paginationModel.pageSize,
                            viewed: !!viewedReviews[review._id],
                        };
                    })
                );
                setReviews(reviewsWithUsers);
                const total = await fetchTotalReviews(hotelId);
                setRowCount(total);
                if (response.length === 0) {
                    toast.info("Không có đánh giá nào để hiển thị!", { position: "top-right" });
                }
            } else {
                toast.error("Dữ liệu đánh giá không hợp lệ!", { position: "top-right" });
                setReviews([]);
                setAllReviews([]);
                setRowCount(0);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            toast.error(err.response?.data?.message || "Không thể tải danh sách đánh giá!", { position: "top-right" });
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("adminToken");
                navigate("/loginadmin");
            }
            setReviews([]);
            setAllReviews([]);
            setRowCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        if (token) {
            fetchHotels();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                navigate("/loginadmin");
            }, 2000);
        }
    }, [adminToken, navigate]);

    useEffect(() => {
        if (selectedHotel?._id) {
            fetchReviews(selectedHotel._id);
        }
    }, [selectedHotel, paginationModel]);

    useEffect(() => {
        const filteredReviews = allReviews.filter((review) =>
            review.comment?.toLowerCase().includes(searchText.toLowerCase())
        );
        const updateFilteredReviews = async () => {
            const reviewsWithUsers = await Promise.all(
                filteredReviews.map(async (review, index) => {
                    const userData = await fetchUserDetails(review.user_id);
                    return {
                        ...review,
                        userData,
                        stt: index + 1 + paginationModel.page * paginationModel.pageSize,
                        viewed: !!viewedReviews[review._id],
                    };
                })
            );
            setReviews(reviewsWithUsers);
        };
        updateFilteredReviews();
    }, [searchText, allReviews, viewedReviews]);

    const handleHotelChange = (event) => {
        const hotelId = event.target.value;
        const hotel = hotels.find((h) => h._id === hotelId) || null;
        setSelectedHotel(hotel);
        setPaginationModel({ ...paginationModel, page: 0 });
    };

    const handleDelete = async (reviewId) => {
        try {
            const response = await deleteReview(reviewId, adminToken);
            if (response.code === 200) {
                setReviews(reviews.filter(review => review._id !== reviewId));
                setAllReviews(allReviews.filter(review => review._id !== reviewId));
                setRowCount(rowCount - 1);
                // Remove from viewedReviews
                setViewedReviews(prev => {
                    const newViewed = { ...prev };
                    delete newViewed[reviewId];
                    return newViewed;
                });
                toast.success("Xóa đánh giá thành công!", { position: "top-right" });
            } else {
                toast.error(response.message || "Xóa đánh giá thất bại!", { position: "top-right" });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa đánh giá thất bại!", { position: "top-right" });
        }
    };

    const handleOpenDeleteModal = (reviewId) => {
        setReviewToDelete(reviewId);
        setOpenDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setReviewToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (reviewToDelete) {
            handleDelete(reviewToDelete);
            handleCloseDeleteModal();
        }
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setOpenModal(true);
        if (!viewedReviews[review._id]) {
            setViewedReviews(prev => ({
                ...prev,
                [review._id]: true
            }));
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedReview(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const filteredReviews = allReviews.filter((review) =>
            review.comment?.toLowerCase().includes(searchText.toLowerCase())
        );
        setReviews(filteredReviews);
    };

    const columns = [
        {
            field: "stt",
            headerName: "STT",
            flex: 0.5,
            renderCell: ({ row }) => row.stt,
        },
        {
            field: "user_id",
            headerName: "Người dùng",
            flex: 1,
            renderCell: ({ row }) => row.userData?.username || "N/A",
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1,
            renderCell: ({ row }) => row.userData?.email || "N/A",
        },
        {
            field: "rating",
            headerName: "Điểm đánh giá",
            flex: 0.7,
            renderCell: ({ row }) => `${row.rating}/5`,
        },
        {
            field: "comment",
            headerName: "Bình luận",
            flex: 2,
            renderCell: ({ row }) => row.comment || "Không có bình luận",
        },
        {
            field: "createdAt",
            headerName: "Ngày tạo",
            flex: 1,
            renderCell: ({ row }) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
        },
        {
            field: "viewed",
            headerName: "Đã xem",
            flex: 0.7,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    {row.viewed ? <VisibilityIcon color="success" /> : <VisibilityOffIcon color="error" />}
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 1, mt: "9px" }}>
                    <IconButton
                        onClick={() => handleViewReview(row)}
                        sx={{
                            backgroundColor: colors.blueAccent[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.blueAccent[600],
                            },
                        }}
                    >
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleOpenDeleteModal(row._id)}
                        sx={{
                            backgroundColor: colors.redAccent[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.redAccent[600],
                            },
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
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
            <Header title="QUẢN LÝ ĐÁNH GIÁ" />
            <Box display="flex" justifyContent="space-between" mb="20px" gap={2}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="hotel-select-label">Chọn khách sạn</InputLabel>
                    <Select
                        labelId="hotel-select-label"
                        value={selectedHotel?._id || ""}
                        label="Chọn khách sạn"
                        onChange={handleHotelChange}
                        disabled={loading}
                    >
                        <MenuItem value="">
                            <em>{loading ? "Đang tải..." : "Chọn khách sạn"}</em>
                        </MenuItem>
                        {hotels.map((hotel) => (
                            <MenuItem key={hotel._id} value={hotel._id}>
                                {hotel.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                        placeholder="Tìm kiếm theo bình luận"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <IconButton type="submit" sx={{ p: "10px" }}>
                        <SearchIcon />
                    </IconButton>
                </Paper>
            </Box>
            <Box
                m="40px 0 0 0"
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
                    <Typography variant="h6" align="center" mt={4}>
                        Đang tải...
                    </Typography>
                ) : hotels.length === 0 ? (
                    <Box textAlign="center" mt={4}>
                        <Typography variant="h6">
                            Không có khách sạn nào để hiển thị
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate("/loginadmin")}
                            sx={{ mt: 2 }}
                        >
                            Đăng nhập lại
                        </Button>
                    </Box>
                ) : !selectedHotel?._id ? (
                    <Typography variant="h6" align="center" mt={4}>
                        Vui lòng chọn một khách sạn để xem đánh giá
                    </Typography>
                ) : reviews.length === 0 ? (
                    <Typography variant="h6" align="center" mt={4}>
                        Không có đánh giá nào để hiển thị
                    </Typography>
                ) : (
                    <DataGrid
                        rows={reviews}
                        columns={columns}
                        getRowId={(row) => row._id}
                        pagination
                        paginationMode="server"
                        rowCount={rowCount}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 20]}
                    />
                )}
            </Box>
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem", textAlign: "center" }}>
                    Chi tiết đánh giá
                </DialogTitle>
                <DialogContent>
                    {selectedReview && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Người dùng:</span> {selectedReview.userData?.username || "N/A"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Email:</span> {selectedReview.userData?.email || "N/A"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Điểm đánh giá:</span> {selectedReview.rating}/5
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Bình luận:</span> {selectedReview.comment || "Không có bình luận"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Ngày tạo:</span> {new Date(selectedReview.createdAt).toLocaleDateString("vi-VN")}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <span style={{ fontWeight: "bold" }}>Trạng thái:</span> {selectedReview.viewed ? "Đã xem" : "Chưa xem"}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseModal}
                        sx={{
                            backgroundColor: colors.redAccent[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.redAccent[600],
                            },
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDeleteModal}
                onClose={handleCloseDeleteModal}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", textAlign: "center" }}>
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                        Bạn có chắc chắn muốn xóa đánh giá này?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ gap: 2 }}>
                    <Button
                        onClick={handleCloseDeleteModal}
                        sx={{
                            backgroundColor: colors.grey[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.grey[600],
                            },
                        }}
                    >
                       Đóng
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        sx={{
                            backgroundColor: colors.redAccent[500],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.redAccent[600],
                            },
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reviews;