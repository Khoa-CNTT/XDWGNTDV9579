import React from "react";
import { Container, Row, Col, Button, Table, Alert, Form } from "react-bootstrap";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CartForm from "./CartForm";
import "./cart.css";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart();
  const navigate = useNavigate();

  const cartItems = [
    ...cart.tours.flatMap((tour) =>
      tour.timeStarts.map((time) => ({
        type: "tour",
        id: `${tour.tour_id}-${time.timeDepart}`,
        tour_id: tour.tour_id,
        timeDepart: time.timeDepart,
        quantity: time.quantity || 1,
        title: tour.tourInfo?.title || "Tên tour không xác định",
        price: tour.priceNew || tour.tourInfo?.price || 0,
        image: tour.tourInfo?.images?.[0]?.original || "/path/to/fallback-image.jpg",
      }))
    ),
    ...cart.hotels.flatMap((hotel) =>
      hotel.rooms.map((room) => ({
        type: "room",
        id: `${hotel.hotel_id}-${room.room_id}`,
        hotel_id: hotel.hotel_id,
        room_id: room.room_id,
        quantity: room.quantity || 1,
        checkIn: room.checkIn,
        checkOut: room.checkOut,
        title: `${hotel.hotelInfo?.name || "Khách sạn không xác định"} - ${
          room.roomInfo?.name || "Phòng không xác định"
        }`,
        price: room.roomInfo?.price || room.price || 0,
        image:
          room.roomInfo?.images?.[0] ||
          hotel.hotelInfo?.images?.[0] ||
          "/path/to/fallback-image.jpg",
      }))
    ),
  ];

  const calculatedTotalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalPrice =
    cart.totalPrice !== undefined && cart.totalPrice !== null
      ? cart.totalPrice
      : calculatedTotalPrice;

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(
        item.type,
        item.type === "tour"
          ? { id: item.tour_id, timeDepart: item.timeDepart }
          : { hotel_id: item.hotel_id, room_id: item.room_id },
        newQuantity
      );
    } catch (error) {
      // Lỗi đã được xử lý trong updateQuantity
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await removeFromCart(
        item.type,
        item.type === "tour" ? item.tour_id : item.hotel_id,
        item.type === "room" ? item.room_id : undefined
      );
    } catch (error) {
      // Lỗi đã được xử lý trong removeFromCart
    }
  };

  return (
    <>
      <Breadcrumbs title="Giỏ hàng" pagename="Giỏ hàng" />
      <section className="cart_page py-5">
        <Container>
          {cartItems.length === 0 ? (
            <Alert variant="info">Giỏ hàng của bạn đang trống.</Alert>
          ) : (
            <Row>
              <Col lg={8}>
                <h4 className="mb-3">Danh sách tour</h4>
                <Table responsive className="cart-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Tổng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems
                      .filter((item) => item.type === "tour")
                      .map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="cart-item-info">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="cart-item-image"
                              />
                              <div>
                                <h5>{item.title}</h5>
                                <p>
                                  Thời gian khởi hành:{" "}
                                  {new Date(item.timeDepart).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>{item.price.toLocaleString()} VNĐ</td>
                          <td>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item, parseInt(e.target.value))
                              }
                              min="1"
                              style={{ width: "80px" }}
                              disabled={isLoading}
                            />
                          </td>
                          <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(item)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <i className="bi bi-spinner bi-spin"></i>
                              ) : (
                                "Xóa"
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>

                <h4 className="mt-4 mb-3">Danh sách phòng</h4>
                <Table responsive className="cart-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Tổng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems
                      .filter((item) => item.type === "room")
                      .map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="cart-item-info">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="cart-item-image"
                              />
                              <div>
                                <h5>{item.title}</h5>
                                <p>
                                  Check-in: {new Date(item.checkIn).toLocaleDateString("vi-VN")}
                                </p>
                                <p>
                                  Check-out:{" "}
                                  {new Date(item.checkOut).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>{item.price.toLocaleString()} VNĐ</td>
                          <td>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item, parseInt(e.target.value))
                              }
                              min="1"
                              style={{ width: "80px" }}
                              disabled={isLoading}
                            />
                          </td>
                          <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(item)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <i className="bi bi-spinner bi-spin"></i>
                              ) : (
                                "Xóa"
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Col>
              <Col lg={4}>
                <CartForm totalPrice={totalPrice} />
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </>
  );
};

export default CartPage;