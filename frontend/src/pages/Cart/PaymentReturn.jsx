import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/Common/Header/Header";
import { useCart } from "../../context/CartContext";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCart, isLoading: isCartLoading } = useCart();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [orderCode, setOrderCode] = useState(null);

  useEffect(() => {
    document.title = "Payment Result - GoTravel";
    window.scrollTo(0, 0);
    fetchPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchPaymentStatus = () => {
    setIsCheckingPayment(true);
    const query = new URLSearchParams(location.search);
    const orderCode = query.get("orderCode");
    const message = query.get("message");

    if (message) {
      setPaymentStatus({ success: false, message: decodeURIComponent(message) });
      toast.error(decodeURIComponent(message));
      setIsCheckingPayment(false);
    } else if (orderCode) {
      setOrderCode(orderCode);
      setPaymentStatus({ success: true, message: "Thanh toán thành công!" });
      fetchCart().catch((err) => {
        console.error("Lỗi khi làm mới giỏ hàng:", err);
        toast.error("Không thể làm mới giỏ hàng, vui lòng thử lại!");
      });
      setIsCheckingPayment(false);
    } else {
      setPaymentStatus({ success: false, message: "Thông tin thanh toán không hợp lệ!" });
      toast.error("Thông tin thanh toán không hợp lệ!");
      setIsCheckingPayment(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/tours");
  };

  const handleViewInvoice = () => {
    if (orderCode) {
      navigate(`/invoices?orderCode=${orderCode}`);
    } else {
      toast.error("Không tìm thấy thông tin hóa đơn!");
    }
  };

  return (
    <>
      <Header />
      <section className="payment-return-section">
        <Container>
          {isCheckingPayment ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang kiểm tra trạng thái thanh toán...</p>
            </div>
          ) : (
            <Card className="payment-card">
              <Card.Body>
                <h2 className={paymentStatus?.success ? "text-success" : "text-danger"}>
                  {paymentStatus?.success ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
                </h2>
                <p>{paymentStatus?.message}</p>

                {paymentStatus?.success && orderCode && (
                  <div className="order-details">
                    <h4>Thông tin đơn hàng</h4>
                    <p>
                      <strong>Mã đơn hàng:</strong> {orderCode}
                    </p>
                  </div>
                )}

                <div className="d-flex justify-content-center gap-3 mt-3">
                  <Button
                    variant="primary"
                    onClick={handleContinueShopping}
                    disabled={isCartLoading}
                    aria-label="Tiếp tục mua sắm"
                  >
                    Tiếp tục mua sắm
                  </Button>
                  {paymentStatus?.success && (
                    <Button
                      variant="success"
                      onClick={handleViewInvoice}
                      disabled={isCartLoading}
                      aria-label="Xem hóa đơn"
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

export default PaymentResult;