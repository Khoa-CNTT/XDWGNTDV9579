import React from "react";
import { Card, Stack, Badge } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../Cards/card.css";

const PopularCard = ({ val }) => {
  const { title, images, price, discount, slug, timeStart, stock } = val;

  // Tính giá sau giảm giá theo logic của priceNewTour
  const priceAfterDiscount = (price * (100 - (discount || 0)) / 100).toFixed(0);

  return (
    <Card className="rounded-2 shadow-sm popular">
      <Card.Img
        variant="top"
        src={
          images && images.length > 0
            ? images[0]
            : "https://via.placeholder.com/300x200?text=Tour+Image"
        }
        className="img-fluid"
        alt={title}
      />
      <Card.Body>
        <Card.Text>
          <i className="bi bi-geo-alt"></i>
          <span className="text">Chưa có thông tin vị trí</span>
        </Card.Text>

        <Card.Title>
          <NavLink
            className="body-text text-dark text-decoration-none"
            to={`/tour-details/${slug}`}
          >
            {title || "Không có tiêu đề"}
          </NavLink>
        </Card.Title>
        <p className="reviwe">
          <span>
            <i className="bi bi-star-fill me-1"></i>
          </span>
          <span>Chưa có đánh giá</span>
        </p>
        {discount > 0 && (
          <Badge bg="success" className="me-1">
            Giảm {discount}%
          </Badge>
        )}
      </Card.Body>

      <Card.Footer className="py-4">
        {discount > 0 && (
          <p className="text-decoration-line-through">
            {price.toLocaleString()} VNĐ
          </p>
        )}
        <Stack direction="horizontal" className="justify-content-between mt-3">
          <p>
            Từ{" "}
            <b>{Number(priceAfterDiscount).toLocaleString()} VNĐ</b>
          </p>
          <p>
            <i className="bi bi-clock"></i>{" "}
            {timeStart
              ? new Date(timeStart).toLocaleDateString("vi-VN")
              : "Chưa có ngày"}
          </p>
        </Stack>
      </Card.Footer>
    </Card>
  );
};

export default PopularCard;