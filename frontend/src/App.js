import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";
import Home from "./pages/Home/Home";
import Header from "./components/Common/Header/Header";
import Footer from "./components/Common/Footer/Footer";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Tours from "./pages/Tours/Tours";
import TourDetails from "./pages/Tours/TourDetails";
import Booking from "./pages/Booking/Booking";
import Destinations from "./pages/Destinations/Destinations";
import PhotoGallery from "./pages/PhotoGallery/PhotoGallery";
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";
import ForgotPassword from "./pages/auth/ForgotPassword/ForgotPassword";
import CartPage from "./pages/Cart/CartPage";
import Chatbox from "./components/Chatbox/ChatBox";
import PrivateRoute from "./components/Common/PrivateRoute";

// Admin Components
import Topbar from "./Admin/global/Topbar";
import Sidebar from "./Admin/global/Sidebar";
import Dashboard from "./Admin/dashboard";
import Team from "./Admin/team";
import Invoices from "./Admin/invoices";
import Contacts from "./Admin/contacts";
import Bar from "./Admin/bar";
import Form from "./Admin/form";
import Line from "./Admin/line";
import Pie from "./Admin/pie";
import FAQ from "./Admin/faq";
import Geography from "./Admin/geography";
import Profile from "./pages/Profile/Profile";
import Invoicess from "./pages/Invoices/Invoicess";
import ResetPasswordForm from "./pages/auth/ForgotPassword/ResetPasswordForm";

function App() {
  const { loading, user } = useAuth(); // Lấy user từ AuthContext
  const location = useLocation();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  // Kiểm tra đường dẫn có phải là admin không
  const isAdminPath = location.pathname.startsWith("/admin");

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  // Nếu đã đăng nhập và vai trò không khớp với giao diện, chuyển hướng
  if (user) {
    if (user.role === "admin" && !isAdminPath) {
      return <Navigate to="/admin" replace />;
    }
    if (user.role !== "admin" && isAdminPath) {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <>
      {isAdminPath ? (
        // Giao diện Admin
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app">
              <Sidebar isSidebar={isSidebar} />
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} />
                <Routes>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/team" element={<Team />} />
                  <Route path="/admin/contacts" element={<Contacts />} />
                  <Route path="/admin/invoices" element={<Invoices />} />
                  <Route path="/admin/form" element={<Form />} />
                  <Route path="/admin/bar" element={<Bar />} />
                  <Route path="/admin/pie" element={<Pie />} />
                  <Route path="/admin/line" element={<Line />} />
                  <Route path="/admin/faq" element={<FAQ />} />
                  <Route path="/admin/geography" element={<Geography />} />
                </Routes>
              </main>
            </div>
          </ThemeProvider>
        </ColorModeContext.Provider>
      ) : (
        // Giao diện Client
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="about-us" element={<About />} />
            <Route path="contact-us" element={<Contact />} />
            <Route path="tours" element={<Tours />} />
            <Route path="tour-details" element={<TourDetails />} />
            <Route
              path="booking"
              element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              }
            />
            <Route path="destinations" element={<Destinations />} />
            <Route path="gallery" element={<PhotoGallery />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPasswordForm/>}/>
            <Route
              path="cart"
              element={
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              }
            />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="invoices" element={<PrivateRoute><Invoicess/></PrivateRoute>} />
            
          </Routes>
          <Chatbox />
          <Footer />
        </AuthProvider>
      )}
    </>
  );
}

export default App;