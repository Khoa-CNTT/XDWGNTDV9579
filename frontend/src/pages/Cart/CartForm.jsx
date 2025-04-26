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
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(totalPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    // Tự động điền thông tin từ user trong AuthContext
    if (user) {
      setCustomer({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    // Cập nhật giá cuối cùng khi totalPrice hoặc discount thay đổi
    const priceAfterDiscount = totalPrice - discount;
    setFinalPrice(priceAfterDiscount > 0 ? priceAfterDiscount : 0);
  }, [totalPrice, discount]);

  const validateForm = () => {
    const newErrors = { name: "", email: "", phone: "" };
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

  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }
    try {
      const response = await api.post("/vouchers/apply", { code: voucherCode });
      if (response.data.code === 200) {
        const discountValue = response.data.discount || 0;
        setDiscount(discountValue);
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        toast.error(response.data.message || "Mã giảm giá không hợp lệ!");
      }
    } catch (error) {
      toast.error("Không thể áp dụng mã giảm giá!");
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    if (finalPrice === 0) {
      toast.error("Giỏ hàng trống, không thể thanh toán!");
      return;
    }

    // Validate thông tin khách hàng
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và chính xác thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/orders/vnpay", {
        amount: finalPrice,
        orderInfo: `Thanh toán đơn hàng #${Date.now()} cho khách hàng ${customer.name}`,
        customer, // Gửi thông tin khách hàng
        voucherCode, // Gửi mã giảm giá nếu có
      });

      if (response.data.code === 200) {
        const paymentUrl = response.data.data;
        window.location.href = paymentUrl; // Chuyển hướng tới URL VNPay
      } else {
        toast.error(response.data.message || "Không thể tạo URL thanh toán!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo URL thanh toán:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi của trường khi người dùng bắt đầu nhập
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
          <Form.Label>Mã giảm giá</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <Button variant="primary" onClick={handleApplyVoucher}>
              Áp dụng
            </Button>
          </div>
        </Form.Group>
        <div className="cart-summary-details mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Tạm tính:</span>
            <span>{totalPrice.toLocaleString()} VNĐ</span>
          </div>
          {discount > 0 && (
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString()} VNĐ</span>
            </div>
          )}
          <div className="d-flex justify-content-between fw-bold">
            <span>Tổng cộng:</span>
            <span>{finalPrice.toLocaleString()} VNĐ</span>
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