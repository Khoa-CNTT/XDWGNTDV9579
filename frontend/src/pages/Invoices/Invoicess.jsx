import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "./invoices.css";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Hóa đơn - GoTravel";
    window.scrollTo(0, 0);

    const fetchInvoices = async () => {
      try {
        const response = await api.get("/invoices");
        if (response.data.code === 200) {
          setInvoices(response.data.data || []);
        } else {
          toast.error(response.data.message || "Không thể tải hóa đơn!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy hóa đơn:", error);
        toast.error("Không thể tải hóa đơn. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <>
      <Breadcrumbs title="Hóa đơn" pagename="Hóa đơn" />
      <div className="invoices-container">
        <h1>Danh sách hóa đơn</h1>
        <div className="invoices-table">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Ngày lập</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>
                      <td>{new Date(invoice.date).toLocaleDateString("vi-VN")}</td>
                      <td>{invoice.amount.toLocaleString()} VNĐ</td>
                      <td>{invoice.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">Chưa có hóa đơn nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Invoices;