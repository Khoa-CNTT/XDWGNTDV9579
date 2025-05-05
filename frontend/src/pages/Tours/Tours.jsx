import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { Container, Row, Col, Offcanvas } from "react-bootstrap";
import PopularCard from "../../components/Cards/PopularCard";
import Filters from "./Filters";
import api from "../../utils/api";
import { toast } from "react-toastify";
import "../Tours/tour.css";

const Tours = () => {
  const { slugCategory } = useParams();
  const [show, setShow] = useState(false);
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState("Tours");
  const [loading, setLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    document.title = `${categoryTitle} - GoTravel`;
    window.scrollTo(0, 0);
    fetchTours();
  }, [slugCategory]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      let url = "/tours"; // Loại bỏ /api/v1 vì đã có trong baseURL
      if (slugCategory) {
        url = `/tours/${slugCategory}`; // Loại bỏ /api/v1
        const categoryResponse = await api.get("/categories"); // Loại bỏ /api/v1
        const category = categoryResponse.data.find((cat) => cat.slug === slugCategory);
        if (category) {
          setCategoryTitle(category.title);
        } else {
          setCategoryTitle("Danh mục không xác định");
        }
      }
      const response = await api.get(url);
      console.log("Dữ liệu tours từ API:", response.data);
      setTours(response.data || []);
      setFilteredTours(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tour:", error);
      const errorMessage = error.response?.data?.message || "Không thể tải danh sách tour!";
      toast.error(errorMessage);
      setTours([]);
      setFilteredTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...tours];

    // Lọc theo tiêu đề
    if (filters.title) {
      filtered = filtered.filter((tour) =>
        tour.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    // Lọc theo danh mục (dựa trên category_id)
    if (filters.category.length > 0) {
      filtered = filtered.filter((tour) =>
        filters.category.includes(tour.category_id)
      );
    }

    // Lọc theo giá (dựa trên giá sau giảm giá)
    if (filters.price.length > 0) {
      filtered = filtered.filter((tour) => {
        const tourPrice = (tour.price * (100 - (tour.discount || 0)) / 100).toFixed(0);
        return filters.price.some((priceRange) => {
          const [min, max] = priceRange
            .match(/\d+/g)
            .map((num) => parseInt(num) * 1000);
          return tourPrice >= min && (max ? tourPrice <= max : true);
        });
      });
    }

    console.log("Filtered Tours:", filtered);
    setFilteredTours(filtered);
  };

  console.log("Rendering Tours - filteredTours:", filteredTours);

  return (
    <>
      <Breadcrumbs title={categoryTitle} pagename="Tours" />
      <section className="py-5 tour_list">
        <Container>
          <Row>
            <Col xl="3" lg="4" md="12" sm="12">
              <div className="d-lg-none d-block">
                <button className="primaryBtn mb-4" onClick={handleShow}>
                  <i className="bi bi-funnel"></i> Bộ lọc
                </button>
              </div>
              <div className="filters d-lg-block d-none">
                <Filters onFilterChange={handleFilterChange} />
              </div>
            </Col>
            <Col xl="9" lg="8" md="12" sm="12">
              {loading ? (
                <p>Đang tải danh sách tour...</p>
              ) : filteredTours.length === 0 ? (
                <p>Không tìm thấy tour nào.</p>
              ) : (
                <Row>
                  {filteredTours.map((val, inx) => (
                    <Col xl={4} lg={6} md={6} sm={6} className="mb-5" key={inx}>
                      <PopularCard val={val} />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Bộ lọc</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Filters onFilterChange={handleFilterChange} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Tours;