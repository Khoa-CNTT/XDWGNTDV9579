import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Button,
    Dialog,
    TextField,
    CircularProgress,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    IconButton,
    DialogContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { Formik } from "formik";
import * as yup from "yup";
import { getHotels, getRooms, createRoom, updateRoom, deleteRoom } from "./HotelApi";
import { useAdminAuth } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const RoomManagement = ({ open = false, onClose, hotel: propHotel, selectedHotelId, selectedHotelName, onSuccess }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Debug props và state
    useEffect(() => {
        console.log("RoomManagement props:", { open, propHotel, selectedHotelId, selectedHotelName });
        console.log("Selected Hotel:", selectedHotel);
        console.log("Rooms:", rooms);
    }, [open, propHotel, selectedHotelId, selectedHotelName, selectedHotel, rooms]);

    // Lấy danh sách khách sạn
    const fetchHotels = async () => {
        setLoading(true);
        try {
            const response = await getHotels();
            console.log("getHotels response:", response);
            if (response.code === 200 && Array.isArray(response.data)) {
                setHotels(response.data);
                // Nếu có selectedHotelId, tìm và set selectedHotel
                if (selectedHotelId) {
                    const matchedHotel = response.data.find(h => h._id === selectedHotelId);
                    if (matchedHotel) {
                        setSelectedHotel(matchedHotel);
                        fetchRooms(selectedHotelId);
                    }
                }
                if (response.data.length === 0) {
                    toast.info("Không có khách sạn nào để hiển thị!");
                }
            } else {
                toast.error(response.message || "Không thể tải danh sách khách sạn!");
                setHotels([]);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách khách sạn!";
            console.error("Fetch hotels error:", err.response?.data || err);
            toast.error(errorMessage);
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách phòng
    const fetchRooms = async (hotelId) => {
        if (!hotelId) {
            console.error("No hotel ID provided");
            setRooms([]);
            return;
        }
        setLoading(true);
        try {
            const response = await getRooms(hotelId);
            console.log("getRooms response:", response);
            if (response.code === 200 && Array.isArray(response.data)) {
                const formattedData = response.data.map((item, index) => ({
                    ...item,
                    id: item._id,
                    stt: index + 1,
                }));
                setRooms(formattedData);
                console.log("Rooms loaded:", formattedData);
                if (formattedData.length === 0) {
                    toast.info("Không có phòng nào để hiển thị!");
                }
            } else {
                console.error("Invalid response:", response);
                toast.error(response.message || "Không thể tải danh sách phòng!");
                setRooms([]);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách phòng!";
            console.error("Fetch rooms error:", err.response?.data || err);
            toast.error(errorMessage);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchHotels khi component mount và khi open thay đổi
    useEffect(() => {
        if (open && adminToken) {
            fetchHotels();
        }
    }, [open, adminToken, selectedHotelId]);

    // Xử lý chọn khách sạn
    const handleHotelChange = (event) => {
        const hotelId = event.target.value;
        const hotel = hotels.find((h) => h._id === hotelId) || null;
        console.log("Selected hotel:", hotel);
        setSelectedHotel(hotel);
        if (hotel) {
            fetchRooms(hotel._id);
        } else {
            setRooms([]);
        }
    };

    // Mở form thêm/chỉnh sửa
    const handleOpenForm = (room = null) => {
        if (!selectedHotel?._id) {
            toast.error("Vui lòng chọn một khách sạn trước!");
            console.log("Không thể mở form, không có selectedHotel");
            return;
        }
        setCurrentRoomId(room?._id || null);
        setIsEdit(room !== null);
        setOpenForm(true);
        console.log("Mở form, room:", room);
    };

    // Đóng form
    const handleCloseForm = () => {
        setOpenForm(false);
        setCurrentRoomId(null);
        console.log("Đóng form");
    };

    // Xử lý xóa phòng
    const handleDelete = async (roomId) => {
        if (!selectedHotel?._id) {
            toast.error("Vui lòng chọn một khách sạn trước!");
            console.log("Không thể xóa phòng, không có selectedHotel");
            return;
        }
        if (window.confirm("Bạn có chắc muốn xóa phòng này?")) {
            console.log("Xóa phòng, roomId:", roomId);
            try {
                const response = await deleteRoom(selectedHotel._id, roomId);
                console.log("Phản hồi từ deleteRoom:", response);
                if (response.code === 200) {
                    setRooms(rooms.filter(room => room._id !== roomId));
                    toast.success("Xóa phòng thành công!");
                } else {
                    toast.error(response.message || "Xóa phòng thất bại!");
                }
            } catch (err) {
                console.error("Lỗi khi gọi deleteRoom:", err.response?.data || err);
                toast.error(err.response?.data?.message || "Xóa phòng thất bại!");
            }
        }
    };

    const handleImageClick = (images, index) => {
        setSelectedImage(images[index]);
        setCurrentImageIndex(index);
        setOpenImageDialog(true);
    };

    const handleNextImage = (images) => {
        const nextIndex = (currentImageIndex + 1) % images.length;
        setSelectedImage(images[nextIndex]);
        setCurrentImageIndex(nextIndex);
    };

    const handlePrevImage = (images) => {
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        setSelectedImage(images[prevIndex]);
        setCurrentImageIndex(prevIndex);
    };

    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setSelectedImage(null);
        setCurrentImageIndex(0);
    };

    // Cột của DataGrid
    const columns = [
        { field: "stt", headerName: "STT", flex: 0.3 },
        { field: "name", headerName: "Tên phòng", flex: 1 },
        {
            field: "price",
            headerName: "Giá (VND)",
            flex: 1,
            renderCell: ({ value }) => (value ? value.toLocaleString("vi-VN") : "N/A"),
        },
        { field: "amenities", headerName: "Tiện nghi", flex: 1 },
        { field: "availableRooms", headerName: "Số phòng sẵn có", flex: 1 },
        {
            field: "images",
            headerName: "Ảnh",
            flex: 1,
            renderCell: ({ value }) => (
                <Box display="flex" gap={1} sx={{ py: 1 }}>
                    {value && value.length > 0 ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                                onClick={() => handlePrevImage(value)}
                                disabled={value.length <= 1}
                                sx={{
                                    color: colors.grey[100],
                                    "&:hover": {
                                        backgroundColor: colors.blueAccent[700],
                                    },
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <Box
                                component="img"
                                src={value[currentImageIndex % value.length]}
                                alt={`Room ${currentImageIndex}`}
                                onClick={() => handleImageClick(value, currentImageIndex % value.length)}
                                sx={{
                                    width: 60,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                    cursor: "pointer",
                                    "&:hover": {
                                        opacity: 0.8,
                                    },
                                }}
                            />
                            <IconButton
                                onClick={() => handleNextImage(value)}
                                disabled={value.length <= 1}
                                sx={{
                                    color: colors.grey[100],
                                    "&:hover": {
                                        backgroundColor: colors.blueAccent[700],
                                    },
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>
                    ) : (
                        <Typography variant="caption" sx={{ py: 1 }}>Chưa có ảnh</Typography>
                    )}
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            renderCell: ({ row }) => (
                <Box display="flex" gap={1} sx={{ py: 1 }}>
                    <IconButton
                        onClick={() => handleOpenForm(row)}
                        sx={{
                            backgroundColor: colors.blueAccent[700],
                            color: "white",
                            "&:hover": {
                                backgroundColor: colors.blueAccent[600],
                            },
                        }}
                    >
                        <EditIcon />
                    </IconButton>
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

    // Component form phòng
    const RoomForm = ({ room, onClose, onSuccess }) => {
        const [imagePreviews, setImagePreviews] = useState(room?.images || []);
        const [formLoading, setFormLoading] = useState(false);

        // Xử lý chọn ảnh
        const handleImagesChange = (event, setFieldValue) => {
            const files = Array.from(event.target.files);
            if (files.length + imagePreviews.length > 10) {
                toast.error("Tối đa 10 ảnh!");
                console.log("Quá nhiều ảnh được chọn:", files.length);
                return;
            }
            setFieldValue("images", files);
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...previews]);
            console.log("Ảnh được chọn, imagePreviews:", imagePreviews);
        };

        // Xử lý submit form
        const handleFormSubmit = async (values) => {
            setFormLoading(true);
            console.log("Gửi form, values:", values);
            try {
                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("price", parseFloat(values.price));
                formData.append("amenities", values.amenities);
                formData.append("availableRooms", parseInt(values.availableRooms));
                if (values.images) {
                    values.images.forEach(file => formData.append("images", file));
                }

                let response;
                if (room) {
                    response = await updateRoom(selectedHotel._id, room._id, formData);
                    console.log("Phản hồi từ updateRoom:", response);
                } else {
                    response = await createRoom(selectedHotel._id, formData);
                    console.log("Phản hồi từ createRoom:", response);
                }

                if (response.code === 200) {
                    toast.success(room ? "Cập nhật phòng thành công!" : "Thêm phòng thành công!");
                    onSuccess(response.data);
                    onClose();
                    fetchRooms(selectedHotel._id);
                } else {
                    toast.error(response.message || "Thao tác thất bại!");
                }
            } catch (err) {
                console.error("Lỗi khi gửi form:", err.response?.data || err);
                if (err.response?.status === 400) {
                    const errorMessage = err.response?.data?.message ||
                        err.response?.data?.errors?.join(", ") ||
                        "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!";
                    toast.error(errorMessage);
                } else if (err.response?.status === 401) {
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    localStorage.removeItem("adminToken");
                    navigate("/loginadmin");
                } else {
                    toast.error(err.response?.data?.message || "Thao tác thất bại!");
                }
            } finally {
                setFormLoading(false);
            }
        };

        return (
            <Box>
                <Typography variant="h4" mb={2}>
                    {room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
                </Typography>
                <Formik
                    onSubmit={handleFormSubmit}
                    initialValues={room ? {
                        name: room.name || "",
                        price: room.price ? room.price.toString() : "",
                        amenities: room.amenities || "",
                        availableRooms: room.availableRooms ? room.availableRooms.toString() : "",
                        images: null,
                    } : initialValues}
                    validationSchema={roomSchema}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box
                                display="grid"
                                gap="20px"
                                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                sx={{ "& > div": { gridColumn: "span 4" } }}
                            >
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography variant="body1" mb={1}>
                                        Ảnh phòng
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                                        {imagePreviews.length > 0 ? (
                                            imagePreviews.map((preview, index) => (
                                                <Avatar
                                                    key={index}
                                                    src={preview}
                                                    alt={`Preview ${index}`}
                                                    sx={{ width: 60, height: 60 }}
                                                />
                                            ))
                                        ) : (
                                            <Typography variant="caption">Chưa có ảnh</Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        color="primary"
                                        sx={{ mb: 1 }}
                                    >
                                        Chọn ảnh (tối đa 10)
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleImagesChange(e, setFieldValue)}
                                        />
                                    </Button>
                                </Box>

                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="Tên phòng"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.name}
                                    name="name"
                                    error={!!touched.name && !!errors.name}
                                    helperText={touched.name && errors.name}
                                />
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="number"
                                    label="Giá phòng (VND)"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.price}
                                    name="price"
                                    error={!!touched.price && !!errors.price}
                                    helperText={touched.price && errors.price}
                                />
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label="Tiện nghi"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.amenities}
                                    name="amenities"
                                    error={!!touched.amenities && !!errors.amenities}
                                    helperText={touched.amenities && errors.amenities}
                                    multiline
                                    rows={3}
                                />
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="number"
                                    label="Số phòng sẵn có"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.availableRooms}
                                    name="availableRooms"
                                    error={!!touched.availableRooms && !!errors.availableRooms}
                                    helperText={touched.availableRooms && errors.availableRooms}
                                />
                            </Box>
                            <Box display="flex" justifyContent="end" mt="20px" gap={2}>
                                <Button
                                    variant="contained"
                                    onClick={onClose}
                                    disabled={formLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    color="secondary"
                                    variant="contained"
                                    disabled={formLoading}
                                >
                                    {formLoading ? "Đang xử lý..." : room ? "Cập nhật" : "Thêm"}
                                </Button>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Box>
        );
    };

    // Ghi log danh sách khách sạn trước khi render dropdown
    console.log("Render dropdown, hotels:", hotels);

    return (
        <Box m="20px">
            <Typography variant="h3" color={colors.grey[100]} mb={2}>
                Quản lý phòng
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
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
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    disabled={!selectedHotel?._id || loading}
                >
                    Thêm phòng
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                    <Typography ml={2}>Đang tải danh sách khách sạn...</Typography>
                </Box>
            ) : hotels.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Không có khách sạn nào để quản lý phòng!
                    </Typography>
                </Box>
            ) : !selectedHotel?._id ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Vui lòng chọn một khách sạn để quản lý phòng!
                    </Typography>
                </Box>
            ) : loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                    <Typography ml={2}>Đang tải danh sách phòng...</Typography>
                </Box>
            ) : rooms.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Không có phòng nào để hiển thị
                    </Typography>
                </Box>
            ) : (
                <Box
                    height="60vh"
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
                    <DataGrid
                        rows={rooms}
                        columns={columns}
                        getRowId={(row) => row._id}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50]}
                    />
                </Box>
            )}

            <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
                <Box
                    sx={{
                        bgcolor: colors.primary[400],
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <RoomForm
                        room={selectedHotel ? rooms.find(r => r._id === currentRoomId) : null}
                        onClose={handleCloseForm}
                        onSuccess={(newRoom) => {
                            setRooms(selectedHotel ? rooms.map(room => room._id === newRoom._id ? { ...newRoom, id: newRoom._id, stt: rooms.find(r => r._id === newRoom._id).stt } : room) : [...rooms, { ...newRoom, id: newRoom._id, stt: rooms.length + 1 }]);
                            handleCloseForm();
                        }}
                    />
                </Box>
            </Dialog>

            {/* Dialog xem ảnh to */}
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
                        alt="Room image"
                        sx={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                    <IconButton
                        onClick={handleCloseImageDialog}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: "white",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedImage && rooms.find(r => r.images.includes(selectedImage))?.images.length > 1 && (
                        <>
                            <IconButton
                                onClick={() => handlePrevImage(rooms.find(r => r.images.includes(selectedImage)).images)}
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
                                onClick={() => handleNextImage(rooms.find(r => r.images.includes(selectedImage)).images)}
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

const roomSchema = yup.object().shape({
    name: yup.string().required("Vui lòng nhập tên phòng"),
    price: yup
        .number()
        .required("Vui lòng nhập giá phòng")
        .positive("Giá phòng phải là số dương"),
    amenities: yup.string().required("Vui lòng nhập tiện nghi"),
    availableRooms: yup
        .number()
        .required("Vui lòng nhập số phòng sẵn có")
        .integer("Số phòng phải là số nguyên")
        .min(0, "Số phòng không được âm"),
});

const initialValues = {
    name: "",
    price: "",
    amenities: "",
    availableRooms: "",
    images: null,
};

export default RoomManagement;