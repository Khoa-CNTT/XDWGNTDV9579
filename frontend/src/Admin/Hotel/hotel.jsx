import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Modal,
  IconButton,
  useTheme,
  Paper,
  InputBase,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import Header from "../../components/Scenes/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHotels, createHotel, updateHotel, changeHotelStatus, deleteHotel } from "./HotelApi";
import { useAdminAuth } from "../../context/AdminContext";
import RoomManagement from "./RoomManagement";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";

const Hotels = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { adminToken } = useAdminAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("none");
  const [sortModel, setSortModel] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limitItems = 10;
  const [totalPages, setTotalPages] = useState(1);

  const fetchHotels = useCallback(
    async (page = 1, search = "", status = "all", sortKey = "", sortValue = "") => {
      setLoading(true);
      try {
        const token = adminToken || localStorage.getItem("adminToken");
        const params = { page, limit: limitItems };
        if (search) params.search = search;
        if (status !== "all") params.status = status;
        if (sortKey && sortValue) {
          params.sortKey = sortKey;
          params.sortValue = sortValue;
        }
        console.log("Fetching hotels with params:", params);
        const response = await getHotels(token, params);
        console.log("API response:", response);
        if (response.code === 200 && Array.isArray(response.data)) {
          const totalRecords = response.totalRecords || response.data.length;
          const formattedHotels = response.data.map((hotel, index) => {
            let stt;
            if (sortKey === "_id" && sortValue === "desc") {
              stt = totalRecords - ((page - 1) * limitItems + index);
            } else {
              stt = (page - 1) * limitItems + index + 1;
            }
            return { ...hotel, stt };
          });
          setHotels(formattedHotels);
          setTotalPages(response.totalPage || 1);
          if (formattedHotels.length === 0) {
            toast.info(
              search
                ? `Không tìm thấy khách sạn nào với từ khóa "${search}"!`
                : "Không có khách sạn nào để hiển thị!",
              { position: "top-right" }
            );
          }
        } else {
          toast.error(response.message || "Không thể tải danh sách khách sạn!", {
            position: "top-right",
          });
          setHotels([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Fetch hotels error:", err);
        if (err.response?.status === 400) {
          toast.error("Bạn không có quyền xem danh sách khách sạn. Vui lòng kiểm tra quyền tài khoản!", {
            position: "top-right",
          });
        } else if (err.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          localStorage.removeItem("adminToken");
          navigate("/loginadmin");
        } else {
          toast.error(err.response?.data?.message || "Không thể tải danh sách khách sạn!", {
            position: "top-right",
          });
        }
        setHotels([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [adminToken, navigate, limitItems]
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value, status, sortKey, sortValue) => {
      setCurrentPage(1);
      fetchHotels(1, value, status, sortKey, sortValue);
    }, 500),
    [fetchHotels]
  );

  useEffect(() => {
    const token = adminToken || localStorage.getItem("adminToken");
    if (token) {
      fetchHotels(currentPage, searchText, statusFilter);
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      setTimeout(() => {
        navigate("/loginadmin");
      }, 2000);
    }
  }, [adminToken, navigate, currentPage, fetchHotels]);

  const handleSearchTextChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    let sortKey = "";
    let sortValue = "";
    switch (sortOption) {
      case "stt_asc":
        sortKey = "_id";
        sortValue = "asc";
        break;
      case "stt_desc":
        sortKey = "_id";
        sortValue = "desc";
        break;
      case "name_asc":
        sortKey = "name";
        sortValue = "asc";
        break;
      case "name_desc":
        sortKey = "name";
        sortValue = "desc";
        break;
      case "city_asc":
        sortKey = "location.city";
        sortValue = "asc";
        break;
      case "city_desc":
        sortKey = "location.city";
        sortValue = "desc";
        break;
      case "address_asc":
        sortKey = "location.address";
        sortValue = "asc";
        break;
      case "address_desc":
        sortKey = "location.address";
        sortValue = "desc";
        break;
      case "status_asc":
        sortKey = "status";
        sortValue = "asc";
        break;
      case "status_desc":
        sortKey = "status";
        sortValue = "desc";
        break;
      default:
        break;
    }
    debouncedSearch(value, statusFilter, sortKey, sortValue);
  };

  const handleStatusFilterChange = (event) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(1);
    let sortKey = "";
    let sortValue = "";
    switch (sortOption) {
      case "stt_asc":
        sortKey = "_id";
        sortValue = "asc";
        break;
      case "stt_desc":
        sortKey = "_id";
        sortValue = "desc";
        break;
      case "name_asc":
        sortKey = "name";
        sortValue = "asc";
        break;
      case "name_desc":
        sortKey = "name";
        sortValue = "desc";
        break;
      case "city_asc":
        sortKey = "location.city";
        sortValue = "asc";
        break;
      case "city_desc":
        sortKey = "location.city";
        sortValue = "desc";
        break;
      case "address_asc":
        sortKey = "location.address";
        sortValue = "asc";
        break;
      case "address_desc":
        sortKey = "location.address";
        sortValue = "desc";
        break;
      case "status_asc":
        sortKey = "status";
        sortValue = "asc";
        break;
      case "status_desc":
        sortKey = "status";
        sortValue = "desc";
        break;
      default:
        break;
    }
    fetchHotels(1, searchText, newStatus, sortKey, sortValue);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortOption(value);
    setCurrentPage(1);
    let sortKey = "";
    let sortValue = "";
    let sortField = "";
    switch (value) {
      case "stt_asc":
        sortKey = "_id";
        sortValue = "asc";
        sortField = "stt";
        break;
      case "stt_desc":
        sortKey = "_id";
        sortValue = "desc";
        sortField = "stt";
        break;
      case "name_asc":
        sortKey = "name";
        sortValue = "asc";
        sortField = "name";
        break;
      case "name_desc":
        sortKey = "name";
        sortValue = "desc";
        sortField = "name";
        break;
      case "city_asc":
        sortKey = "location.city";
        sortValue = "asc";
        sortField = "city";
        break;
      case "city_desc":
        sortKey = "location.city";
        sortValue = "desc";
        sortField = "city";
        break;
      case "address_asc":
        sortKey = "location.address";
        sortValue = "asc";
        sortField = "address";
        break;
      case "address_desc":
        sortKey = "location.address";
        sortValue = "desc";
        sortField = "address";
        break;
      case "status_asc":
        sortKey = "status";
        sortValue = "asc";
        sortField = "status";
        break;
      case "status_desc":
        sortKey = "status";
        sortValue = "desc";
        sortField = "status";
        break;
      default:
        break;
    }
    fetchHotels(1, searchText, statusFilter, sortKey, sortValue);
    if (sortKey && sortValue) {
      setSortModel([{ field: sortField, sort: sortValue }]);
    } else {
      setSortModel([]);
    }
  };

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
    setCurrentPage(1);
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      let sortKey = "";
      let sortOptionValue = "";
      switch (field) {
        case "stt":
          sortKey = "_id";
          sortOptionValue = sort === "asc" ? "stt_asc" : "stt_desc";
          break;
        case "name":
          sortKey = "name";
          sortOptionValue = sort === "asc" ? "name_asc" : "name_desc";
          break;
        case "city":
          sortKey = "location.city";
          sortOptionValue = sort === "asc" ? "city_asc" : "city_desc";
          break;
        case "address":
          sortKey = "location.address";
          sortOptionValue = sort === "asc" ? "address_asc" : "address_desc";
          break;
        case "status":
          sortKey = "status";
          sortOptionValue = sort === "asc" ? "status_asc" : "status_desc";
          break;
        default:
          break;
      }
      if (sortKey) {
        setSortOption(sortOptionValue);
        fetchHotels(1, searchText, statusFilter, sortKey, sort);
      }
    } else {
      setSortOption("none");
      fetchHotels(1, searchText, statusFilter);
    }
  };

  const handleChangeStatus = async (hotelId, currentStatus) => {
    try {
      const token = adminToken || localStorage.getItem("adminToken");
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await changeHotelStatus(hotelId, newStatus, token);
      if (response.code === 200) {
        fetchHotels(currentPage, searchText, statusFilter);
        toast.success("Cập nhật trạng thái thành công!", { position: "top-right" });
      } else {
        toast.error(response.message || "Cập nhật trạng thái thất bại!", { position: "top-right" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại!", {
        position: "top-right",
      });
    }
  };

  const handleDelete = async (hotelId) => {
    if (window.confirm("Bạn có chắc muốn xóa khách sạn này?")) {
      try {
        const token = adminToken || localStorage.getItem("adminToken");
        const response = await deleteHotel(hotelId, token);
        if (response.code === 200) {
          fetchHotels(currentPage, searchText, statusFilter);
          toast.success("Xóa khách sạn thành công!", { position: "top-right" });
        } else {
          toast.error(response.message || "Xóa khách sạn thất bại!", { position: "top-right" });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Xóa khách sạn thất bại!", { position: "top-right" });
      }
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    let sortKey = "";
    let sortValue = "";
    switch (sortOption) {
      case "stt_asc":
        sortKey = "_id";
        sortValue = "asc";
        break;
      case "stt_desc":
        sortKey = "_id";
        sortValue = "desc";
        break;
      case "name_asc":
        sortKey = "name";
        sortValue = "asc";
        break;
      case "name_desc":
        sortKey = "name";
        sortValue = "desc";
        break;
      case "city_asc":
        sortKey = "location.city";
        sortValue = "asc";
        break;
      case "city_desc":
        sortKey = "location.city";
        sortValue = "desc";
        break;
      case "address_asc":
        sortKey = "location.address";
        sortValue = "asc";
        break;
      case "address_desc":
        sortKey = "location.address";
        sortValue = "desc";
        break;
      case "status_asc":
        sortKey = "status";
        sortValue = "asc";
        break;
      case "status_desc":
        sortKey = "status";
        sortValue = "desc";
        break;
      default:
        break;
    }
    fetchHotels(value, searchText, statusFilter, sortKey, sortValue);
  };

  const handleOpenModal = (hotel = null) => {
    setSelectedHotel(hotel);
    setOpenModal(true);
  };

  const handleManageRooms = (hotel) => {
    if (!hotel || !hotel._id) {
      toast.error("Khách sạn không hợp lệ! Vui lòng chọn một khách sạn!", { position: "top-right" });
      return;
    }
    setSelectedHotel(hotel);
    setOpenRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    setOpenRoomModal(false);
    setTimeout(() => {
      setSelectedHotel(null);
    }, 100);
  };

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      flex: 0.3,
      sortable: true,
      renderCell: ({ row }) => row.stt,
    },
    {
      field: "name",
      headerName: "Tên khách sạn",
      flex: 1.2,
      sortable: true,
      renderCell: ({ row }) => row.name || "N/A",
    },
    {
      field: "city",
      headerName: "Thành phố",
      flex: 0.7,
      sortable: true,
      renderCell: ({ row }) => row.location?.city || "N/A",
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      flex: 2.7,
      sortable: true,
      renderCell: ({ row }) => row.location?.address || "N/A",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      sortable: true,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          color={row.status === "active" ? "success" : "warning"}
          onClick={() => handleChangeStatus(row._id, row.status)}
        >
          {row.status === "active" ? "Hoạt động" : "Tạm ngưng"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            mt: "22px",
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => handleManageRooms(row)}
            sx={{
              backgroundColor: "#808080",
              color: "white",
              "&:hover": {
                backgroundColor: "#696969",
              },
            }}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            onClick={() => handleOpenModal(row)}
            sx={{
              backgroundColor: colors.blueAccent[300],
              color: "white",
              "&:hover": {
                backgroundColor: colors.blueAccent[200],
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

  const HotelForm = ({ hotel, onClose, onSuccess }) => {
    const [imagePreviews, setImagePreviews] = useState(hotel?.images || []);
    const [loading, setLoading] = useState(false);

    const handleImagesChange = (event, setFieldValue) => {
      const files = Array.from(event.target.files);
      if (files.length + imagePreviews.length > 10) {
        toast.error("Tối đa 10 ảnh!", { position: "top-right" });
        return;
      }
      setFieldValue("images", files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    };

    const handleFormSubmit = async (values, { resetForm }) => {
      setLoading(true);
      try {
        const existingHotel = hotels.find(
          (h) =>
            h.name.toLowerCase() === values.name.trim().toLowerCase() &&
            (!hotel || h._id !== hotel._id)
        );
        if (existingHotel) {
          toast.error("Tên khách sạn đã tồn tại!", { position: "top-right" });
          return;
        }

        const formData = new FormData();
        formData.append("name", values.name.trim());
        formData.append("description", values.description || "");
        formData.append("location[city]", values.city);
        formData.append("location[country]", values.country);
        formData.append("location[address]", values.address);
        formData.append("status", "active");
        if (values.images && values.images.length > 0) {
          values.images.forEach((file) => {
            formData.append("images", file);
          });
        }

        const token = adminToken || localStorage.getItem("adminToken");
        let response;
        if (hotel) {
          response = await updateHotel(hotel._id, formData, token);
        } else {
          response = await createHotel(formData, token);
        }

        if (response.code === 200) {
          toast.success(
            hotel ? "Cập nhật khách sạn thành công!" : "Tạo khách sạn thành công!",
            { position: "top-right" }
          );
          onSuccess(response.data);
          resetForm();
          setImagePreviews([]);
          onClose();
          fetchHotels(currentPage, searchText, statusFilter);
        } else {
          toast.error(response.message || "Thao tác thất bại!", { position: "top-right" });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.errors?.join(", ") ||
          err.response?.data?.message ||
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!";
        toast.error(errorMessage, { position: "top-right" });
        if (err.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", {
            position: "top-right",
          });
          localStorage.removeItem("adminToken");
          navigate("/loginadmin");
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box>
        <Typography variant="h4" mb={2}>
          {hotel ? "Chỉnh sửa khách sạn" : "Tạo khách sạn mới"}
        </Typography>
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={
            hotel
              ? {
                  name: hotel.name || "",
                  description: hotel.description || "",
                  city: hotel.location?.city || "",
                  country: hotel.location?.country || "",
                  address: hotel.location?.address || "",
                  images: [],
                }
              : initialValues
          }
          validationSchema={checkoutSchema}
        >
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="20px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <Box
                  sx={{
                    gridColumn: "span 4",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" mb={1}>
                    Ảnh khách sạn
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((preview, index) => (
                        <Avatar
                          key={index}
                          src={preview}
                          alt={`Preview ${index}`}
                          sx={{ width: 60, height: 60 }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/60";
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption">Chưa có ảnh</Typography>
                    )}
                  </Box>
                  <Button variant="contained" component="label" color="primary" sx={{ mb: 1 }}>
                    Chọn ảnh (tối đa 10)
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImagesChange(e, setFieldValue)}
                    />
                  </Button>
                  {touched.images && errors.images && (
                    <Typography color="error" variant="caption">
                      {errors.images}
                    </Typography>
                  )}
                </Box>

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Tên khách sạn"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  name="name"
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ gridColumn: "span 2", maxWidth: "250px" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Thành phố"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.city}
                  name="city"
                  error={!!touched.city && !!errors.city}
                  helperText={touched.city && errors.city}
                  sx={{ gridColumn: "span 2", maxWidth: "250px" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Quốc gia"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.country}
                  name="country"
                  error={!!touched.country && !!errors.country}
                  helperText={touched.country && errors.country}
                  sx={{ gridColumn: "span 2", maxWidth: "250px" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Địa chỉ"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.address}
                  name="address"
                  error={!!touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                  sx={{ gridColumn: "span 2", maxWidth: "250px" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Mô tả"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.description}
                  name="description"
                  error={!!touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                  sx={{ gridColumn: "span 4", maxWidth: "500px" }}
                />
              </Box>
              <Box display="flex" justifyContent="end" mt="20px" gap={2}>
                <Button variant="contained" onClick={onClose}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : hotel ? "Cập nhật" : "Tạo"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    );
  };

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
          <Box display="flex" justifyContent="space-between" mb="20px" gap={2}>
            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold">
              Quản lý khách sạn
            </Typography>
            <Box display="flex" gap={2}>
              <FormControl sx={{ width: 200 }}>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortOption}
                  onChange={handleSortChange}
                  label="Sắp xếp"
                  sx={{
                    backgroundColor: colors.primary[400],
                  }}
                >
                  <MenuItem value="none">Không sắp xếp</MenuItem>
                  <MenuItem value="stt_asc">STT: Tăng dần</MenuItem>
                  <MenuItem value="stt_desc">STT: Giảm dần</MenuItem>
                  <MenuItem value="name_asc">Tên khách sạn: Tăng dần</MenuItem>
                  <MenuItem value="name_desc">Tên khách sạn: Giảm dần</MenuItem>
                  <MenuItem value="city_asc">Thành phố: Tăng dần</MenuItem>
                  <MenuItem value="city_desc">Thành phố: Giảm dần</MenuItem>
                  <MenuItem value="address_asc">Địa chỉ: Tăng dần</MenuItem>
                  <MenuItem value="address_desc">Địa chỉ: Giảm dần</MenuItem>
                 
                </Select>
              </FormControl>
              <FormControl sx={{ width: 150 }}>
                <InputLabel>Lọc trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Trạng thái"
                  sx={{
                    backgroundColor: colors.primary[400],
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Tạm ngưng</MenuItem>
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
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchTextChange({ target: { value: searchText } });
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Tìm kiếm khách sạn (theo tên)"
                  value={searchText}
                  onChange={handleSearchTextChange}
                />
                <IconButton type="submit" sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => handleOpenModal()}
              >
                Thêm khách sạn
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ gridColumn: "span 12" }}>
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
              <Typography variant="h6" align="center" mt={4}>
                Đang tải...
              </Typography>
            ) : hotels.length === 0 ? (
              <Box textAlign="center" mt={4}>
                <Typography variant="h6">Không có khách sạn nào để hiển thị</Typography>
              </Box>
            ) : (
              <>
                <DataGrid
                  rows={hotels}
                  columns={columns}
                  getRowId={(row) => row._id}
                  pagination={false}
                  hideFooter={true}
                  getRowHeight={() => 80}
                  sx={{
                    width: "100%",
                  }}
                  sortingMode="server"
                  sortModel={sortModel}
                  onSortModelChange={handleSortModelChange}
                />
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedHotel(null);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: colors.primary[400],
            p: 4,
            borderRadius: 2,
            width: 600,
          }}
        >
          <HotelForm
            hotel={selectedHotel}
            onClose={() => {
              setOpenModal(false);
              setSelectedHotel(null);
            }}
            onSuccess={(newHotel) => {
              fetchHotels(currentPage, searchText, statusFilter);
              setOpenModal(false);
              setSelectedHotel(null);
            }}
          />
        </Box>
      </Modal>

      {openRoomModal && selectedHotel && selectedHotel._id && (
        <Modal open={openRoomModal} onClose={handleCloseRoomModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: colors.primary[400],
              p: 4,
              borderRadius: 2,
              width: "80%",
              maxWidth: 1200,
            }}
          >
            <RoomManagement
              open={openRoomModal}
              onClose={handleCloseRoomModal}
              hotel={selectedHotel}
              selectedHotelId={selectedHotel._id}
              selectedHotelName={selectedHotel.name}
              onSuccess={() => {
                fetchHotels(currentPage, searchText, statusFilter);
              }}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, "Tên khách sạn phải có ít nhất 3 ký tự")
    .required("Vui lòng nhập tên khách sạn"),
  city: yup.string().required("Vui lòng nhập thành phố"),
  country: yup.string().required("Vui lòng nhập quốc gia"),
  address: yup.string().required("Vui lòng nhập địa chỉ"),
  description: yup.string(),
  images: yup.array().min(1, "Vui lòng chọn ít nhất một ảnh"),
});

const initialValues = {
  name: "",
  description: "",
  city: "",
  country: "",
  address: "",
  images: [],
};

export default Hotels;