import { useState, useEffect } from "react";
import { Box, Button, IconButton, Typography, useTheme, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../components/data/mockData";
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TourIcon from "@mui/icons-material/FlightTakeoff";
import HotelIcon from "@mui/icons-material/Hotel";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Header from "../../components/Scenes/Header";
import LineChart from "../../components/Scenes/LineChart";
import PieChart from "../../components/Scenes/PieChart";
import StatBox from "../../components/Scenes/StatBox";
import { DataGrid } from "@mui/x-data-grid";
import { getContacts, getContactDetail } from "../contacts/ContactsApi";
import { getInvoices } from "../invoices/InvoicesApi";
import { getHotels, getHotelReviews } from "../Review/reviewApi";
import { toast } from "react-toastify";
import { useAdminAuth } from "../../context/AdminContext";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { adminToken } = useAdminAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalTours: 0,
    toursToday: 0,
    totalHotels: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

  // Fetch user details for reviews
  const fetchUserDetails = async (userId, userCache) => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    try {
      const response = await getContactDetail(userId, adminToken);
      if (response.code === 200 && response.data) {
        return {
          username: response.data.username || response.data.fullName || "N/A",
          email: response.data.email || "N/A",
        };
      }
      return { username: "N/A", email: "N/A" };
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      return { username: "N/A", email: "N/A" };
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersData = await getContacts();
      const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
      const today = new Date().toISOString().split("T")[0];
      const newUsersToday = usersData.filter(user =>
        new Date(user.createdAt).toISOString().split("T")[0] === today
      ).length;

      // Fetch invoices for tours and revenue
      const invoicesData = await getInvoices();
      const totalTours = invoicesData.filter(invoice => invoice.tours.length > 0).length;
      const toursToday = invoicesData.filter(invoice =>
        new Date(invoice.createdAt).toISOString().split("T")[0] === today && invoice.tours.length > 0
      ).length;
      const revenueToday = invoicesData
        .filter(invoice => new Date(invoice.createdAt).toISOString().split("T")[0] === today)
        .reduce((sum, invoice) => sum + (invoice.totalPrice || 0), 0);

      // Calculate monthly revenue for selected month and year
      let tourRevenueThisMonth = 0;
      let hotelRevenueThisMonth = 0;
      invoicesData
        .filter(invoice => {
          const invoiceDate = new Date(invoice.createdAt);
          return (
            invoiceDate.getFullYear() === selectedYear &&
            invoiceDate.getMonth() + 1 === selectedMonth
          );
        })
        .forEach((invoice) => {
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
      const revenueThisMonth = tourRevenueThisMonth + hotelRevenueThisMonth;

      // Fetch hotels
      const hotelsData = await getHotels(adminToken);
      const totalHotels = Array.isArray(hotelsData.data) ? hotelsData.data.length : 0;

      // Fetch recent users
      const recentUsersData = usersData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((user, index) => ({
          id: user._id,
          stt: index + 1,
          fullName: user.fullName,
          email: user.email,
          createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
        }));

      // Fetch recent reviews
      const userCache = {};
      let allReviews = [];
      for (const hotel of hotelsData.data) {
        const reviews = await getHotelReviews(hotel._id, {
          page: 1,
          limit: 10,
          sortKey: "createdAt",
          sortValue: "desc",
        }, adminToken);
        if (Array.isArray(reviews)) {
          allReviews = allReviews.concat(reviews.map(review => ({
            ...review,
            hotelName: hotel.name,
          })));
        }
      }
      const recentReviewsData = allReviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(async (review, index) => {
          const userData = await fetchUserDetails(review.user_id, userCache);
          return {
            id: review._id,
            stt: index + 1,
            username: userData.username,
            hotelName: review.hotelName,
            rating: review.rating,
            comment: review.comment || "Không có bình luận",
            createdAt: new Date(review.createdAt).toLocaleDateString("vi-VN"),
          };
        });
      const resolvedReviews = await Promise.all(recentReviewsData);

      setStats({
        totalUsers,
        newUsersToday,
        totalTours,
        toursToday,
        totalHotels,
        revenueToday,
        revenueThisMonth,
      });
      setRecentUsers(recentUsersData);
      setRecentReviews(resolvedReviews);
    } catch (err) {
      toast.error("Không thể tải dữ liệu dashboard!", { position: "top-right" });
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchDashboardData();
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
    }
  }, [adminToken, selectedYear, selectedMonth]);

  // Columns for Recent Users DataGrid
  const userColumns = [
    { field: "stt", headerName: "STT", flex: 0.3 },
    { field: "fullName", headerName: "Tên", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 0.7 },
  ];

  // Columns for Recent Reviews DataGrid
  const reviewColumns = [
    { field: "stt", headerName: "STT", flex: 0.3 },
    { field: "username", headerName: "Người dùng", flex: 1 },
    { field: "hotelName", headerName: "Khách sạn", flex: 1 },
    { field: "rating", headerName: "Điểm", flex: 0.5, renderCell: ({ row }) => `${row.rating}/5` },
    { field: "comment", headerName: "Bình luận", flex: 2 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 0.7 },
  ];

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Dashboard" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlined sx={{ mr: "10px" }} />
            Tải báo cáo doanh thu tháng này
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
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
                sx={{ color: colors.greenAccent[600], fontSize: "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={stats.totalTours.toLocaleString()}
            subtitle="Tổng tour"
            progress={stats.totalTours ? stats.toursToday / stats.totalTours : 0}
            increase={`+${stats.toursToday} hôm nay`}
            icon={
              <TourIcon
                sx={{ color: colors.greenAccent[600], fontSize: "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={stats.totalHotels.toLocaleString()}
            subtitle="Tổng khách sạn"
            progress={0}
            increase=""
            icon={
              <HotelIcon
                sx={{ color: colors.greenAccent[600], fontSize: "30px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(stats.revenueToday / 1000).toLocaleString()}K`}
            subtitle="Doanh thu hôm nay"
            progress={0}
            increase=""
            icon={
              <MonetizationOnIcon
                sx={{ color: colors.greenAccent[600], fontSize: "30px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          sx={{ overflow: "hidden" }}
        >
          <Box
            mt="25px"
            p="0 30px"
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
                {(stats.revenueThisMonth / 1000000).toLocaleString()}M VNĐ
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl sx={{ minWidth: 100 }}>
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
              <FormControl sx={{ minWidth: 100 }}>
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
            </Box>
          </Box>
          <Box height="200px" mt="10px" sx={{ width: "100%", overflow: "hidden" }}>
            <LineChart isDashboard={true} selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
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
              Giao dịch gần đây
            </Typography>
          </Box>
          {mockTransactions.map((transaction, i) => (
            <Box
              key={`${transaction.txId}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.txId}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.date}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                ${transaction.cost}
              </Box>
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Phân bổ đặt chỗ
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <PieChart isDashboard={true} />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              {stats.toursToday} tour / {(stats.revenueToday / 100000).toFixed(0)} khách sạn
            </Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Người dùng mới
          </Typography>
          <Box height="250px" mt="-20px">
            <DataGrid
              rows={recentUsers}
              columns={userColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: colors.blueAccent[700],
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: colors.primary[400],
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: colors.blueAccent[700],
                },
              }}
            />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Đánh giá gần đây
          </Typography>
          <Box height="250px" mt="-20px">
            {loading ? (
              <Typography variant="h6" align="center" mt={4}>
                Đang tải...
              </Typography>
            ) : recentReviews.length === 0 ? (
              <Typography variant="h6" align="center" mt={4}>
                Không có đánh giá nào để hiển thị
              </Typography>
            ) : (
              <DataGrid
                rows={recentReviews}
                columns={reviewColumns}
                getRowId={(row) => row.id}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: colors.blueAccent[700],
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