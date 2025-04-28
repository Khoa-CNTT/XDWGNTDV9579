import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/orders";

export const getRevenueStatistics = async (params) => {
    try {
        const response = await api.get(BASE_URL, {
            params: {
                ...params,
                status: "confirmed" // Chỉ lấy các đơn hàng đã xác nhận
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        // Xử lý dữ liệu từ API order
        const orders = response.data;
        const statistics = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const key = `${year}-${month}`;

            if (!statistics[key]) {
                statistics[key] = {
                    month: `${month}/${year}`,
                    tours: 0,
                    hotels: 0,
                    totalPrice: 0,
                    tourRevenue: 0,
                    hotelRevenue: 0
                };
            }

            // Đếm số lượng và tính doanh thu tour
            if (order.tours && order.tours.length > 0) {
                order.tours.forEach(tour => {
                    statistics[key].tours += tour.quantity || 0;
                    statistics[key].tourRevenue += (tour.price || 0) * (tour.quantity || 0);
                });
            }

            // Đếm số lượng và tính doanh thu phòng khách sạn
            if (order.hotels && order.hotels.length > 0) {
                order.hotels.forEach(hotel => {
                    if (hotel.rooms && hotel.rooms.length > 0) {
                        hotel.rooms.forEach(room => {
                            statistics[key].hotels += room.quantity || 0;
                            statistics[key].hotelRevenue += (room.price || 0) * (room.quantity || 0);
                        });
                    }
                });
            }

            // Tính tổng doanh thu
            statistics[key].totalPrice = statistics[key].tourRevenue + statistics[key].hotelRevenue;
        });

        // Chuyển đổi object thành mảng và sắp xếp theo thời gian
        const result = Object.values(statistics).sort((a, b) => {
            const [monthA, yearA] = a.month.split('/');
            const [monthB, yearB] = b.month.split('/');
            return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });

        console.log("Dữ liệu thống kê:", result); // Thêm log để kiểm tra dữ liệu

        return {
            code: 200,
            message: "Lấy dữ liệu thống kê thành công!",
            data: result
        };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        throw error;
    }
};
