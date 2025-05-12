import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/admin/dashboard";

const createApiInstance = (adminToken) => {
    return axios.create({
        baseURL: "http://localhost:3000",
        headers: {
            Authorization: `Bearer ${adminToken || localStorage.getItem("adminToken")}`,
        },
    });
};

// Lấy dữ liệu thống kê dashboard
export const getDashboardStats = async (adminToken, params = {}) => {
    try {
        const api = createApiInstance(adminToken);
        const response = await api.get(BASE_URL, { params });
        console.log("getDashboardStats response:", JSON.stringify(response.data, null, 2));

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "Lỗi khi lấy dữ liệu thống kê");
        }

        return response.data.statistic;
    } catch (error) {
        console.error("getDashboardStats error:", error.response?.data || error);
        throw error;
    }
};