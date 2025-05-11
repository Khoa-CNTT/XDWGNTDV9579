import api from "../../utils/api";

const BASE_URL = "http://localhost:3000/api/v1/admin/orders";

// Lấy danh sách hóa đơn
export const getInvoices = async (params = {}) => {
    try {
        const response = await api.get(BASE_URL, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        console.log("getInvoices response:", response.data);

        // Kiểm tra nếu response là mảng rỗng
        if (Array.isArray(response.data) && response.data.length === 0) {
            return [];
        }

        // Kiểm tra nếu có lỗi từ backend
        if (response.data.code === 400) {
            throw new Error(response.data.message);
        }

        return response.data;
    } catch (error) {
        console.error("getInvoices error:", error);
        throw error;
    }
};

// Thay đổi trạng thái hóa đơn
export const changeInvoiceStatus = async (id, status) => {
    try {
        const response = await api.patch(`${BASE_URL}/changeStatus/${status}/${id}`, null, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        console.log("changeInvoiceStatus response:", response.data);
        return response.data;
    } catch (error) {
        console.error("changeInvoiceStatus error:", error);
        throw error;
    }
};

// Lấy chi tiết hóa đơn
export const getInvoiceDetail = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}/detail/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        console.log("getInvoiceDetail response:", response.data);
        return response.data;
    } catch (error) {
        console.error("getInvoiceDetail error:", error);
        throw error;
    }
};

// Xóa hóa đơn
export const deleteInvoice = async (id) => {
    try {
        const response = await api.delete(`${BASE_URL}/delete/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        console.log("deleteInvoice response:", response.data);
        return response.data;
    } catch (error) {
        console.error("deleteInvoice error:", error);
        throw error;
    }
};

// Lấy dữ liệu thống kê doanh thu
export const getRevenueStatistics = async (params) => {
    try {
        const response = await api.get(`${BASE_URL}/statistics`, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};