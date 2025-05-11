import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";
import Header from "../../components/Common/Header/Header";
import { useCart } from "../../context/CartContext";
import "./cart.css";

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCart, clearCart, isLoading } = useCart();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    document.title = "Payment Return - GoTravel";
    window.scrollTo(0, 0);
    fetchPaymentStatus();
  }, []);

  const fetchPaymentStatus = async () => {
    const query = new URLSearchParams(location.search);
    const vnp_TxnRef = query.get("vnp_TxnRef");
    const vnp_ResponseCode = query.get("vnp_ResponseCode");

    if (!vnp_TxnRef || !vnp_ResponseCode) {
      setPaymentStatus({ success: false, message: "Thông tin thanh toán không hợp lệ!" });
      return;
    }

    try {
      const response = await api.get(`/api/v1/checkout/success${location.search}`);
      if (response.data.code === 200) {
        setPaymentStatus({
          success: true,
          message: "Thanh toán thành công!",
          order: response.data.order,
        });
        await clearCart(); // Xóa giỏ hàng sau khi thanh toán thành công
        await fetchCart(); // Đồng bộ giỏ hàng
      } else {
        setPaymentStatus({
          success: false,
          message: response.data.message || "Thanh toán thất bại!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
      setPaymentStatus({
        success: false,
        message: "Có lỗi xảy ra khi kiểm tra trạng thái thanh toán!",
      });
    }
  };

  const handleContinueShopping = () => {
    navigate("/tours");
  };

  const handleViewInvoice = () => {
    if (paymentStatus?.order?._id) {
      navigate(`/invoices/${paymentStatus.order._id}`);
    }
  };

  return (
    <>
      <Header />
      <section className="payment-return-section">
        <Container>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang kiểm tra trạng thái thanh toán...</p>
            </div>
          ) : (
            <Card className="payment-card">
              <Card.Body>
                <h2 className={paymentStatus?.success ? "success" : "error"}>
                  {paymentStatus?.success
                    ? "Thanh toán thành công!"
                    : "Thanh toán thất bại!"}
                </h2>
                <p>{paymentStatus?.message}</p>
                {paymentStatus?.success && paymentStatus.order && (
                  <div className="order-details">
                    <h4>Thông tin đơn hàng</h4>
                    <p>
                      <strong>Mã đơn hàng:</strong> {paymentStatus.order.orderCode}
                    </p>
                    <p>
                      <strong>Tổng tiền:</strong>{" "}
                      {paymentStatus.order.totalPrice.toLocaleString()} VNĐ
                    </p>
                    <p>
                      <strong>Trạng thái:</strong> {paymentStatus.order.status}
                    </p>
                  </div>
                )}
                <div className="d-flex justify-content-center gap-3">
                  <Button
                    variant="primary"
                    onClick={handleContinueShopping}
                    disabled={isLoading}
                  >
                    Tiếp tục mua sắm
                  </Button>
                  {paymentStatus?.success && (
                    <Button
                      variant="success"
                      onClick={handleViewInvoice}
                      disabled={isLoading}
                    >
                      Xem hóa đơn
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Container>
      </section>
    </>
  );
};

export default PaymentReturn;