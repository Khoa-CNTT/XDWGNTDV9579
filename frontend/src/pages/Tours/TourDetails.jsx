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
  const { slugTour } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeDepart, setSelectedTimeDepart] = useState(null);

  useEffect(() => {
    document.title = "Tours Details - GoTravel";
    window.scrollTo(0, 0);
    fetchTourDetails();
  }, [slugTour]);

  const fetchTourDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tours/detail/${slugTour}`);
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

    try {
      await addToCart("tour", {
        tourId: tour._id,
        quantity: 1,
        timeDepart: selectedTimeDepart, // Gửi thêm timeDepart cho API
      });
      navigate("/cart"); // Điều hướng đến trang giỏ hàng
    } catch (error) {
      console.error("Lỗi khi thêm tour vào giỏ hàng:", error);
      toast.error(error.message || "Không thể thêm tour vào giỏ hàng! Vui lòng thử lại.");
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
                      <div className="tour_details">
                        <h1 className="font-bold mb-2 h3 border-bottom pb-2">Tổng quan</h1>
                        <p className="body-text">{tour.information}</p>

                        {category && (
                          <>
                            <h5 className="font-bold mb-2 h5 mt-3">Danh mục</h5>
                            <ListGroup>
                              <ListGroup.Item className="border-0 pt-0 body-text">
                                <NavLink to={`/tours/${category.slug}`}>
                                  {category.title}
                                </NavLink>
                              </ListGroup.Item>
                            </ListGroup>
                          </>
                        )}

                        <h5 className="font-bold mb-2 h5 mt-3">Thông tin tour</h5>
                        <ListGroup>
                          <ListGroup.Item className="border-0 pt-0 body-text">
                            <strong>Mã tour:</strong> {tour.code}
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0 pt-0 body-text">
                            <strong>Thời gian khởi hành:</strong>{" "}
                            <Form.Select
                              value={selectedTimeDepart || ""}
                              onChange={(e) => setSelectedTimeDepart(e.target.value)}
                              className="d-inline-block w-auto"
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
                        </ListGroup>
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="2">
                      <div className="tour_details">
                        <h1 className="font-bold mb-2 h3 border-bottom pb-2">Lịch trình</h1>
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
                      <div className="tour_details">
                        <h1 className="font-bold fw-bold mb-2 h3 border-bottom pb-2">
                          Bao gồm và loại trừ
                        </h1>
                        <h5 className="font-bold mb-3 h5 mt-3">Bao gồm</h5>
                        <ListGroup.Item className="border-0 pt-0 body-text d-flex align-items-center">
                          <i className="bi bi-check-lg me-2 text-success h4 m-0"></i> Chưa có thông tin
                        </ListGroup.Item>
                        <h5 className="font-bold mb-3 h5 mt-3">Loại trừ</h5>
                        <ListGroup.Item className="border-0 pt-0 body-text d-flex align-items-center">
                          <i className="bi bi-x-lg me-2 text-danger h5 m-0"></i> Chưa có thông tin
                        </ListGroup.Item>
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="4">
                      <div className="tour_details">
                        <h1 className="font-bold mb-4 h3 border-bottom pb-2">Vị trí</h1>
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
                          className="primaryBtn w-100 d-flex justify-content-center fw-bold"
                          onClick={handleAddToCart}
                        >
                          Đặt Tour
                        </button>
                      </Card.Body>
                    </Card>

                    <Card className="card-info p-2 shadow-sm">
                      <Card.Body>
                        <h1 className="font-bold mb-2 h3">Cần giúp đỡ?</h1>
                        <ListGroup>
                          <ListGroup.Item className="border-0">
                            <i className="bi bi-telephone me-1"></i> Gọi cho chúng tôi{" "}
                            <strong>+84 779407905</strong>
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0">
                            <i className="bi bi-alarm me-1"></i> Thời gian: <strong>8AM to 7PM</strong>
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0">
                            <strong>
                              <i className="bi bi-headset me-1"></i> Hãy để chúng tôi gọi bạn
                            </strong>
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0">
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
        </Container>
      </section>
    </>
  );
};

export default TourDetails;