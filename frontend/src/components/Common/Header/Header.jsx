// src/components/Common/Header/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Navbar, Offcanvas, Nav, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { toast } from "react-toastify";
import "../Header/header.css";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Lấy số lượng tour trong giỏ hàng
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const cartId = localStorage.getItem("cartId");
        if (!token || !cartId) return;

        const response = await api.get(`/cart/${cartId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cart = response.data.data;
        setCartCount(cart.tours ? cart.tours.length : 0);
      } catch (error) {
        console.error("Không thể lấy số lượng giỏ hàng:", error);
      }
    };

    fetchCartCount();
  }, []);

  // Xử lý sticky header
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header-section");
      header.classList.toggle("is-sticky", window.scrollY >= 120);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await api.post("/users/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cartId");
      setUser(null);
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      toast.error("Đăng xuất thất bại!");
    }
  };

  const toggleMenu = () => setOpen(!open);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <header className="header-section">
      <Container>
        <Navbar expand="lg" className="p-0">
          <Navbar.Brand>
            <NavLink to="/">GoTravel</NavLink>
          </Navbar.Brand>

          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-lg"
            aria-labelledby="offcanvasNavbarLabel-expand-lg"
            placement="start"
            show={open}
            onHide={() => setOpen(false)}
          >
            <Offcanvas.Header>
              <h1 className="logo">GoTravel</h1>
              <span className="navbar-toggler ms-auto" onClick={toggleMenu}>
                <i className="bi bi-x-lg"></i>
              </span>
            </Offcanvas.Header>

            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <NavLink className="nav-link" to="/" onClick={() => setOpen(false)}>
                  Trang chủ
                </NavLink>
                <NavLink className="nav-link" to="/about-us" onClick={() => setOpen(false)}>
                  Về chúng tôi
                </NavLink>
                <NavLink className="nav-link" to="/tours" onClick={() => setOpen(false)}>
                  TOURS
                </NavLink>
                <NavDropdown title="Điểm đến" id="offcanvasNavbarDropdown-expand-lg">
                  <NavLink
                    className="nav-link text-dark"
                    to="/destinations"
                    onClick={() => setOpen(false)}
                  >
                    Tất cả điểm đến
                  </NavLink>
                  <NavLink
                    className="nav-link text-dark"
                    to="/destinations/hue"
                    onClick={() => setOpen(false)}
                  >
                    Huế
                  </NavLink>
                </NavDropdown>
                <NavLink className="nav-link" to="/gallery" onClick={() => setOpen(false)}>
                  Thư Viện
                </NavLink>
                <NavLink className="nav-link" to="/contact-us" onClick={() => setOpen(false)}>
                  Liên Hệ
                </NavLink>
                {user && (
                  <NavLink className="nav-link" to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </NavLink>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>

          <div className="ms-md-4 ms-2 d-flex align-items-center">
            {/* Giỏ hàng */}
            <NavLink className="cart-icon me-3 position-relative" to="/cart">
              <i className="bi bi-cart fs-5"></i>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </NavLink>

            {/* Hiển thị thông tin User */}
            {user ? (
              <div className="user-section" ref={dropdownRef}>
                <div className="user-icon" onClick={toggleDropdown}>
                  <i className="bi bi-person-circle fs-5"></i>
                  <span className="user-name">{user.fullName}</span>
                </div>
                {showDropdown && (
                  <div className="user-dropdown">
                    <p>{user.email}</p>
                    <button onClick={handleLogout}>Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink className="login-icon me-3" to="/login">
                <i className="bi bi-person-circle fs-5"></i>
                <span className="login-text">Đăng nhập</span>
              </NavLink>
            )}

            <NavLink className="primaryBtn d-none d-sm-inline-block" to="/booking">
              Đặt vé ngay
            </NavLink>
            <li className="d-inline-block d-lg-none ms-3 toggle_btn">
              <i className={open ? "bi bi-x-lg" : "bi bi-list"} onClick={toggleMenu}></i>
            </li>
          </div>
        </Navbar>
      </Container>
    </header>
  );
};

export default Header;