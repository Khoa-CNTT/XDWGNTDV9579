import { ResponsiveLine } from "@nivo/line";
import { useTheme, Box, Typography, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";
import { useEffect, useState, useMemo } from "react";
import { getRevenueStatistics } from "../../Admin/bar/BarApi";
import { toast } from "react-toastify";

const LineChart = ({ isDashboard = false, selectedYear, onYearChange }) => {
  const theme = useTheme();
  const colors = useMemo(() => tokens(theme.palette.mode), [theme.palette.mode]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        console.log("Fetching revenue data for year:", selectedYear);
        const params = {
          status: "confirmed",
          year: selectedYear,
        };
        const response = await getRevenueStatistics(params);
        console.log("API Response:", response);

        if (response.code === 200 && Array.isArray(response.data)) {
          if (response.data.length === 0) {
            setErrorMessage(`Không có dữ liệu doanh thu cho năm ${selectedYear}.`);
            setData([]);
            console.log("No data returned for the selected year.");
          } else {
            // Format data for line chart (all 12 months)
            const tourData = {
              id: "Tours",
              color: colors.blueAccent[700],
              data: [],
            };
            const hotelData = {
              id: "Hotels",
              color: colors.greenAccent[500],
              data: [],
            };

            // Initialize data for all 12 months
            for (let month = 1; month <= 12; month++) {
              const monthData = response.data.find((item) => {
                const [m, y] = item.month.split("/");
                return parseInt(m) === month && parseInt(y) === selectedYear;
              });

              tourData.data.push({
                x: `${month}/${selectedYear}`,
                y: monthData && monthData.tourRevenue ? Number(monthData.tourRevenue) / 1000000 : 0,
              });
              hotelData.data.push({
                x: `${month}/${selectedYear}`,
                y: monthData && monthData.hotelRevenue ? Number(monthData.hotelRevenue) / 1000000 : 0,
              });
            }

            const formattedData = [tourData, hotelData];
            console.log("Formatted Data:", JSON.stringify(formattedData, null, 2));
            setData(formattedData);
          }
        } else {
          setErrorMessage(`Lỗi API: Mã ${response.code || "không xác định"}.`);
          setData([]);
          console.error("API error:", response);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
        setErrorMessage(`Lỗi kết nối API: ${error.message}.`);
        setData([]);
        toast.error("Không thể tải dữ liệu biểu đồ!", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, [selectedYear]);

  return (
    <Box height="100%" position="relative" sx={{ overflow: "hidden" }}>
      <Box height={isDashboard ? "180px" : "360px"} sx={{ width: "100%" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="error">{errorMessage}</Typography>
          </Box>
        ) : data.length === 0 || data.every((d) => d.data.every((point) => point.y === 0)) ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography>Không có dữ liệu doanh thu để hiển thị cho năm {selectedYear}.</Typography>
          </Box>
        ) : (
          <ResponsiveLine
            data={data}
            theme={{
              axis: {
                domain: { line: { stroke: colors.grey[100] } },
                legend: { text: { fill: colors.grey[100] } },
                ticks: {
                  line: { stroke: colors.grey[100], strokeWidth: 1 },
                  text: { fill: colors.grey[100], fontSize: 10 },
                },
              },
              legends: { text: { fill: colors.grey[100], fontSize: 10 } },
              tooltip: { container: { color: colors.primary[500] } },
            }}
            colors={data.map((d) => d.color)}
            margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 0,
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat={(value) => `${Math.round(value)}M VNĐ`}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 45,
              legend: isDashboard ? undefined : "Tháng",
              legendOffset: 36,
              legendPosition: "middle",
              format: (value) => value.split("/")[0], // Show only month number
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: isDashboard ? undefined : "Doanh thu (triệu VNĐ)",
              legendOffset: -40,
              legendPosition: "middle",
              format: (value) => `${Math.round(value)}M`,
            }}
            enableGridX={false}
            enableGridY={true}
            pointSize={6}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 40,
                translateY: -10,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 50,
                itemHeight: 16,
                itemOpacity: 0.75,
                symbolSize: 10,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            tooltip={({ point }) => (
              <div style={{ padding: 12, background: "#222", color: "#fff" }}>
                <strong>{point.data.x}</strong><br />
                {point.serieId}: {Math.round(point.data.y)}M VNĐ
              </div>
            )}
          />
        )}
      </Box>
    </Box>
  );
};

export default LineChart;