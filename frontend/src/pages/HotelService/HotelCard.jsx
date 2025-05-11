import React from "react";
import { Card, Stack, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "../../pages/HotelService/hotel.css";

const HotelCard = ({ val }) => {
  const navigate = useNavigate();

  const handleViewHotel = () => {
    // Điều hướng đến trang chi tiết khách sạn
    navigate(`/hotel-details/${val._id}`);
  };

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
        
        <Button variant="success" className="mt-3" onClick={handleViewHotel}>
          <i className="bi bi-eye"></i> Xem khách sạn
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default HotelCard;