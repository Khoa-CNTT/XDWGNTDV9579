import { useState, useEffect } from "react";
import { Box, Button, Typography, useTheme, FormControl, InputLabel, Select, MenuItem, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import ApartmentIcon from "@mui/icons-material/Apartment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Header from "../../components/Scenes/Header";
import LineChart from "../../components/Scenes/LineChart";
import PieChart from "../../components/Scenes/PieChart";
import StatBox from "../../components/Scenes/StatBox";
import { DataGrid } from "@mui/x-data-grid";
import { getContacts, getContactDetail } from "../contacts/ContactsApi";
import { getInvoices } from "../invoices/InvoicesApi";
import { getHotels } from "../Review/reviewApi";
import { getDashboardStats } from "./dashboardApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminAuth } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { adminToken } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalTours: 0,
    toursToday: 0,
    totalHotels: 0,
    hotelsToday: 0,
    revenueToday: 0,
    totalAvailableTours: 0,
    totalAvailableHotels: 0,
  });
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [userPaginationModel, setUserPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [userRowCount, setUserRowCount] = useState(0);
  const [userCache, setUserCache] = useState({});

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  // Fetch user details for invoices
  const fetchUserDetails = async (userId) => {
    if (!userId) return { username: "N/A", email: "N/A" };
    if (userCache[userId]) {
      return userCache[userId];
    }
    try {
      const response = await getContactDetail(userId, adminToken);
      if (response.code === 200 && response.data) {
        const userData = {
          username: response.data.fullName || response.data.email || "N/A",
          email: response.data.email || "N/A",
        };
        setUserCache((prev) => ({ ...prev, [userId]: userData }));
        return userData;
      }
      return { username: "N/A", email: "N/A" };
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        navigate("/loginadmin");
      }
      return { username: "N/A", email: "N/A" };
    }
  };

  // Fetch monthly revenue
  const fetchMonthlyRevenue = async () => {
    if (!adminToken) {
      setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      navigate("/loginadmin");
      return;
    }

    console.log("Fetching monthly revenue for month:", selectedMonth, "year:", selectedYear);
    try {
      const monthlyInvoicesResponse = await getInvoices(adminToken, {
        page: 1,
        limit: 50,
        status: "paid",
        year: selectedYear,
        month: selectedMonth,
      });
      console.log("Monthly Invoices Response for month", selectedMonth, ":", JSON.stringify(monthlyInvoicesResponse, null, 2));
      let monthlyInvoices = [];
      if (monthlyInvoicesResponse && Array.isArray(monthlyInvoicesResponse.orders)) {
        monthlyInvoices = monthlyInvoicesResponse.orders;
      } else {
        console.warn("Invalid monthly invoices response structure:", monthlyInvoicesResponse);
        toast.warn(`Không thể tải dữ liệu hóa đơn cho tháng ${selectedMonth}/${selectedYear}. Dữ liệu không đúng định dạng.`, { position: "top-right" });
        monthlyInvoices = [];
      }

      const filteredInvoices = monthlyInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        const invoiceMonth = invoiceDate.getMonth() + 1;
        const invoiceYear = invoiceDate.getFullYear();
        return invoiceMonth === selectedMonth && invoiceYear === selectedYear;
      });

      console.log("Filtered invoices for month", selectedMonth, ":", JSON.stringify(filteredInvoices, null, 2));

      let tourRevenueThisMonth = 0;
      let hotelRevenueThisMonth = 0;
      filteredInvoices.forEach((invoice) => {
        if (invoice.tours?.length > 0) {
          invoice.tours.forEach((tour) => {
            const stock = tour.timeStarts?.[0]?.stock || 0;
            tourRevenueThisMonth += (tour.price || 0) * stock;
          });
        }
        if (invoice.hotels?.length > 0) {
          invoice.hotels.forEach((hotel) => {
            if (hotel.rooms?.length > 0) {
              hotel.rooms.forEach((room) => {
                hotelRevenueThisMonth += (room.price || 0) * (room.quantity || 0);
              });
            }
          });
        }
      });
      const calculatedRevenue = tourRevenueThisMonth + hotelRevenueThisMonth;
      console.log("Calculated revenue for month", selectedMonth, ":", calculatedRevenue);
      setRevenueThisMonth(calculatedRevenue);
      if (calculatedRevenue === 0) {
        setErrorMessage(`Không có doanh thu trong tháng ${selectedMonth}/${selectedYear}.`);
        toast.info(`Không có doanh thu trong tháng ${selectedMonth}/${selectedYear}.`, { position: "top-right" });
      } else {
        setErrorMessage("");
      }
    } catch (err) {
      console.error("Error fetching monthly revenue:", err);
      const errorMsg = err.message || `Lỗi khi tải dữ liệu doanh thu tháng: ${err.response?.data?.message || err.message}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        navigate("/loginadmin");
      }
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!adminToken) {
      setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
      navigate("/loginadmin");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      // Fetch dashboard stats from API
      const dashboardStats = await getDashboardStats(adminToken);
      const totalUsers = dashboardStats.user.total || 0;
      const totalAvailableTours = dashboardStats.tour.total || 0;
      const totalAvailableHotels = dashboardStats.hotel.total || 0;

      // Fetch users with pagination
      const usersResponse = await getContacts({
        page: userPaginationModel.page + 1,
        limit: userPaginationModel.pageSize,
      }, adminToken);
      console.log("Users Response:", JSON.stringify(usersResponse, null, 2));
      if (!Array.isArray(usersResponse.users)) {
        throw new Error(usersResponse.message || "Dữ liệu người dùng không hợp lệ!");
      }
      const usersData = usersResponse.users;
      const today = new Date().toISOString().split("T")[0];
      const newUsersToday = usersData.filter(user =>
        new Date(user.createdAt).toISOString().split("T")[0] === today
      ).length;

      // Fetch invoices with pagination
      const invoicesResponse = await getInvoices(adminToken, {
        page: 1,
        limit: 10,
        status: "paid",
      });
      console.log("Invoices Response:", JSON.stringify(invoicesResponse, null, 2));
      let invoicesData = [];
      if (invoicesResponse && Array.isArray(invoicesResponse.orders)) {
        invoicesData = invoicesResponse.orders;
      } else {
        console.warn("Invalid invoices response structure:", invoicesResponse);
        toast.warn("Không thể tải dữ liệu hóa đơn gần đây. Dữ liệu không đúng định dạng.", { position: "top-right" });
      }
      const totalTours = invoicesData.filter(invoice => invoice.tours?.length > 0).length;
      const toursToday = invoicesData.filter(invoice =>
        new Date(invoice.createdAt).toISOString().split("T")[0] === today && invoice.tours?.length > 0
      ).length;
      const totalHotels = invoicesData.filter(invoice => invoice.hotels?.length > 0).length;
      const hotelsToday = invoicesData.filter(invoice =>
        new Date(invoice.createdAt).toISOString().split("T")[0] === today && invoice.hotels?.length > 0
      ).length;
      const revenueToday = invoicesData
        .filter(invoice => new Date(invoice.createdAt).toISOString().split("T")[0] === today)
        .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);

      // Fetch recent users
      const recentUsersData = usersData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((user, index) => ({
          id: user._id,
          stt: index + 1,
          fullName: user.fullName || "N/A",
          email: user.email || "N/A",
          createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
        }));
      console.log("Recent Users Data:", JSON.stringify(recentUsersData, null, 2));

      // Fetch recent invoices with user details
      const recentInvoicesData = await Promise.all(
        invoicesData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(async (invoice, index) => {
            const userDetails = await fetchUserDetails(invoice.user_id);
            return {
              id: invoice._id,
              stt: index + 1,
              txId: invoice.orderCode || invoice._id,
              user: userDetails.username,
              date: new Date(invoice.createdAt).toLocaleDateString("vi-VN"),
              cost: (invoice.totalPrice / 1000).toLocaleString("vi-VN") + " VNĐ",
            };
          })
      );
      console.log("Recent Invoices Data:", JSON.stringify(recentInvoicesData, null, 2));

      setStats({
        totalUsers,
        newUsersToday,
        totalTours,
        toursToday,
        totalHotels,
        hotelsToday,
        revenueToday,
        totalAvailableTours,
        totalAvailableHotels,
      });
      setRecentUsers(recentUsersData);
      setRecentInvoices(recentInvoicesData);
      setUserRowCount(totalUsers);
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      const errorMsg = err.message || `Lỗi khi tải dữ liệu dashboard: ${err.response?.data?.message || err.message}`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("adminToken");
        navigate("/loginadmin");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial dashboard data on mount and when pagination changes
  useEffect(() => {
    fetchDashboardData();
  }, [adminToken, userPaginationModel]);

  // Fetch monthly revenue when selectedMonth or selectedYear changes
  useEffect(() => {
    fetchMonthlyRevenue();
  }, [selectedMonth, selectedYear, adminToken]);

  const handleResetFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setUserPaginationModel({ page: 0, pageSize: 5 });
    setErrorMessage("");
  };

  // Columns for Recent Users DataGrid
  const userColumns = [
    { field: "stt", headerName: "STT", flex: isMobile ? 0.2 : 0.3 },
    { field: "fullName", headerName: "Tên", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: isMobile ? 0.5 : 0.7 },
  ];

  // Columns for Recent Invoices DataGrid
  const invoiceColumns = [
    { field: "stt", headerName: "STT", flex: isMobile ? 0.2 : 0.3 },
    { field: "txId", headerName: "Mã giao dịch", flex: 0.8 },
    { field: "user", headerName: "Người dùng", flex: 1 },
    { field: "date", headerName: "Ngày", flex: isMobile ? 0.5 : 0.6 },
    { field: "cost", headerName: "Số tiền", flex: isMobile ? 0.5 : 0.8 },
  ];

  return (
    <Box m={isMobile ? "10px" : "20px"}>
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
      {/* HEADER */}
      <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems="center" gap={2}>
        <Header title="Bảng điều khiển" />
        <Button
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: isMobile ? "12px" : "14px",
            fontWeight: "bold",
            padding: isMobile ? "8px 16px" : "10px 20px",
          }}
        >
          <DownloadOutlined sx={{ mr: "10px" }} />
          Tải báo cáo doanh thu tháng này
        </Button>
      </Box>

      {errorMessage && (
        <Box my={2}>
          <Typography color="error" align="center">{errorMessage}</Typography>
        </Box>
      )}

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}
        gridAutoRows={isMobile ? "auto" : "140px"}
        gap={isMobile ? "10px" : "20px"}
      >
        {/* ROW 1 */}
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={stats.totalUsers.toLocaleString()}
            subtitle="Tổng người dùng"
            progress={stats.totalUsers ? stats.newUsersToday / stats.totalUsers : 0}
            increase={`+${stats.newUsersToday} hôm nay`}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={stats.totalTours.toLocaleString()}
            subtitle="Tổng tour đã bán"
            progress={stats.totalTours ? stats.toursToday / stats.totalTours : 0}
            increase={`+${stats.toursToday} hôm nay`}
            icon={
              <FlightTakeoffOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={stats.totalHotels.toLocaleString()}
            subtitle="Tổng phòng đã bán"
            progress={stats.totalHotels ? stats.hotelsToday / stats.totalHotels : 0}
            increase={`+${stats.hotelsToday} hôm nay`}
            icon={
              <MeetingRoomOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(stats.revenueToday / 1000).toLocaleString()} VNĐ`}
            subtitle="Doanh thu hôm nay"
            progress={0}
            increase=""
            icon={
              <MonetizationOnIcon
                sx={{ color: colors.greenAccent[600], fontSize: isMobile ? "24px" : "30px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn={isMobile ? "span 1" : "span 8"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          sx={{ overflow: "visible" }}
        >
          <Box
            mt="20px"
            p={isMobile ? "0 15px" : "0 30px"}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" flexDirection="column">
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Doanh thu tháng này
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {(revenueThisMonth / 1000000).toLocaleString()}M VNĐ
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: isMobile ? 80 : 100 }}>
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Tháng"
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: isMobile ? 80 : 100 }}>
                <InputLabel>Năm</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Năm"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleResetFilters}
                sx={{ fontWeight: "bold", padding: isMobile ? "6px 12px" : "8px 16px" }}
              >
                Đặt lại
              </Button>
            </Box>
          </Box>
          <Box height={isMobile ? "400px" : "800px"} mt="50px" sx={{ width: "100%", overflow: "visible" }}>
            <LineChart isDashboard={true} selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Box>
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p={isMobile ? "10px" : "20px"}
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap="15px"
          sx={{ overflow: "auto" }}
        >
          {/* Card for Total Available Tours */}
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            p="20px"
            borderRadius="16px"
            backgroundColor={colors.grey[900]}
            border={`1px solid ${colors.grey[300]}`}
            boxShadow={`0px 4px 12px ${colors.grey[900]}10`}
            sx={{
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0px 8px 20px ${colors.grey[900]}20`,
              },
            }}
          >
            <TourOutlinedIcon
              sx={{
                fontSize: isMobile ? "50px" : "60px",
                color: colors.greenAccent[400],
                mr: "20px",
              }}
            />
            <Box>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                color={colors.grey[100]}
              >
                Tổng tour
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                color={colors.grey[300]}
                ml="25px"
              >
                {stats.totalAvailableTours.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          {/* Card for Total Available Hotels */}
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            p="20px"
            borderRadius="16px"
            backgroundColor={colors.grey[900]}
            border={`1px solid ${colors.grey[200]}`}
            boxShadow={`0px 4px 12px ${colors.grey[800]}10`}
            sx={{
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0px 8px 20px ${colors.grey[900]}20`,
              },
            }}
          >
            <ApartmentIcon
              sx={{
                fontSize: isMobile ? "50px" : "60px",
                color: colors.greenAccent[400],
                mr: "20px",
              }}
            />
            <Box>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                color={colors.grey[100]}
              >
                Tổng khách sạn
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                color={colors.grey[300]}
                ml="30px"
              >
                {stats.totalAvailableHotels.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p={isMobile ? "15px" : "30px"}
        >
          <Typography variant="h5" fontWeight="600">
            Phân bổ đặt Tour và Khách sạn trong năm
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <Box height={isMobile ? "150px" : "230px"} width="100%">
              <PieChart isDashboard={true} selectedYear={selectedYear} />
            </Box>
          </Box>
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Hóa đơn gần đây
            </Typography>
          </Box>
          {recentInvoices.length === 0 ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>Không có hóa đơn để hiển thị.</Typography>
            </Box>
          ) : (
            <Box height="250px">
              <DataGrid
                rows={recentInvoices}
                columns={invoiceColumns}
                getRowId={(row) => row.id}
                hideFooter
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none",
                    color: colors.grey[100],
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              />
            </Box>
          )}
        </Box>
        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Người dùng mới
            </Typography>
          </Box>
          <Box height="250px">
            {loading ? (
              <Typography variant="h6" align="center" mt={4}>
                Đang tải...
              </Typography>
            ) : recentUsers.length === 0 ? (
              <Typography variant="h6" align="center" mt={4}>
                Không có người dùng mới để hiển thị
              </Typography>
            ) : (
              <DataGrid
                rows={recentUsers}
                columns={userColumns}
                getRowId={(row) => row.id}
                hideFooter
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none",
                    color: colors.grey[100],
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;