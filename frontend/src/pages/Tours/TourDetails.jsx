import React,{useEffect} from "react";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import "../Tours/tour.css";
import { tourDetails } from "../../utils/data";
import { NavLink } from "react-router-dom";
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
} from "react-bootstrap";

const TourDetails = () => {

  useEffect(() => {
    document.title = " Tours  Details  ";
    window.scroll(0, 0);
  }, []);
  return (
    <>
      <Breadcrumbs
        title={tourDetails.title}
        pagename=<NavLink to="/tours">Tours</NavLink>
        childpagename={tourDetails.title}
      />

      <section className="tour_details py-5">
        <Container>
          <Row>
            <h1 className="fs-2 font-bold mb-4">{tourDetails.title} </h1>
            <ImageGallery
              items={tourDetails.images}
              showNav={false}
              showBullets={false}
              showPlayButton={false}
            />

            <Tab.Container id="left-tabs-example" defaultActiveKey="1">
              <Row className="py-5">
                <Col md={8} className="mb-3 mb-md-0">
                  <Col md={12}>
                    <Nav
                      variant="pills"
                      className="flex-row nav_bars rounded-2"
                    >
                      <Nav.Item>
                        <Nav.Link eventKey="1"> Tổng quan </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="2">Lịch trình</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="3">
                          {" "}
                          Bao gồm & loại trừ{" "}
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="4">Vị trí</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>

                  <Tab.Content className="mt-4">
                    <Tab.Pane eventKey="1">
                      <div className="tour_details">
                        <h1 className="font-bold mb-2 h3 border-bottom pb-2">
                          Tổng quan
                        </h1>
                        <p className="body-text">{tourDetails.des}</p>

                        <h5 className="font-bold mb-2 h5  mt-3">Thông tin tour</h5>

                        <ListGroup>
                          {tourDetails.tourInfo.map((val, index) => {
                            return (
                              <ListGroup.Item
                                className="border-0 pt-0 body-text"
                                key={index}
                                dangerouslySetInnerHTML={{ __html: val }}
                              ></ListGroup.Item>
                            );
                          })}
                        </ListGroup>

                        <h5 className="font-bold mb-2 h5  mt-3">
                          Điểm nổi bật của tour
                        </h5>

                        {tourDetails.highlights.map((val, index) => {
                          return (
                            <ListGroup.Item
                              className="border-0 pt-0 body-text"
                              key={index}
                            >
                              {val}
                            </ListGroup.Item>
                          );
                        })}
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="2">
                      <div className="tour_details">
                        <h1 className="font-bold mb-2 h3 border-bottom pb-2">
                          Lịch trình
                        </h1>

                        <Accordion defaultActiveKey="0" className="mt-4">
                          {tourDetails.itinerary.map((val, index) => {
                            return (
                              <Accordion.Item
                                eventKey={index}
                                key={index}
                                className="mb-4"
                              >
                                <Accordion.Header>
                                  <h1
                                    dangerouslySetInnerHTML={{
                                      __html: val.title,
                                    }}
                                  ></h1>
                                </Accordion.Header>
                                <Accordion.Body className="body-text">
                                  {val.des}
                                </Accordion.Body>
                              </Accordion.Item>
                            );
                          })}
                        </Accordion>
                      </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="3">
                      <div className="tour_details">
                        <h1 className="font-bold fw-bold mb-2 h3 border-bottom pb-2">
                          Bao gồm và loại trừ
                        </h1>

                        <h5 className="font-bold mb-3 h5  mt-3">Bao gồm</h5>

                        {tourDetails.included.map((val, index) => {
                          return (
                            <ListGroup.Item
                              className="border-0 pt-0 body-text d-flex align-items-center"
                              key={index}
                            >
                              <i className="bi bi-check-lg me-2 text-success h4 m-0"></i>{" "}
                              {val}
                            </ListGroup.Item>
                          );
                        })}

                        <h5 className="font-bold mb-3 h5  mt-3">Loại trừ</h5>

                        {tourDetails.exclusion.map((val, index) => {
                          return (
                            <ListGroup.Item
                              className="border-0 pt-0 body-text d-flex align-items-center"
                              key={index}
                            >
                              <i className="bi bi-x-lg me-2 text-danger h5 m-0"></i>{" "}
                              {val}
                            </ListGroup.Item>
                          );
                        })}
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="4">
                      <div className="tour_details">
                        <h1 className="font-bold mb-4 h3 border-bottom pb-2">
                          Vị trí
                        </h1>

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
                    <Card className="rounded-3 p-2 shadow-sm mb-4 price-info">
                      <Card.Body>
                        <Stack gap={2} direction="horizontal">
                          <h1 className="font-bold mb-0 h2">
                            ${tourDetails.price}
                          </h1>
                          <span className="fs-4"> /người</span>
                        </Stack>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <ListGroup horizontal>
                            <ListGroup.Item className="border-0 me-2 fw-bold">
                              {tourDetails.rating}
                            </ListGroup.Item>
                            <ListGroup.Item className="border-0 me-1 text-warning">
                              <i className="bi bi-star-fill"></i>
                            </ListGroup.Item>
                            <ListGroup.Item className="border-0 me-1 text-warning">
                              <i className="bi bi-star-fill"></i>
                            </ListGroup.Item>
                            <ListGroup.Item className="border-0 me-1 text-warning">
                              <i className="bi bi-star-fill"></i>
                            </ListGroup.Item>
                            <ListGroup.Item className="border-0 me-1 text-warning">
                              <i className="bi bi-star-fill"></i>
                            </ListGroup.Item>
                            <ListGroup.Item className="border-0 me-1 text-warning">
                              <i className="bi bi-star-half"></i>
                            </ListGroup.Item>
                          </ListGroup>
                          <h5 className="h6"> ({tourDetails.reviews})</h5>
                        </div>

                        <NavLink to="/booking" className="primaryBtn w-100 d-flex justify-content-center fw-bold">
                          Đặt ngay
                        </NavLink>
                      </Card.Body>
                    </Card>

                    <Card className="card-info p-2 shadow-sm">
                      <Card.Body>
                        <h1 className="font-bold mb-2 h3">Cần giúp đỡ ?</h1>

                        <ListGroup>
                         
                          <ListGroup.Item className="border-0">
                          <i className="bi bi-telephone me-1"></i>  Gọi cho chúng tôi <strong>+84 779407905</strong>
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0">
                          <i className="bi bi-alarm me-1"></i> Thời gian: <strong>8AM to 7PM</strong>
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0">
                          <strong> <i className="bi bi-headset me-1"></i> Hãy để chúng tôi gọi bạn</strong> 
                          </ListGroup.Item>
                          <ListGroup.Item className="border-0"><i className="bi bi-calendar-check me-1"></i> <strong> Đặt lịch hẹn</strong> </ListGroup.Item>
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