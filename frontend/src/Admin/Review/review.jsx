import { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, useTheme, Paper, InputBase, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import Header from "../../components/Scenes/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHotelReviews, getRoomReviews, deleteReview, getHotels } from "./reviewApi";
import { useAdminAuth } from "../../context/AdminContext";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
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
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [rowCount, setRowCount] = useState(0);

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
                    // Chọn khách sạn đầu tiên mặc định
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

    // Lấy danh sách đánh giá
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
            if (response.code === 200 && Array.isArray(response.data)) {
                setAllReviews(response.data);
                setReviews(response.data);
                setRowCount(response.total || response.data.length);
                if (response.data.length === 0) {
                    toast.info("Không có đánh giá nào để hiển thị!", { position: "top-right" });
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách đánh giá!", { position: "top-right" });
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

    // Tự động lấy đánh giá của khách sạn đầu tiên khi selectedHotel thay đổi
    useEffect(() => {
        if (selectedHotel?._id) {
            fetchReviews(selectedHotel._id);
        }
    }, [selectedHotel, paginationModel]);

    // Xử lý tìm kiếm ở frontend
    useEffect(() => {
        const filteredReviews = allReviews.filter((review) =>
            review.comment?.toLowerCase().includes(searchText.toLowerCase())
        );
        setReviews(filteredReviews);
    }, [searchText, allReviews]);

    // Xử lý thay đổi khách sạn
    const handleHotelChange = (event) => {
        const hotelId = event.target.value;
        const hotel = hotels.find((h) => h._id === hotelId) || null;
        setSelectedHotel(hotel);
    };

    // Xử lý xóa đánh giá
    const handleDelete = async (reviewId) => {
        if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
            try {
                const response = await deleteReview(reviewId, adminToken);
                if (response.code === 200) {
                    setReviews(reviews.filter(review => review._id !== reviewId));
                    setAllReviews(allReviews.filter(review => review._id !== reviewId));
                    setRowCount(rowCount - 1);
                    toast.success("Xóa đánh giá thành công!", { position: "top-right" });
                } else {
                    toast.error(response.message || "Xóa đánh giá thất bại!", { position: "top-right" });
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Xóa đánh giá thất bại!", { position: "top-right" });
            }
        }
    };

    // Xử lý tìm kiếm thủ công
    const handleSearch = (e) => {
        e.preventDefault();
        const filteredReviews = allReviews.filter((review) =>
            review.comment?.toLowerCase().includes(searchText.toLowerCase())
        );
        setReviews(filteredReviews);
    };

    // Cột của DataGrid
    const columns = [
        {
            field: "user_id",
            headerName: "Người dùng",
            flex: 1,
            renderCell: ({ row }) => row.user_id?.username || "N/A",
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
            field: "actions",
            headerName: "Hành động",
            flex: 0.7,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 1, mt: "9px" }}>
                    <IconButton
                        onClick={() => handleDelete(row._id)}
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
        </Box>
    );
};

export default Reviews;