import { useTheme, Box, FormControl, InputLabel, Select, MenuItem, TextField, Paper, Typography, ToggleButton, ToggleButtonGroup, Button, CircularProgress, useMediaQuery } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import { getRevenueStatistics } from "./BarApi";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("year");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("all");
  const [statType, setStatType] = useState("revenue");
  const [errorMessage, setErrorMessage] = useState("");
  const [showTable, setShowTable] = useState(true);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

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
      setErrorMessage("");
      try {
        const params = {
          status: "confirmed"
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

        console.log("Sending request with params:", params);
        const response = await getRevenueStatistics(params);
        console.log("API Response:", response);

        if (response.code === 200 && Array.isArray(response.data)) {
          if (response.data.length === 0) {
            setErrorMessage(`Không có dữ liệu thống kê cho năm ${selectedYear}.`);
            setData([]);
          } else {
            const formattedData = response.data
              .filter(item => {
                if (!item.month) {
                  console.warn("Dữ liệu thiếu trường month:", item);
                  return false;
                }
                const [, year] = item.month.split('/');
                return parseInt(year) === parseInt(selectedYear);
              })
              .map(item => {
                if (!isFinite(item.totalPrice)) {
                  console.warn("Dữ liệu không hợp lệ:", item);
                  return null;
                }
                return {
                  month: item.month,
                  tours: Number(item.tours) || 0,
                  hotels: Number(item.hotels) || 0,
                  totalPrice: Number(item.totalPrice) || 0,
                  tourRevenue: Number(item.tourRevenue) || 0,
                  hotelRevenue: Number(item.hotelRevenue) || 0
                };
              })
              .filter(item => item !== null);

            console.log("Formatted Data:", formattedData);
            if (formattedData.length === 0) {
              setErrorMessage(`Không có dữ liệu hợp lệ cho năm ${selectedYear}.`);
            }
            setData(formattedData);
          }
        } else {
          setErrorMessage(`Lỗi API: Mã ${response.code || "không xác định"}. Phản hồi: ${JSON.stringify(response)}.`);
          setData([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        setErrorMessage(`Lỗi kết nối API: ${error.message}. Kiểm tra server backend hoặc token xác thực.`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [filterType, selectedYear, selectedMonth, startDate, endDate]);

  const getChartConfig = () => {
    let keys = [];
    let barColors = [];
    let legendLabels = [];

    if (viewType === "all") {
      if (statType === "quantity") {
        keys = ["tours", "hotels"];
        barColors = [colors.redAccent[400], colors.redAccent[400]];
        legendLabels = ["Tổng hợp"];
      } else {
        keys = ["totalPrice"];
        barColors = [colors.redAccent[400]];
        legendLabels = ["Tổng hợp"];
      }
    } else if (viewType === "tours") {
      keys = [statType === "quantity" ? "tours" : "tourRevenue"];
      barColors = [colors.blueAccent[700]];
      legendLabels = ["Tours"];
    } else if (viewType === "hotels") {
      keys = [statType === "quantity" ? "hotels" : "hotelRevenue"];
      barColors = [colors.greenAccent[500]];
      legendLabels = ["Hotels"];
    }

    return { keys, barColors, legendLabels };
  };

  const { keys, barColors, legendLabels } = getChartConfig();

  const handleResetFilters = () => {
    setFilterType("year");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth("");
    setStartDate("");
    setEndDate("");
  };

  const toggleTableVisibility = () => {
    setShowTable(prev => !prev);
  };

  const columns = [
    { field: 'month', headerName: 'Tháng', flex: 0.5 },
    { field: 'tours', headerName: 'Số lượng Tours', flex: 0.7 },
    { field: 'hotels', headerName: 'Số lượng Hotels', flex: 0.7 },
    {
      field: 'totalPrice',
      headerName: 'Tổng doanh thu (K VNĐ)',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography color={colors.grey[100]}>
            {Math.round(params.value / 1000).toLocaleString("vi-VN")}
          </Typography>
        </Box>
      )
    },
    {
      field: 'tourRevenue',
      headerName: 'Doanh thu Tours (K VNĐ)',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography color={colors.grey[100]}>
            {Math.round(params.value / 1000).toLocaleString("vi-VN")}
          </Typography>
        </Box>
      )
    },
    {
      field: 'hotelRevenue',
      headerName: 'Doanh thu Hotels (K VNĐ)',
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography color={colors.grey[100]}>
            {Math.round(params.value / 1000).toLocaleString("vi-VN")}
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h2" sx={{ mb: 3, color: colors.grey[100] }}>
        Báo cáo doanh thu
      </Typography>

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

            <Button
              sx={{
                ml: 1,
                backgroundColor: "white"
              }}
              variant="outlined"
              onClick={handleResetFilters}
            >
              Đặt lại
            </Button>
          </Box>

          <Box display="flex" gap={2}>
            <ToggleButtonGroup
              value={statType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) setStatType(newValue);
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

            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) setViewType(newValue);
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

      <Paper sx={{ p: 2, backgroundColor: colors.primary[400] }}>
        <Box sx={{ minHeight: isMobile ? 300 : 400, height: isDashboard ? "50vh" : isMobile ? "60vh" : "75vh" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : errorMessage ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="error">{errorMessage}</Typography>
            </Box>
          ) : data.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography>Không có dữ liệu để hiển thị biểu đồ cho năm {selectedYear}.</Typography>
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
                  if (!isFinite(value)) return "0";
                  if (statType === "quantity") {
                    return Math.round(value);
                  }
                  return Math.round(value / 1000);
                }}
                keys={keys}
                indexBy="month"
                margin={{ top: 50, right: 130, bottom: 70, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={barColors}
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
                    if (!isFinite(value)) return "0";
                    if (statType === "quantity") {
                      return Math.round(value);
                    }
                    return Math.round(value / 1000);
                  },
                  legend: undefined,
                  legendPosition: "middle",
                  legendOffset: -40,
                }}
                enableLabel={true}
                label={({ value }) => statType === "quantity" ? value : `${Math.round(value / 1000)}K`}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                  from: "color",
                  modifiers: [["darker", 1.6]],
                }}
                tooltip={({ id, value, indexValue }) => (
                  <div style={{ padding: 12, background: '#222', color: '#fff' }}>
                    <strong>{indexValue}</strong><br />
                    {id}: {id === 'tours' || id === 'hotels' ? value : `${Math.round(value / 1000)}K VNĐ`}
                  </div>
                )}
                legends={[
                  {
                    data: legendLabels.map((label, index) => ({
                      id: keys[index] || label,
                      label: label,
                      color: barColors[index]
                    })),
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
        {data.length > 0 && (
          <>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                onClick={toggleTableVisibility}
                sx={{ backgroundColor: colors.blueAccent[400], '&:hover': { backgroundColor: colors.blueAccent[300] } }}
              >
                {showTable ? "Ẩn bảng" : "Hiện bảng"}
              </Button>
            </Box>
            {showTable && (
              <Box
                mt={2}
                height="300px"
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
                <DataGrid
                  rows={data.map((item, index) => ({ id: index, ...item }))}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                  getRowHeight={() => 60}
                  sx={{ width: "100%" }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BarChart;