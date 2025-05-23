import React, { useState, useEffect } from "react";
import "../Footer/footer.css";
import { Col, Container, Row, ListGroup } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const Footer = () => {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
    setCurrentTime(new Date());
    }, 1000); // cập nhật mỗi giây

     return () => clearInterval(interval); // cleanup
  }, []);
  const getFormattedDateTime = (date) => {
    return date.toLocaleString("vi-VN", {
      weekday: "long",    // Thứ Hai
      day: "2-digit",     // 08
      month: "2-digit",   // 04
      year: "numeric",    // 2025
      hour: "2-digit",    // 14
      minute: "2-digit",  // 45
      second: "2-digit",  // 33
      hour12: false
    });
  };
  
  const formattedDateTime = getFormattedDateTime(currentTime);
  
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Kiểm tra vị trí cuộn trang để hiển thị hoặc ẩn nút back-to-top
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    // Gọi ngay khi component mount để cập nhật trạng thái ban đầu
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="footer">
        <Container>
          <Row className="py-5">
            <Col md="3" sm="6">
              <h4>🌍 Về Chúng Tôi</h4>
              <p>Chúng tôi cung cấp những tour du lịch chất lượng với trải nghiệm đáng nhớ nhất.</p>
            </Col>

            <Col md="3" sm="6">
              <h4>🔗 Liên Kết Nhanh</h4>
              <ListGroup variant="flush">
                <ListGroup.Item><NavLink to="/">Trang Chủ</NavLink></ListGroup.Item>
                <ListGroup.Item><NavLink to="/about-us">Giới Thiệu</NavLink></ListGroup.Item>
                <ListGroup.Item><NavLink to="/contact-us">Liên Hệ</NavLink></ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md="3" sm="6">
              <h4>🌍 Khám Phá</h4>
              <ListGroup variant="flush">
                <ListGroup.Item><NavLink to="/faq">Câu Hỏi Thường Gặp</NavLink></ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md="3" sm="6">
              <h4>📍 Thông Tin Liên Hệ</h4>
              <p><i className="bi bi-geo-alt"></i> Phú Lộc, Thừa Thiên Huế</p>
              <p><i className="bi bi-envelope"></i> <a href="mailto:ngocthangthcs@gmail.com">gotravel@gmail.com</a></p>
              <p><i className="bi bi-telephone"></i> <a href="tel:0779407905">0779 407 905</a></p>
              <div className="social-links mt-3">
                <a href="https://www.facebook.com/profile.php?id=61575213824007" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i></a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><i className="bi bi-tiktok"></i></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="bi bi-youtube"></i></a>
              </div>
            </Col>
          </Row>

          <Row className="text-center copyright">
          <p>🕒 Hiện tại: <strong>{formattedDateTime}</strong></p>
            <Col><p>© 2025 Nhóm 66. All Rights Reserved.</p></Col>
          </Row>
        </Container>
      </footer>

      {/* Nút quay lại đầu trang */}
      {visible && (
        <div className="back-to-top" onClick={scrollTop}>
          <i className="bi bi-arrow-up"></i>
        </div>
      )}
    </>
  );
};

export default Footer;
