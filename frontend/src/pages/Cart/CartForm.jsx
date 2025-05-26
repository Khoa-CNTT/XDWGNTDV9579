import { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../utils/api";

const CartForm = ({ totalPrice }) => {
  const { user } = useAuth();
  const { cart, fetchCart, isLoading } = useCart();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });
  const [errors, setErrors] = useState({ fullName: "", phone: "", email: "", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomer({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        note: "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = { fullName: "", phone: "", email: "", note: "" };
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

    for (const tour of cart.tours) {
      for (const time of tour.timeStarts) {
        if (time.quantity > time.stock) {
          newErrors.note = `Số lượng tour ${tour.tourInfo.title} vượt quá số lượng còn lại (${time.stock})!`;
          isValid = false;
        }
        if (new Date(time.timeDepart) < new Date()) {
          newErrors.note = `Thời gian khởi hành của tour ${tour.tourInfo.title} không hợp lệ (ngày trong quá khứ)!`;
          isValid = false;
        }
      }
    }
    for (const hotel of cart.hotels) {
      for (const room of hotel.rooms) {
        if (room.quantity > room.roomInfo.availableRooms) {
          newErrors.note = `Số lượng phòng ${room.roomInfo.name} vượt quá số lượng còn lại (${room.roomInfo.availableRooms})!`;
          isValid = false;
        }
        const checkInDate = new Date(room.checkIn);
        const checkOutDate = new Date(room.checkOut);
        if (checkInDate >= checkOutDate) {
          newErrors.note = `Ngày check-out của phòng ${room.roomInfo.name} không hợp lệ!`;
          isValid = false;
        }
        const numNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        if (numNights < 1) {
          newErrors.note = `Số đêm của phòng ${room.roomInfo.name} phải ít nhất 1 đêm!`;
          isValid = false;
        }
      }
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

    if (totalPrice <= 0) {
      toast.error("Tổng tiền không hợp lệ, không thể thanh toán!");
      return;
    }

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra thông tin trước khi thanh toán!");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchCart();

      const orderData = {
        userInfor: {
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          note: customer.note,
        },
        tours: cart.tours.map((tour) => ({
          tour_id: tour.tour_id,
          price: tour.priceNew || tour.tourInfo?.price || 0,
          discount: tour.discount || 0,
          timeStarts: tour.timeStarts.map((time) => ({
            timeDepart: time.timeDepart,
            quantity: time.quantity,
          })),
        })),
        hotels: cart.hotels.map((hotel) => ({
          hotel_id: hotel.hotel_id,
          rooms: hotel.rooms.map((room) => ({
            room_id: room.room_id,
            price: room.price || room.roomInfo?.price || 0,
            quantity: room.quantity,
            checkIn: room.checkIn,
            checkOut: room.checkOut,
          })),
        })),
        voucherCode: voucherCode.trim() || undefined,
        totalPrice,
      };

      const orderResponse = await api.post("/api/v1/checkout/order", orderData);
      const orderId = orderResponse.data.order?._id;
      if (!orderId) {
        throw new Error("Không thể tạo đơn hàng: orderId không tồn tại!");
      }

      const paymentResponse = await api.post(`/api/v1/checkout/payment/${orderId}`);
      const paymentUrl = paymentResponse.data.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ VNPay!");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo đơn hàng!");
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
            name="fullName"
            value={customer.fullName}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            isInvalid={!!errors.fullName}
            disabled={isLoading || isSubmitting}
          />
          <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="text"
            name="email"
            value={customer.email}
            onChange={handleInputChange}
            placeholder="Nhập email"
            isInvalid={!!errors.email}
            disabled={isLoading || isSubmitting}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
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
            disabled={isLoading || isSubmitting}
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
            disabled={isLoading || isSubmitting}
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
            disabled={isLoading || isSubmitting}
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
          disabled={isLoading || isSubmitting}
        >
          {isSubmitting ? <Spinner animation="border" size="sm" /> : "Thanh toán"}
        </Button>
      </Form>
    </div>
  );
};

export default CartForm;