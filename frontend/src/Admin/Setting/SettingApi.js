import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/settings";

// Lấy thông tin web 
export const getAdminInfo = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}`);
        console.log("getAdminInfo response:", JSON.stringify(response.data, null, 2));
        const account = response.data.find(acc => acc._id === id);
        if (!account) {
            throw new Error("Không tìm thấy website với ID: " + id);
        }
        return {
            code: 200,
            message: "Lấy thông tin website thành công",
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

// Cập nhật thông tin website
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

// Lấy thông tin cài đặt chung
export const getGeneralSettings = async () => {
    try {
        const response = await api.get(`${BASE_URL}/general`);
        console.log("getGeneralSettings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("getGeneralSettings error:", error);
        throw error;
    }
};

// Cập nhật thông tin cài đặt chung
export const updateGeneralSettings = async (data) => {
    try {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'logo' && data[key] instanceof File) {
                formData.append('logo', data[key]);
            } else {
                formData.append(key, data[key]);
            }
        });

        const response = await api.patch(`${BASE_URL}/general`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("updateGeneralSettings response:", response.data);
        return response.data;
    } catch (error) {
        console.error("updateGeneralSettings error:", error);
        throw error;
    }
};