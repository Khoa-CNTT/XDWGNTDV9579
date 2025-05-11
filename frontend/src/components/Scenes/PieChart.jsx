import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../../theme";
import { useTheme, Typography, Box, useMediaQuery, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { getInvoices } from "../../Admin/invoices/InvoicesApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const PieChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchPieData = async () => {
      if (!adminToken) {
        setErrorMessage("Vui lòng đăng nhập để tiếp tục!");
        toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
        navigate("/loginadmin");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const invoicesData = await getInvoices({
          page: 1,
          limit: 50,
          status: "paid", // Sửa từ "confirmed" thành "paid"
          year: currentYear,
          month: currentMonth,
        }, adminToken);
        if (!invoicesData || !Array.isArray(invoicesData.orders)) {
          throw new Error("Dữ liệu hóa đơn không hợp lệ!");
        }

        let tourRevenue = 0;
        let hotelRevenue = 0;
        invoicesData.orders.forEach((invoice) => {
          if (invoice.tours?.length > 0) {
            invoice.tours.forEach((tour) => {
              const stock = tour.timeStarts?.[0]?.stock || 0;
              tourRevenue += (tour.price || 0) * stock;
            });
          }
          if (invoice.hotels?.length > 0) {
            invoice.hotels.forEach((hotel) => {
              if (hotel.rooms?.length > 0) {
                hotel.rooms.forEach((room) => {
                  hotelRevenue += (room.price || 0) * (room.quantity || 0);
                });
              }
            });
          }
        });

        const totalRevenue = tourRevenue + hotelRevenue;
        if (totalRevenue === 0) {
          setErrorMessage(`Không có dữ liệu doanh thu cho tháng ${currentMonth}/${currentYear}.`);
          setPieData([]);
          toast.info(`Không có dữ liệu doanh thu cho tháng ${currentMonth}/${currentYear}.`, { position: "top-right" });
        } else {
          setPieData([
            {
              id: "Tour",
              label: "Tour",
              value: tourRevenue / 1000,
              color: colors.blueAccent[700],
            },
            {
              id: "Hotel",
              label: "Hotel",
              value: hotelRevenue / 1000,
              color: colors.greenAccent[500],
            },
          ]);
        }
      } catch (err) {
        console.error("Fetch pie data error:", err);
        const errorMsg = err.message || `Lỗi khi tải dữ liệu hóa đơn: ${err.response?.data?.message || err.message}`;
        setErrorMessage(errorMsg);
        setPieData([]);
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
    fetchPieData();
  }, [adminToken, navigate]);

  return (
    <Box height="100%" position="relative">
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
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? "150px" : isDashboard ? "200px" : "300px"}>
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? "150px" : isDashboard ? "200px" : "300px"}>
          <Typography color="error">{errorMessage}</Typography>
        </Box>
      ) : pieData.length === 0 || pieData.every((item) => item.value === 0) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={isMobile ? "150px" : isDashboard ? "200px" : "300px"}>
          <Typography color={colors.grey[100]}>
            Chưa có dữ liệu doanh thu để hiển thị
          </Typography>
        </Box>
      ) : (
        <ResponsivePie
          data={pieData}
          theme={{
            axis: {
              domain: { line: { stroke: colors.grey[100] } },
              legend: { text: { fill: colors.grey[100] } },
              ticks: { line: { stroke: colors.grey[100], strokeWidth: 1 }, text: { fill: colors.grey[100] } },
            },
            legends: { text: { fill: colors.grey[100], fontSize: isMobile ? 8 : 10 } },
          }}
          margin={isMobile ? { top: 10, right: 20, bottom: 40, left: 20 } : isDashboard ? { top: 20, right: 40, bottom: 60, left: 40 } : { top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          enableArcLabels={isMobile ? false : true}
          arcLabelsRadiusOffset={0.4}
          arcLabelsSkipAngle={7}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          valueFormat={(value) => `${Math.round(value)} VNĐ`}
          defs={[
            {
              id: "dots",
              type: "patternDots",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              size: 4,
              padding: 1,
              stagger: true,
            },
            {
              id: "lines",
              type: "patternLines",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
            },
          ]}
          legends={isMobile ? [] : isDashboard ? [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 40,
              itemsSpacing: 0,
              itemWidth: 80,
              itemHeight: 18,
              itemTextColor: colors.grey[100],
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 14,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: { itemTextColor: colors.grey[500] },
                },
              ],
            },
          ] : [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: colors.grey[100],
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: { itemTextColor: colors.grey[500] },
                },
              ],
            },
          ]}
        />
      )}
    </Box>
  );
};

export default PieChart;