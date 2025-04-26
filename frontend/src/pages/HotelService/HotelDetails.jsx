import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  ListGroup,
  Card,
  Stack,
  Table,
  Form,
  Button,
} from "react-bootstrap";
import ImageGallery from "react-image-gallery";
import { useAuth } from "../../context/AuthContext";
import "./hotel.css";

const HotelDetails = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Chi tiết khách sạn - GoTravel";
    window.scrollTo(0, 0);
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/hotels/${hotelId}`);
      if (response.data.code === 200) {
        setHotel(response.data.hotel);
        setRooms(response.data.rooms);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết khách sạn:", error);
      toast.error("Không thể tải chi tiết khách sạn!");
    } finally {
      setLoading(false);
    }
  };

  const galleryImages = hotel?.images.map((img) => ({
    original: img,
    thumbnail: img,
  })) || [];

  const handleAddToCart = async (roomId, quantity) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt phòng!");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Vui lòng chọn ngày check-in và check-out!");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error("Ngày check-out phải sau ngày check-in!");
      return;
    }

    try {
      const response = await api.post(`/carts/add/${hotelId}/${roomId}`, {
        quantity,
        checkIn,
        checkOut,
      });
      if (response.data.code === 200) {
        toast.success("Đã thêm phòng vào giỏ hàng!");
        // Cập nhật số lượng giỏ hàng trong Header (có thể dispatch một event hoặc dùng context)
        const cartResponse = await api.get("/checkout");
        const cart = cartResponse.data;
        const tourQuantity = cart.tours.reduce((total, item) => total + item.quantity, 0);
        const roomQuantity = cart.hotels.reduce(
          (total, hotel) => total + hotel.rooms.reduce((sum, room) => sum + room.quantity, 0),
          0
        );
        window.dispatchEvent(
          new CustomEvent("cartUpdate", { detail: { cartCount: tourQuantity + roomQuantity } })
        );
      }
    } catch (error) {
      console.error("Lỗi khi thêm phòng vào giỏ hàng:", error);
      toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng!");
    }
  };

  return (
    <>
      <Breadcrumbs
        title={hotel?.name || "Chi tiết khách sạn"}
        pagename="Dịch vụ khách sạn"
        childpagename={hotel?.name || "Chi tiết"}
      />
      <section className="hotel-section">
        <Container>
          {loading ? (
            <p>Đang tải chi tiết khách sạn...</p>
          ) : !hotel ? (
            <p>Không tìm thấy khách sạn.</p>
          ) : (
            <Row>
              <h1 className="hotel-details-title mb-4">{hotel.name}</h1>
              <div className="hotel-gallery">
                <ImageGallery
                  items={galleryImages}
                  showNav={false}
                  showBullets={false}
                  showPlayButton={false}
                />
              </div>

              <Tab.Container id="hotel-tabs" defaultActiveKey="1">
                <Row className="py-5">
                  <Col md={8} className="mb-3 mb-md-0">
                    <Col md={12}>
                      <Nav variant="pills" className="hotel-nav rounded-2">
                        <Nav.Item>
                          <Nav.Link eventKey="1">Tổng quan</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="2">Phòng</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="3">Vị trí</Nav.Link>
                        </Nav.Item>
                      </Nav>
                    </Col>

                    <Tab.Content className="hotel-content-details mt-4">
                      <Tab.Pane eventKey="1">
                        <h1 className="h3">Tổng quan</h1>
                        <p className="body-text">{hotel.description || "Chưa có mô tả."}</p>

                        <h5 className="font-bold mb-2 h5 mt-3">Thông tin khách sạn</h5>
                        <ListGroup>
                          <ListGroup.Item className="body-text">
                            <strong>Địa điểm:</strong> {hotel.location.city},{" "}
                            {hotel.location.country}
                          </ListGroup.Item>
                          <ListGroup.Item className="body-text">
                            <strong>Địa chỉ:</strong> {hotel.location.address}
                          </ListGroup.Item>
                        </ListGroup>
                      </Tab.Pane>

                      <Tab.Pane eventKey="2">
                        <h1 className="h3">Danh sách phòng</h1>
                        <Form className="hotel-form mb-4">
                          <Row>
                            <Col md={6}>
                              <Form.Group controlId="checkIn">
                                <Form.Label>Ngày check-in</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={checkIn}
                                  onChange={(e) => setCheckIn(e.target.value)}
                                  min={new Date().toISOString().split("T")[0]}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId="checkOut">
                                <Form.Label>Ngày check-out</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={checkOut}
                                  onChange={(e) => setCheckOut(e.target.value)}
                                  min={
                                    checkIn
                                      ? new Date(new Date(checkIn).getTime() + 86400000)
                                          .toISOString()
                                          .split("T")[0]
                                      : new Date().toISOString().split("T")[0]
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Form>

                        {rooms.length === 0 ? (
                          <p>Khách sạn này hiện không có phòng nào.</p>
                        ) : (
                          <Table striped bordered hover className="hotel-table">
                            <thead>
                              <tr>
                                <th>Tên phòng</th>
                                <th>Giá (VNĐ/đêm)</th>
                                <th>Tiện ích</th>
                                <th>Số phòng trống</th>
                                <th>Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rooms.map((room) => (
                                <tr key={room._id}>
                                  <td>{room.name}</td>
                                  <td>{room.price.toLocaleString()}</td>
                                  <td>{room.amenities || "Không có"}</td>
                                  <td>{room.availableRooms}</td>
                                  <td>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleAddToCart(room._id, 1)}
                                      disabled={room.availableRooms === 0}
                                    >
                                      <i className="bi bi-cart-plus"></i> Đặt phòng
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                        {checkIn && checkOut && (
                          <p className="hotel-date-info mt-3">
                            Bạn đã chọn: Check-in <strong>{checkIn}</strong>, Check-out{" "}
                            <strong>{checkOut}</strong>
                          </p>
                        )}
                      </Tab.Pane>

                      <Tab.Pane eventKey="3">
                        <h1 className="h3">Vị trí</h1>
                        <div className="hotel-map">
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1010296.398675619!2d114.41207770371561!3d-8.453560368052777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd141d3e8100fa1%3A0x24910fb14b24e690!2sBali%2C%20Indonesia!5e0!3m2!1sen!2sin!4v1724581274620!5m2!1sen!2sin"
                            width="100%"
                            height="400px"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>

                  <Col md={4}>
                    <aside>
                      <Card className="hotel-price-card mb-4">
                        <Card.Body>
                          <Stack gap={2} direction="horizontal">
                            <h1 className="h2">
                              {rooms.length > 0
                                ? `${Math.min(...rooms.map((r) => r.price)).toLocaleString()} VNĐ`
                                : "Liên hệ"}
                            </h1>
                            <span className="fs-4"> /đêm</span>
                          </Stack>
                          <Button
                            variant="primary"
                            className="w-100 mt-3"
                            href="#rooms"
                            onClick={() => document.querySelector("#hotel-tabs-tab-2").click()}
                          >
                            Xem phòng
                          </Button>
                        </Card.Body>
                      </Card>

                      <Card className="hotel-support-card">
                        <Card.Body>
                          <h1 className="h3">Cần giúp đỡ?</h1>
                          <ListGroup>
                            <ListGroup.Item>
                              <i className="bi bi-telephone me-1"></i> Gọi cho chúng tôi{" "}
                              <strong>+84 779407905</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <i className="bi bi-alarm me-1"></i> Thời gian:{" "}
                              <strong>8AM to 7PM</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>
                                <i className="bi bi-headset me-1"></i> Hãy để chúng tôi gọi bạn
                              </strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <i className="bi bi-calendar-check me-1"></i>{" "}
                              <strong>Đặt lịch hẹn</strong>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </aside>
                  </Col>
                </Row>
              </Tab.Container>
            </Row>
          )}
        </Container>
      </section>
    </>
  );
};

export default HotelDetails;