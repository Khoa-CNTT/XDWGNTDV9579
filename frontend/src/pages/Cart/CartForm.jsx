import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../utils/api";
import "./cart.css";

const CartForm = ({ totalPrice }) => {
  const { user } = useAuth();
  const { cart, checkout, fetchCart, clearCart, isLoading } = useCart(); // Thêm `cart` vào đây
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    note: "",
  });
  const [errors, setErrors] = useState({ fullName: "", phone: "", note: "" });

  useEffect(() => {
    if (user) {
      setCustomer({
        fullName: user.fullName || "",
        phone: user.phone || "",
        note: "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = { fullName: "", phone: "", note: "" };
    let isValid = true;

    if (!customer.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên!";
      isValid = false;
    }

    if (!customer.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại!";
      isValid = false;
    } else if (!/^\d{10,11}$/.test(customer.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    if (!cart.tours.length && !cart.hotels.length) {
      toast.error("Giỏ hàng trống, không thể thanh toán!");
      return;
    }

    if (totalPrice === 0) {
      toast.error("Tổng tiền bằng 0, không thể thanh toán!");
      return;
    }

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và chính xác thông tin!");
      return;
    }

    try {
      await fetchCart(); // Đồng bộ giỏ hàng trước khi thanh toán

      // Tạo đơn hàng
      const orderData = {
        fullName: customer.fullName,
        phone: customer.phone,
        note: customer.note,
        voucherCode: voucherCode || undefined,
      };

      const orderResponse = await api.post("/api/v1/checkout/order", orderData);
      const orderId = orderResponse.data.order._id;

      if (!orderId) {
        throw new Error("Không thể tạo đơn hàng!");
      }

      // Tạo URL thanh toán VNPay
      const paymentResponse = await api.post(`/api/v1/checkout/payment/${orderId}`);
      const paymentUrl = paymentResponse.data.paymentUrl;

      if (paymentUrl) {
        await clearCart(); // Xóa giỏ hàng trước khi chuyển hướng
        window.location.href = paymentUrl; // Chuyển hướng đến VNPay
      } else {
        await clearCart(); // Xóa giỏ hàng nếu không cần thanh toán
        toast.success("Đặt hàng thành công nhưng không cần thanh toán!");
        navigate("/payment-success");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo đơn hàng!"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="cart-form">
      <h3 className="fs-4 fw-bold mb-3">Thông tin thanh toán</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Họ và tên</Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            value={customer.fullName}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            isInvalid={!!errors.fullName}
            disabled={isLoading}
          />
          <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại"
            isInvalid={!!errors.phone}
            disabled={isLoading}
          />
          <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Ghi chú</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="note"
            value={customer.note}
            onChange={handleInputChange}
            placeholder="Nhập ghi chú (nếu có)"
            isInvalid={!!errors.note}
            disabled={isLoading}
          />
          <Form.Control.Feedback type="invalid">{errors.note}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mã giảm giá</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập mã giảm giá"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            disabled={isLoading}
          />
          <small className="text-muted">Mã giảm giá sẽ được áp dụng khi tạo đơn hàng.</small>
        </Form.Group>
        <div className="cart-summary-details mb-3">
          <div className="d-flex justify-content-between fw-bold">
            <span>Tổng cộng:</span>
            <span>{totalPrice.toLocaleString()} VNĐ</span>
          </div>
        </div>
        <Button
          variant="primary"
          className="w-100"
          onClick={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? <Spinner animation="border" size="sm" /> : "Thanh toán"}
        </Button>
      </Form>
    </div>
  );
};

export default CartForm;