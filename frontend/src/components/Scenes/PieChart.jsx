import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../../theme";
import { useTheme, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { getInvoices } from "../../Admin/invoices/InvoicesApi";
import { toast } from "react-toastify";

const PieChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pieData, setPieData] = useState([]);

  // Fetch data for pie chart
  useEffect(() => {
    const fetchPieData = async () => {
      try {
        const invoicesData = await getInvoices();
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // Tháng hiện tại (1-12)
        const currentYear = today.getFullYear(); // Năm hiện tại (2025)

        // Lọc các hóa đơn trong tháng hiện tại
        const monthInvoices = invoicesData.filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          return (
            invoiceDate.getFullYear() === currentYear &&
            invoiceDate.getMonth() + 1 === currentMonth
          );
        });

        // Tính doanh thu từ tour và khách sạn
        let tourRevenue = 0;
        let hotelRevenue = 0;

        monthInvoices.forEach((invoice) => {
          // Doanh thu tour
          if (invoice.tours?.length > 0) {
            invoice.tours.forEach((tour) => {
              const stock = tour.timeStarts?.[0]?.stock || 0;
              tourRevenue += (tour.price || 0) * stock;
            });
          }
          // Doanh thu khách sạn
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

        // Định dạng dữ liệu cho biểu đồ
        setPieData([
          {
            id: "Tour",
            label: "Tour",
            value: tourRevenue / 1000, // Chuyển sang nghìn VNĐ
            color: colors.blueAccent[700],
          },
          {
            id: "Hotel",
            label: "Hotel",
            value: hotelRevenue / 1000, // Chuyển sang nghìn VNĐ
            color: colors.greenAccent[500],
          },
        ]);
      } catch (err) {
        toast.error("Không thể tải dữ liệu biểu đồ!", { position: "top-right" });
        console.error("Fetch pie data error:", err);
      }
    };
    fetchPieData();
  }, []);

  // Handle empty data
  if (pieData.length === 0 || pieData.every((item) => item.value === 0)) {
    return (
      <Typography align="center" color={colors.grey[100]} mt={4}>
        Chưa có dữ liệu doanh thu để hiển thị
      </Typography>
    );
  }

  return (
    <ResponsivePie
      data={pieData}
      theme={{
        axis: {
          domain: {
            line: { stroke: colors.grey[100] },
          },
          legend: {
            text: { fill: colors.grey[100] },
          },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] },
          },
        },
        legends: {
          text: { fill: colors.grey[100] },
        },
      }}
      margin={isDashboard ? { top: 20, right: 40, bottom: 60, left: 40 } : { top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      valueFormat={(value) => `${Math.round(value)}K VNĐ`}
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
      legends={
        isDashboard
          ? [
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
          ]
          : [
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
          ]
      }
    />
  );
};

export default PieChart;