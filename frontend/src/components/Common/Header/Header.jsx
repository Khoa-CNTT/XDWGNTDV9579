// src/components/Common/Header/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Navbar, Offcanvas, Nav, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/api";
import "../Header/header.css";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const cartId = localStorage.getItem("cartId");
        if (!cartId || !user) {
          setCartCount(0);
          return;
        }
        const response = await api.get(`/cart/${cartId}`);
        const cart = response.data.data;
        setCartCount(cart.tours ? cart.tours.length : 0);
      } catch (error) {
        console.error("Không thể lấy số lượng giỏ hàng:", error);
        setCartCount(0);
      }
    };
    fetchCartCount();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header-section");
      header.classList.toggle("is-sticky", window.scrollY >= 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
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
                <NavLink
                  className="nav-link"
                  to="/"
                  onClick={() => {
                    console.log("Navigating to /");
                    setOpen(false);
                  }}
                >
                  Trang chủ
                </NavLink>
                <NavLink
                  className="nav-link"
                  to="/about-us"
                  onClick={() => {
                    console.log("Navigating to /about-us");
                    setOpen(false);
                  }}
                >
                  Về chúng tôi
                </NavLink>
                <NavLink
                  className="nav-link"
                  to="/tours"
                  onClick={() => {
                    console.log("Navigating to /tours");
                    setOpen(false);
                  }}
                >
                  Tours
                </NavLink>
                {/* Thêm mục Dịch vụ với Dropdown */}
                <NavDropdown title="Dịch vụ" id="services-dropdown">
                  <NavLink
                    className="nav-link text-dark"
                    to="/hotel-services"
                    onClick={() => {
                      console.log("Navigating to /hotel-services");
                      setOpen(false);
                    }}
                  >
                    Dịch vụ khách sạn
                  </NavLink>
                  {/* Có thể thêm các dịch vụ khác sau này */}
                  {/* <NavLink
                    className="nav-link text-dark"
                    to="/other-services"
                    onClick={() => {
                      console.log("Navigating to /other-services");
                      setOpen(false);
                    }}
                  >
                    Dịch vụ khác
                  </NavLink> */}
                </NavDropdown>
                <NavDropdown title="Danh mục" id="offcanvasNavbarDropdown-expand-lg">
                  <NavLink
                    className="nav-link text-dark"
                    to="/destinations"
                    onClick={() => {
                      console.log("Navigating to /destinations");
                      setOpen(false);
                    }}
                  >
                    Tất cả địa điểm
                  </NavLink>
                  <NavLink
                    className="nav-link text-dark"
                    to="/destinations/hue"
                    onClick={() => {
                      console.log("Navigating to /destinations/hue");
                      setOpen(false);
                    }}
                  >
                    Huế
                  </NavLink>
                  <NavLink
                    className="nav-link text-dark"
                    to="/destinations/hue"
                    onClick={() => {
                      console.log("Navigating to /destinations/hue");
                      setOpen(false);
                    }}
                  >
                    Đà Nẵng
                  </NavLink>
                </NavDropdown>
                <NavLink
                  className="nav-link"
                  to="/gallery"
                  onClick={() => {
                    console.log("Navigating to /gallery");
                    setOpen(false);
                  }}
                >
                  Thư viện
                </NavLink>
                <NavLink
                  className="nav-link"
                  to="/contact-us"
                  onClick={() => {
                    console.log("Navigating to /contact-us");
                    setOpen(false);
                  }}
                >
                  Liên hệ
                </NavLink>
                {user?.role === "admin" && (
                  <NavLink
                    className="nav-link"
                    to="/dashboard"
                    onClick={() => {
                      console.log("Navigating to /dashboard");
                      setOpen(false);
                    }}
                  >
                    Dashboard
                  </NavLink>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>

          <div className="ms-md-4 ms-2 d-flex align-items-center">
            <NavLink
              className="cart-icon me-3 position-relative"
              to="/cart"
              onClick={() => console.log("Navigating to /cart")}
            >
              <i className="bi bi-cart fs-5"></i>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </NavLink>

            {user ? (
              <div className={`user-section ${showDropdown ? "show-dropdown" : ""}`} ref={dropdownRef}>
                <div className="user-info" onClick={toggleDropdown}>
                  <img
                    src={
                      user.avatar ||
                      "https://chiemtaimobile.vn/images/companies/1/%E1%BA%A2nh%20Blog/avatar-facebook-dep/Hinh-dai-dien-hai-huoc-cam-dep-duoi-ai-do.jpg?1704789789335"
                    }
                    alt="Avatar"
                    className="user-avatar rounded-circle"
                  />
                  <span className="user-name ms-2">{user.fullName}</span>
                  <i className={`bi bi-chevron-${showDropdown ? "up" : "down"} ms-1`}></i>
                </div>
                {showDropdown && (
                  <div className="user-dropdown">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/profile");
                        console.log("Navigating to /profile");
                        setShowDropdown(false);
                      }}
                    >
                      Thông tin cá nhân
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/invoices");
                        console.log("Navigating to /invoices");
                        setShowDropdown(false);
                      }}
                    >
                      Hóa đơn
                    </div>
                    <div className="dropdown-item" onClick={handleLogout}>
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                className="login-icon me-3"
                to="/login"
                onClick={() => console.log("Navigating to /login")}
              >
                <i className="bi bi-person-circle fs-5"></i>
                <span className="login-text">Đăng nhập</span>
              </NavLink>
            )}

            <NavLink
              className="primaryBtn d-none d-sm-inline-block"
              to="/booking"
              onClick={() => console.log("Navigating to /booking")}
            >
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