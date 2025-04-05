import React, { useState, useEffect } from "react";
import CartItem from "./CartItem";
import CartForm from "./CartForm";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs"; // ✅ Thêm Breadcrumbs
import { Table, Container, Row, Col, Card } from "react-bootstrap";
import Header from "../../components/Common/Header/Header";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Tour Đà Nẵng", price: 1350000, discount: 0, quantity: 1, image: "" },
    { id: 2, name: "Tour Sapa", price: 1650000, discount: 10, quantity: 2, image: "" }
  ]);

  useEffect(() => {
    document.title = "Giỏ hàng - GoTravel"; // ✅ Đặt tiêu đề trang
    window.scrollTo(0, 0); // ✅ Cuộn lên đầu trang khi vào giỏ hàng
  }, []);

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * (item.price * (1 - item.discount / 100)),
      0
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));
  };

  return (
    <>
      <Header cartCount={totalQuantity} /> {/* ✅ Truyền số lượng vào giỏ hàng */}
      <Breadcrumbs title="Giỏ Hàng" pagename="Giỏ Hàng" /> {/* ✅ Thêm Breadcrumbs */}

      <section className="cart-section py-5"> {/* ✅ Thêm class giống Booking */}
        <Container>
          <Row>
            <Col md={8}>
              <Card className="p-3 shadow-sm">
                <h2>🛒 Giỏ Hàng</h2>
                <Table responsive striped bordered hover className="text-center">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tiêu đề</th>
                      <th>Giá</th>
                      <th>Giảm giá</th>
                      <th>Số lượng</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} removeItem={removeItem} updateQuantity={updateQuantity} />
                    ))}
                  </tbody>
                </Table>
                <h3 className="text-end">💰 Tổng thanh toán: {calculateTotal().toLocaleString()}đ</h3>
              </Card>
            </Col>

            <Col md={4}>
              <CartForm />
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default CartPage;
