import { useTheme, Box, FormControl, InputLabel, Select, MenuItem, TextField, Paper, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import { getRevenueStatistics } from "./BarApi";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("year");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("all");
  const [statType, setStatType] = useState("revenue");

  // Tạo danh sách năm (10 năm gần nhất)
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Danh sách tháng
  const months = [
    { value: "", label: "Tất cả tháng" },
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

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const params = {
          status: "confirmed" // Chỉ lấy các hóa đơn đã xác nhận
        };

        if (filterType === "year") {
          params.year = selectedYear;
        } else if (filterType === "month") {
          params.year = selectedYear;
          if (selectedMonth) params.month = selectedMonth;
        } else if (filterType === "range") {
          if (startDate && endDate) {
            params.startDate = startDate;
            params.endDate = endDate;
          }
        }

        const response = await getRevenueStatistics(params);
        console.log("API Response:", response); // Thêm log để kiểm tra dữ liệu
        if (response.code === 200) {
          // Chuyển đổi dữ liệu thành định dạng phù hợp cho biểu đồ
          const formattedData = response.data.map(item => ({
            month: item.month,
            tours: item.tours,
            hotels: item.hotels,
            totalPrice: item.totalPrice,
            tourRevenue: item.tourRevenue, // Thêm trường doanh thu tours
            hotelRevenue: item.hotelRevenue // Thêm trường doanh thu hotels
          }));
          console.log("Formatted Data:", formattedData); // Thêm log để kiểm tra dữ liệu đã format
          setData(formattedData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [filterType, selectedYear, selectedMonth, startDate, endDate]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h2" sx={{ mb: 3, color: colors.grey[100] }}>
        Báo cáo doanh thu
      </Typography>

      {/* Bộ lọc */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: colors.primary[400] }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Loại báo cáo</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Loại báo cáo"
              >
                <MenuItem value="year">Theo năm</MenuItem>
                <MenuItem value="month">Theo tháng</MenuItem>
                <MenuItem value="range">Theo khoảng thời gian</MenuItem>
              </Select>
            </FormControl>

            {filterType !== "range" && (
              <>
                <FormControl sx={{ minWidth: 120 }}>
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

                {filterType === "month" && (
                  <FormControl sx={{ minWidth: 120 }}>
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
                )}
              </>
            )}

            {filterType === "range" && (
              <>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 180 }}
                />
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 180 }}
                />
              </>
            )}
          </Box>

          <Box display="flex" gap={2}>
            {/* Nút chuyển đổi giữa doanh thu và số lượng */}
            <ToggleButtonGroup
              value={statType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue) setStatType(newValue);
              }}
              sx={{
                backgroundColor: colors.primary[400],
                '& .MuiToggleButton-root': {
                  color: colors.grey[100],
                  '&.Mui-selected': {
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                  },
                },
              }}
            >
              <ToggleButton value="revenue">Doanh thu</ToggleButton>
              <ToggleButton value="quantity">Số lượng</ToggleButton>
            </ToggleButtonGroup>

            {/* Nút chuyển đổi giữa các loại thống kê */}
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue) setViewType(newValue);
              }}
              sx={{
                backgroundColor: colors.primary[400],
                '& .MuiToggleButton-root': {
                  color: colors.grey[100],
                  '&.Mui-selected': {
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                  },
                  '&[value="all"]': {
                    '&.Mui-selected': {
                      backgroundColor: colors.redAccent[400],
                    },
                  },
                  '&[value="hotels"]': {
                    '&.Mui-selected': {
                      backgroundColor: colors.greenAccent[500],
                    },
                  },
                },
              }}
            >
              <ToggleButton value="all">Tổng hợp</ToggleButton>
              <ToggleButton value="tours">Thống kê Tours</ToggleButton>
              <ToggleButton value="hotels">Thống kê Hotels</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Biểu đồ */}
      <Paper sx={{ p: 2, backgroundColor: colors.primary[400] }}>
        <Box height={isDashboard ? "50vh" : "75vh"}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography>Đang tải dữ liệu...</Typography>
            </Box>
          ) : data.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography>Không có dữ liệu để hiển thị biểu đồ</Typography>
            </Box>
          ) : (
            <>
              {statType === "revenue" && (
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: "center",
                    color: colors.grey[100],
                    mb: 2
                  }}
                >
                  Doanh thu (nghìn VNĐ)
                </Typography>
              )}
              <ResponsiveBar
                data={data}
                theme={{
                  axis: {
                    domain: {
                      line: {
                        stroke: colors.grey[100],
                      },
                    },
                    legend: {
                      text: {
                        fill: colors.grey[100],
                      },
                    },
                    ticks: {
                      line: {
                        stroke: colors.grey[100],
                        strokeWidth: 1,
                      },
                      text: {
                        fill: colors.grey[100],
                      },
                    },
                  },
                  legends: {
                    text: {
                      fill: colors.grey[100],
                    },
                  },
                }}
                layout="vertical"
                valueFormat={(value) => {
                  if (statType === "quantity") {
                    return Math.round(value);
                  }
                  return Math.round(value / 1000);
                }}
                keys={viewType === "all"
                  ? statType === "quantity"
                    ? ["tours", "hotels"]
                    : ["totalPrice"]
                  : statType === "quantity"
                    ? [viewType]
                    : [viewType === "tours" ? "tourRevenue" : "hotelRevenue"]}
                indexBy="month"
                margin={{ top: 50, right: 130, bottom: 70, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={viewType === "all"
                  ? statType === "quantity"
                    ? [colors.redAccent[400], colors.redAccent[400]]
                    : [colors.redAccent[400]]
                  : viewType === "tours"
                    ? [colors.blueAccent[700]]
                    : viewType === "hotels"
                      ? [colors.greenAccent[500]]
                      : [colors.redAccent[400]]}
                borderColor={{
                  from: "color",
                  modifiers: [["darker", "1.6"]],
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: isDashboard ? undefined : filterType === "range" ? "Ngày" : "Tháng",
                  legendPosition: "middle",
                  legendOffset: 32,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: (value) => {
                    if (statType === "quantity") {
                      return value;
                    }
                    return Math.round(value / 1000);
                  },
                  legend: undefined,
                  legendPosition: "middle",
                  legendOffset: -40,
                }}
                enableLabel={false}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                  from: "color",
                  modifiers: [["darker", 1.6]],
                }}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
                role="application"
                barAriaLabel={(e) =>
                  `${e.id}: ${e.formattedValue} trong ${filterType === "range" ? "ngày" : "tháng"}: ${e.indexValue}`
                }
              />
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default BarChart;