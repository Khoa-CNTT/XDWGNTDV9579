import React, { useState, useEffect } from "react";
import { Accordion, Form } from "react-bootstrap";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { location, Duration, PriceRange, Ratings } from "../../utils/data";
import "../Tours/tour.css";

const Filters = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    location: [],
    category: [],
    duration: [],
    price: [],
    rating: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        toast.error("Không thể tải danh mục!");
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (type, value, checked) => {
    const updatedFilters = { ...filters };
    if (checked) {
      updatedFilters[type] = [...updatedFilters[type], value];
    } else {
      updatedFilters[type] = updatedFilters[type].filter((item) => item !== value);
    }
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="side_bar">
      <div className="filter_box shadow-sm rounded-2">
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Địa điểm</Accordion.Header>
            <Accordion.Body>
              {location.map((loc, inx) => (
                <Form.Check
                  key={inx}
                  type="checkbox"
                  id={`location-${inx}`}
                  label={loc}
                  value={loc}
                  onChange={(e) => handleFilterChange("location", loc, e.target.checked)}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="1">
            <Accordion.Header>Danh mục Tour</Accordion.Header>
            <Accordion.Body>
              {categories.length === 0 ? (
                <p>Đang tải danh mục...</p>
              ) : (
                categories.map((category, inx) => (
                  <Form.Check
                    key={inx}
                    type="checkbox"
                    id={`category-${inx}`}
                    label={category.title}
                    value={category._id}
                    onChange={(e) => handleFilterChange("category", category._id, e.target.checked)}
                  />
                ))
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="2">
            <Accordion.Header>Thời gian</Accordion.Header>
            <Accordion.Body>
              {Duration.map((days, inx) => (
                <Form.Check
                  key={inx}
                  type="checkbox"
                  id={`duration-${inx}`}
                  label={days}
                  value={days}
                  onChange={(e) => handleFilterChange("duration", days, e.target.checked)}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="3">
            <Accordion.Header>Giá</Accordion.Header>
            <Accordion.Body>
              {PriceRange.map((price, inx) => (
                <Form.Check
                  key={inx}
                  type="checkbox"
                  id={`price-${inx}`}
                  label={price}
                  value={price}
                  onChange={(e) => handleFilterChange("price", price, e.target.checked)}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="4">
            <Accordion.Header>Đánh giá</Accordion.Header>
            <Accordion.Body>
              {Ratings.map((rating, inx) => (
                <Form.Check
                  key={inx}
                  type="checkbox"
                  id={`rating-${inx}`}
                  label={rating}
                  value={rating}
                  onChange={(e) => handleFilterChange("rating", rating, e.target.checked)}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};

export default Filters;