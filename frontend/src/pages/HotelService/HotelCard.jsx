// src/components/Cards/HotelCard.jsx
import React from "react";
import { Card, Stack, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../../pages/HotelService/hotel.css"; // Import CSS mới

const HotelCard = ({ val }) => {
  return (
    <Card className="hotel-card">
      <Card.Img
        variant="top"
        src={val.images && val.images[0] ? val.images[0] : "placeholder.jpg"}
        className="img-fluid"
        alt={val.name}
      />
      <Card.Body>
        <Card.Text>
          <i className="bi bi-geo-alt"></i>
          <span className="text">
            {val.location.city}, {val.location.country}
          </span>
        </Card.Text>
        <Card.Title>
          <NavLink
            className="body-text text-dark text-decoration-none"
            to={`/hotel-details/${val._id}`}
          >
            {val.name}
          </NavLink>
        </Card.Title>
      </Card.Body>
      <Card.Footer className="py-4">
        <Stack direction="horizontal" className="justify-content-between mt-3">
          <p>
            Từ <b>{val.price ? val.price.toLocaleString() : "Liên hệ"} VNĐ</b>
          </p>
        </Stack>
        <Button variant="success" className="mt-3">
          <i className="bi bi-cart-plus"></i> Thêm vào giỏ hàng
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default HotelCard;