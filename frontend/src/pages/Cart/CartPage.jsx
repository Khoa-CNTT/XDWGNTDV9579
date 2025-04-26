import React, { useState, useEffect } from "react";
import CartItem from "./CartItem";
import CartForm from "./CartForm";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./cart.css";

const CartPage = () => {
  const [cart, setCart] = useState({ tours: [], hotels: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    document.title = "Giỏ hàng - GoTravel";
    window.scrollTo(0, 0);
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    if (!user) {
      setCart({ tours: [], hotels: [], totalPrice: 0 });
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/carts");
      if (response.data.code === 200) {
        setCart(response.data);
        await fetchCartCount(); // Cập nhật số lượng trên biểu tượng giỏ hàng
      } else {
        toast.error(response.data.message || "Không thể tải giỏ hàng!");
        setCart({ tours: [], hotels: [], totalPrice: 0 });
      }
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      toast.error("Không thể tải giỏ hàng!");
      setCart({ tours: [], hotels: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateTourQuantity = async (tourId, quantity) => {
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }
    try {
      const response = await api.patch(`/carts/update/${tourId}/${quantity}`);
      if (response.data.code === 200) {
        setCart(response.data.data);
        toast.success("Cập nhật số lượng tour thành công!");
        await fetchCartCount();
      } else {
        toast.error(response.data.message || "Không thể cập nhật số lượng!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng tour:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật số lượng!");
    }
  };

  const updateRoomQuantity = async (hotelId, roomId, quantity) => {
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }
    try {
      const response = await api.patch(`/carts/updateRoom/${hotelId}/${roomId}/${quantity}`);
      if (response.data.code === 200) {
        setCart(response.data.data);
        toast.success("Cập nhật số lượng phòng thành công!");
        await fetchCartCount();
      } else {
        toast.error(response.data.message || "Không thể cập nhật số lượng!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng phòng:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật số lượng!");
    }
  };

  const removeTour = async (tourId) => {
    try {
      const response = await api.patch(`/carts/delete/${tourId}`);
      if (response.data.code === 200) {
        setCart(response.data.data);
        toast.success("Xóa tour khỏi giỏ hàng thành công!");
        await fetchCartCount();
      } else {
        toast.error(response.data.message || "Không thể xóa tour!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa tour:", error);
      toast.error(error.response?.data?.message || "Không thể xóa tour!");
    }
  };

  const removeRoom = async (hotelId, roomId) => {
    try {
      const response = await api.patch(`/carts/deleteHotel/${hotelId}/${roomId}`);
      if (response.data.code === 200) {
        setCart(response.data.data);
        toast.success("Xóa phòng khỏi giỏ hàng thành công!");
        await fetchCartCount();
      } else {
        toast.error(response.data.message || "Không thể xóa phòng!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);
      toast.error(error.response?.data?.message || "Không thể xóa phòng!");
    }
  };

  return (
    <section className="cart-section">
      <Container className="cart-container">
        <Breadcrumbs title="Giỏ Hàng" pagename="Giỏ Hàng" />
        <Row>
          <Col lg={8}>
            <div className="cart-table-container">
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spinner animation="border" variant="primary" />
                  <p>Đang tải giỏ hàng...</p>
                </div>
              ) : cart.tours.length === 0 && cart.hotels.length === 0 ? (
                <p style={{ textAlign: "center", color: "#7f8c8d", padding: "20px" }}>
                  Giỏ hàng của bạn đang trống!
                </p>
              ) : (
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tiêu đề</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.tours.map((item) => (
                      <CartItem
                        key={item.tour_id}
                        item={{
                          id: item.tour_id,
                          name: item.tourInfo.title,
                          price: item.priceNew,
                          quantity: item.quantity,
                          image: item.tourInfo.images[0] || "",
                          discount: item.tourInfo.discount || 0,
                        }}
                        updateQuantity={(id, qty) => updateTourQuantity(item.tour_id, qty)}
                        removeItem={() => removeTour(item.tour_id)}
                      />
                    ))}
                    {cart.hotels.map((hotel) =>
                      hotel.rooms.map((room) => (
                        <CartItem
                          key={`${hotel.hotel_id}-${room.room_id}`}
                          item={{
                            id: `${hotel.hotel_id}-${room.room_id}`,
                            name: `${hotel.hotelInfo.name} - ${room.roomInfo.name}`,
                            price: room.price,
                            quantity: room.quantity,
                            image: room.roomInfo.images[0] || "",
                            discount: 0,
                          }}
                          updateQuantity={(id, qty) =>
                            updateRoomQuantity(hotel.hotel_id, room.room_id, qty)
                          }
                          removeItem={() => removeRoom(hotel.hotel_id, room.room_id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Col>

          <Col lg={4}>
            <div className="order-summary">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="summary-item">
                <span>Tổng tiền hàng:</span>
                <span>{cart.totalPrice.toLocaleString()} VNĐ</span>
              </div>
            </div>
            <CartForm totalPrice={cart.totalPrice} />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CartPage;