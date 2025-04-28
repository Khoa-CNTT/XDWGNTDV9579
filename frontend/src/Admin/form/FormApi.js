import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/accounts";

// Lấy thông tin tài khoản qua /accounts và lọc theo _id
export const getAdminInfo = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}`);
        console.log("getAdminInfo response:", JSON.stringify(response.data, null, 2));
        const account = response.data.find(acc => acc._id === id);
        if (!account) {
            throw new Error("Không tìm thấy tài khoản với ID: " + id);
        }
        return {
            code: 200,
            message: "Lấy thông tin tài khoản thành công",
            data: account
        };
    } catch (error) {
        console.error("getAdminInfo error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

// Cập nhật thông tin tài khoản
export const updateAdminInfo = async (id, formData) => {
    try {
        const response = await api.patch(`${BASE_URL}/edit/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("updateAdminInfo response:", JSON.stringify(response.data, null, 2));
        // Backend không trả data.avatar, trả về response gốc và xử lý ở Setting.js
        return response.data;
    } catch (error) {
        console.error("updateAdminInfo error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};