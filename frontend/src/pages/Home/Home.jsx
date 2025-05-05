import React, { useState, useEffect } from "react";
import Banner from "../../components/Banner/Banner";
import AdvanceSearch from "../../components/AdvanceSearch/AdvanceSearch";
import Features from "../../components/Features/Features";
import { Container, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Gallery from "../../components/Gallery/Gallery";
import Cards from "../../components/Cards/Cards";
import PopularCard from "../../components/Cards/PopularCard";
import HotelCard from "../../pages/HotelService/HotelCard";
import api from "../../utils/api";
import { toast } from "react-toastify";
import "./home.css";

const Home = () => {
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Trang chủ - GoTravel";
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API để lấy danh sách tours với prefix /api/v1/
      const tourResponse = await api.get("/api/v1/tours");
      const fetchedTours = tourResponse.data || [];

      // Chuyển đổi định dạng cho component Cards (Tour Nổi Bật)
      const formattedTours = fetchedTours.map((tour) => ({
        id: tour._id,
        name: tour.title,
        image: tour.images && tour.images.length > 0 ? tour.images[0] : "https://via.placeholder.com/300x200?text=Tour+Image",
        tours: "Tour",
        slug: tour.slug,
      }));
      setTours(formattedTours);

      // Gọi API để lấy danh sách hotels với prefix /api/v1/
      const hotelResponse = await api.get("/api/v1/hotels");
      setHotels(hotelResponse.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setError("Không thể tải dữ liệu tours hoặc hotels. Vui lòng thử lại sau!");
      toast.error("Không thể tải dữ liệu tours hoặc hotels!");
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình slider cho Tour Nổi Bật và Hotel Nổi Bật
  const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
          autoplay: true,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          autoplay: true,
          prevArrow: false,
          nextArrow: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          prevArrow: false,
          nextArrow: false,
        },
      },
    ],
  };

  // Lọc dữ liệu cho các section
  const featuredTours = tours.slice(0, 6); // 6 tour nổi bật
  const popularTours = (tours || []).slice(0, 4); // 4 tour phổ biến
  const featuredHotels = hotels.slice(0, 6); // 6 khách sạn nổi bật
  const popularHotels = hotels.slice(0, 4); // 4 khách sạn phổ biến

  return (
    <>
      <Banner />
      <AdvanceSearch />
      <Features />

      {/* Tour Nổi Bật */}
      <section className="tours_section slick_slider py-5">
        <Container>
          <Row>
            <Col md="12">
              <div className="main_heading">
                <h1>TOUR NỔI BẬT</h1>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              {loading ? (
                <p>Đang tải tour nổi bật...</p>
              ) : error ? (
                <p>{error}</p>
              ) : featuredTours.length === 0 ? (
                <p>Không có tour nổi bật nào.</p>
              ) : (
                <Slider {...sliderSettings}>
                  {featuredTours.map((destination, inx) => (
                    <Cards destination={destination} key={inx} />
                  ))}
                </Slider>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Tour Phổ Biến */}
      <section className="popular py-5">
        <Container>
          <Row>
            <Col md="12">
              <div className="main_heading">
                <h1>TOUR PHỔ BIẾN</h1>
              </div>
            </Col>
          </Row>
          <Row>
            {loading ? (
              <Col>
                <p>Đang tải tour phổ biến...</p>
              </Col>
            ) : error ? (
              <Col>
                <p>{error}</p>
              </Col>
            ) : popularTours.length === 0 ? (
              <Col>
                <p>Không có tour phổ biến nào.</p>
              </Col>
            ) : (
              popularTours.map((val, inx) => (
                <Col md={3} sm={6} xs={12} className="mb-5" key={inx}>
                  <PopularCard val={val} />
                </Col>
              ))
            )}
          </Row>
        </Container>
      </section>

      {/* Hotel Nổi Bật */}
      <section className="hotels_section slick_slider py-5">
        <Container>
          <Row>
            <Col md="12">
              <div className="main_heading">
                <h1>HOTEL NỔI BẬT</h1>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              {loading ? (
                <p>Đang tải khách sạn nổi bật...</p>
              ) : error ? (
                <p>{error}</p>
              ) : featuredHotels.length === 0 ? (
                <p>Không có khách sạn nổi bật nào.</p>
              ) : (
                <Slider {...sliderSettings}>
                  {featuredHotels.map((hotel, inx) => (
                    <div key={inx} className="px-2">
                      <HotelCard val={hotel} />
                    </div>
                  ))}
                </Slider>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Hotel Phổ Biến */}
      <section className="popular_hotels py-5">
        <Container>
          <Row>
            <Col md="12">
              <div className="main_heading">
                <h1>HOTEL PHỔ BIẾN</h1>
              </div>
            </Col>
          </Row>
          <Row>
            {loading ? (
              <Col>
                <p>Đang tải khách sạn phổ biến...</p>
              </Col>
            ) : error ? (
              <Col>
                <p>{error}</p>
              </Col>
            ) : popularHotels.length === 0 ? (
              <Col>
                <p>Không có khách sạn phổ biến nào.</p>
              </Col>
            ) : (
              popularHotels.map((val, inx) => (
                <Col md={3} sm={6} xs={12} className="mb-5" key={inx}>
                  <HotelCard val={val} />
                </Col>
              ))
            )}
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="call_us">
        <Container>
          <Row className="align-items-center">
            <Col md="8">
              <h5 className="title">HÃY GỌI ĐIỆN NGAY</h5>
              <h2 className="heading">Sẵn sàng cho chuyến du lịch của bạn</h2>
              <p className="text">
                Hãy tận hưởng kỳ nghỉ một cách trọn vẹn nhất. Chúng tôi luôn đồng hành bạn tới những
                nơi mà bạn muốn đến. Khám phá cùng các bạn những nơi đẹp nhất Việt Nam,
              </p>
            </Col>
            <Col md="4" className="text-center mt-3 mt-md-0">
              <a href="tel:+84779407905" className="secondary_btn bounce" rel="no">
                Gọi điện ngay!
              </a>
            </Col>
          </Row>
        </Container>
        <div className="overlay"></div>
      </section>

      {/* Gallery */}
      <section className="gallery">
        <Container>
          <Row>
            <Col md="12">
              <div className="main_heading">
                <h1>Thư Viện Ảnh</h1>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Gallery />
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;