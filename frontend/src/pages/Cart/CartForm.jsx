import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import "./cart.css";

const CartForm = ({ totalPrice }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    note: "", // Thêm trường note
  });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "", note: "" });

  useEffect(() => {
    if (user) {
      setCustomer({
        name: user.fullName || "", // Sử dụng fullName từ user
        email: user.email || "",
        phone: user.phone || "",
        note: "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = { name: "", email: "", phone: "", note: "" };
    let isValid = true;

    if (!customer.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên!";
      isValid = false;
    }

    if (!customer.email.trim()) {
      newErrors.email = "Vui lòng nhập email!";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      newErrors.email = "Email không hợp lệ!";
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

    if (totalPrice === 0) {
      toast.error("Giỏ hàng trống, không thể thanh toán!");
      return;
    }

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và chính xác thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Bước 1: Tạo đơn hàng
      const orderResponse = await api.post("/checkout/order", {
        fullName: customer.name,
        phone: customer.phone,
        note: customer.note,
        voucherCode: voucherCode || undefined, // Chỉ gửi nếu có voucherCode
      });

      if (orderResponse.data.status === "200") { // API trả về status thay vì code
        const orderId = orderResponse.data.order._id;

        // Bước 2: Tạo URL thanh toán VNPay
        const paymentResponse = await api.post(`/checkout/payment/${orderId}`);
        if (paymentResponse.data.paymentUrl) {
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          toast.error("Không thể tạo URL thanh toán!");
        }
      } else {
        toast.error(orderResponse.data.message || "Không thể tạo đơn hàng!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng hoặc URL thanh toán:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng!");
    } finally {
      setIsSubmitting(false);
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
            name="name"
            value={customer.name}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={customer.email}
            onChange={handleInputChange}
            placeholder="Nhập email"
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
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
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
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
          />
          <Form.Control.Feedback type="invalid">
            {errors.note}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mã giảm giá</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập mã giảm giá"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
          />
          <small className="text-muted">
            Mã giảm giá sẽ được áp dụng khi tạo đơn hàng.
          </small>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Thanh toán với VNPay"
          )}
        </Button>
      </Form>
    </div>
  );
};

export default CartForm;