import React, { useEffect, useState } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "../Tours/tour.css";
import ImageGallery from "react-image-gallery";
import {
  Container,
  Row,
  Nav,
  Col,
  Tab,
  ListGroup,
  Accordion,
  Card,
  Stack,
  Form,
} from "react-bootstrap";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const TourDetails = () => {
  const { slugTour: tourId } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeDepart, setSelectedTimeDepart] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!tourId || tourId === "undefined") {
      toast.error("ID tour không hợp lệ! Chuyển về trang Tours.");
      navigate("/tours");
      return;
    }

    document.title = "Tours Details - GoTravel";
    window.scrollTo(0, 0);
    fetchTourDetails();
  }, [tourId, navigate]);

  const fetchTourDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tours/detail/${tourId}`);
      if (!response.data || !response.data._id) {
        throw new Error("Dữ liệu tour không hợp lệ");
      }
      const tourData = response.data;
      tourData.images = tourData.images.map((img) => ({
        original: img,
        thumbnail: img,
      }));
      setTour(tourData);

      if (tourData.timeStarts && tourData.timeStarts.length > 0) {
        setSelectedTimeDepart(tourData.timeStarts[0].timeDepart);
      }

      if (tourData.category_id) {
        const categoryResponse = await api.get("/categories");
        const foundCategory = categoryResponse.data.find(
          (cat) => cat._id === tourData.category_id
        );
        setCategory(foundCategory);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết tour:", error);
      const errorMessage = error.response?.data?.message || "Không thể tải chi tiết tour!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt tour!");
      navigate("/login");
      return;
    }

    if (!tour || !tour._id) {
      toast.error("Không tìm thấy tour để thêm vào giỏ hàng!");
      return;
    }

    if (!selectedTimeDepart) {
      toast.error("Vui lòng chọn thời gian khởi hành!");
      return;
    }

    if (quantity <= 0) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }

    const selectedTime = tour.timeStarts.find(
      (time) => new Date(time.timeDepart).getTime() === new Date(selectedTimeDepart).getTime()
    );
    if (!selectedTime) {
      toast.error("Thời gian khởi hành không hợp lệ!");
      return;
    }

    if (quantity > selectedTime.stock) {
      toast.error(`Số lượng vượt quá số chỗ còn lại (${selectedTime.stock})!`);
      return;
    }

    const cartItem = {
      _id: tour._id,
      timeDepart: new Date(selectedTimeDepart).toISOString(),
      quantity: parseInt(quantity),
    };

    try {
      await addToCart("tour", cartItem);
      toast.success("Đã thêm tour vào giỏ hàng!");
      navigate("/cart");
    } catch (error) {
      console.error("Lỗi khi thêm tour vào giỏ hàng:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Không thể thêm tour vào giỏ hàng! Vui lòng thử lại.");
    }
  };

  if (loading) {
    return <p>Đang tải chi tiết tour...</p>;
  }

  if (!tour) {
    return <p>Không tìm thấy tour.</p>;
  }

  const priceAfterDiscount = (tour.price * (100 - (tour.discount || 0)) / 100).toFixed(0);

  return (
    <>
      <Breadcrumbs
        title={tour.title}
        pagename={<NavLink to="/tours">Tours</NavLink>}
        childpagename={tour.title}
      />

      <section className="tour_details py-5">
        <Container>
          <Row>
            <h1 className="fs-2 font-bold mb-4">{tour.title}</h1>
            <ImageGallery
              items={tour.images}
              showNav={false}
              showBullets={false}
              showPlayButton={false}
            />

            <Tab.Container id="left-tabs-example" defaultActiveKey="1">
              <Row className="py-5">
                <Col md={8} className="mb-3 mb-md-0">
                  <Col md={12}>
                    <Nav variant="pills" className="flex-row nav_bars rounded-2">
                      <Nav.Item>
                        <Nav.Link eventKey="1">Tổng quan</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="2">Lịch trình</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="3">Bao gồm & loại trừ</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="4">Vị trí</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>

                  <Tab.Content className="mt-4">
                    <Tab.Pane eventKey="1">
                      <div className="tour_details-section overview-section">
                        <h1 className="section-title">Tổng quan</h1>
                        <p className="section-content">{tour.information}</p>

                        {category && (
                          <div className="category-section">
                            <h5 className="section-subtitle">Danh mục</h5>
                            <ListGroup className="category-list">
                              <ListGroup.Item className="category-item border-0 pt-0 body-text">
                                {category.title}
                              </ListGroup.Item>
                            </ListGroup>
                          </div>
                        )}

                        <div className="tour-info-section">
                          <h5 className="section-subtitle">Thông tin tour</h5>
                          <ListGroup className="tour-info-list">
                            <ListGroup.Item className="tour-info-item border-0 pt-0 body-text">
                              <strong>Mã tour:</strong> {tour.code}
                            </ListGroup.Item>
                            <ListGroup.Item className="tour-info-item border-0 pt-0 body-text">
                              <strong>Thời gian khởi hành:</strong>{" "}
                              <Form.Select
                                value={selectedTimeDepart || ""}
                                onChange={(e) => setSelectedTimeDepart(e.target.value)}
                                className="d-inline-block w-auto tour-info-select"
                              >
                                {tour.timeStarts && tour.timeStarts.length > 0 ? (
                                  tour.timeStarts.map((time, index) => (
                                    <option key={index} value={time.timeDepart}>
                                      {new Date(time.timeDepart).toLocaleDateString("vi-VN")} (Còn {time.stock} chỗ)
                                    </option>
                                  ))
                                ) : (
                                  <option value="">Chưa có ngày</option>
                                )}
                              </Form.Select>
                            </ListGroup.Item>
                            <ListGroup.Item className="tour-info-item border-0 pt-0 body-text">
                              <strong>Số lượng:</strong>{" "}
                              <Form.Control
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                className="d-inline-block w-auto"
                              />
                            </ListGroup.Item>
                          </ListGroup>
                        </div>
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="2">
                      <div className="tour_details-section schedule-section">
                        <h1 className="section-title">Lịch trình</h1>
                        <Accordion defaultActiveKey="0" className="mt-4">
                          {tour.schedule.split("\n").map((item, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index} className="mb-4">
                              <Accordion.Header>
                                <h1>Ngày {index + 1}</h1>
                              </Accordion.Header>
                              <Accordion.Body className="body-text">{item}</Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="3">
                      <div className="tour_details-section inclusion-section">
                        <h1 className="section-title">
                          Bao gồm và loại trừ
                        </h1>
                        <h5 className="section-subtitle mt-3">Bao gồm</h5>
                        <ListGroup className="inclusion-list">
                          <ListGroup.Item className="inclusion-item border-0 pt-0 body-text d-flex align-items-center">
                            <i className="bi bi-check-lg me-2 text-success h4 m-0"></i> Chưa có thông tin
                          </ListGroup.Item>
                        </ListGroup>
                        <h5 className="section-subtitle mt-3">Loại trừ</h5>
                        <ListGroup className="inclusion-list">
                          <ListGroup.Item className="inclusion-item border-0 pt-0 body-text d-flex align-items-center">
                            <i className="bi bi-x-lg me-2 text-danger h5 m-0"></i> Chưa có thông tin
                          </ListGroup.Item>
                        </ListGroup>
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="4">
                      <div className="tour_details-section location-section">
                        <h1 className="section-title">Vị trí</h1>
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1010296.398675619!2d114.41207770371561!3d-8.453560368052777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd141d3e8100fa1%3A0x24910fb14b24e690!2sBali%2C%20Indonesia!5e0!3m2!1sen!2sin!4v1724581274620!5m2!1sen!2sin"
                          width="100%"
                          height="400px"
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </Col>

                <Col md={4}>
                  <aside>
                    <Card className="rounded-3 p-2 shadow-sm mb-4 price-info">
                      <Card.Body>
                        <Stack gap={2} direction="horizontal">
                          <h1 className="font-bold mb-0 h2">{Number(priceAfterDiscount).toLocaleString()} VNĐ</h1>
                          <span className="fs-4"> /người</span>
                        </Stack>
                        {tour.discount > 0 && (
                          <p className="text-muted">
                            <del>{tour.price.toLocaleString()} VNĐ</del> (Giảm {tour.discount}%)
                          </p>
                        )}

                        <button
                          className="btn btn-primary w-100 mt-3"
                          onClick={handleAddToCart}
                        >
                          Đặt Tour
                        </button>
                      </Card.Body>
                    </Card>
                  </aside>
                </Col>
              </Row>
            </Tab.Container>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default TourDetails;