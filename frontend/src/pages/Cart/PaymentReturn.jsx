import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";
import Header from "../../components/Common/Header/Header";
import "./cart.css";

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    document.title = "Payment Return - GoTravel";
    window.scrollTo(0, 0);
    fetchPaymentStatus();
    fetchCartCount();
  }, []);

  const fetchPaymentStatus = async () => {
    const query = new URLSearchParams(location.search);
    const queryParams = Object.fromEntries(query.entries());

    if (!queryParams.vnp_TxnRef || !queryParams.vnp_ResponseCode) {
      setPaymentStatus({ success: false, message: "Thông tin thanh toán không hợp lệ!" });
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/checkout/success", {
        params: queryParams,
      });
      if (response.data.code === 200) {
        setPaymentStatus({ success: true, message: "Thanh toán thành công!", order: response.data.order });
      } else {
        setPaymentStatus({ success: false, message: response.data.message || "Thanh toán thất bại!" });
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
      setPaymentStatus({ success: false, message: "Có lỗi xảy ra khi kiểm tra trạng thái thanh toán!" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await api.get("/carts");
      if (response.status === 200) {
        const totalQuantity = response.data.tours.reduce((total, item) =>
          total + item.timeStarts.reduce((sum, time) => sum + time.quantity, 0), 0) +
          response.data.hotels.reduce((total, hotel) =>
            total + hotel.rooms.reduce((sum, room) => sum + room.quantity, 0), 0);
        setCartCount(totalQuantity);
      }
    } catch (error) {
      console.error("Không thể tải số lượng giỏ hàng:", error);
      setCartCount(0); // Nếu lỗi, đặt cartCount về 0
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
      <Header cartCount={cartCount} />
      <section className="payment-return-section">
        <Container>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang kiểm tra trạng thái thanh toán...</p>
            </div>
          ) : (
            <Card className="card">
              <Card.Body>
                <h2 className={paymentStatus?.success ? "success" : "error"}>
                  {paymentStatus?.success ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
                </h2>
                <p>{paymentStatus?.message}</p>
                <div className="d-flex justify-content-center gap-3">
                  <Button variant="primary" onClick={handleContinueShopping}>
                    Tiếp tục mua sắm
                  </Button>
                  {paymentStatus?.success && (
                    <Button variant="success" onClick={handleViewInvoice}>
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