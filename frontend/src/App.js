import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminContext"; // Thêm AdminAuthProvider

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
import TourControl from "./Admin/TourControl";
import LoginAdmin from "./Admin/Loginadmin";
import Category from "./Admin/category";
import Voucher from "./Admin/voucher";
import Rightsgroup from "./Admin/rightsgroup";
import Delegation from "./Admin/delegation";

// Client Components
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
import ResetPasswordForm from "./pages/auth/ForgotPassword/ResetPasswordForm";
import CartPage from "./pages/Cart/CartPage";
import Chatbox from "./components/Chatbox/ChatBox";
import PrivateRoute from "./components/Common/PrivateRoute";
import HotelServices from "./pages/HotelService/HotelServices";
import HotelDetails from "./pages/HotelService/HotelDetails";
import Profile from "./pages/Profile/Profile";
import Invoicess from "./pages/Invoices/Invoicess";

// Component con chứa logic chính
const AppContent = () => {
  const { user, loading: userLoading } = useAuth(); // AuthContext cho user
  const { admin, loading: adminLoading } = useAdminAuth(); // AdminAuthContext cho admin
  const location = useLocation();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  const isAdminPath = location.pathname.startsWith("/admin");
  const isLoginAdmin = location.pathname === "/loginadmin";

  if (userLoading || adminLoading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  // Chuyển hướng từ /admin/* về /loginadmin nếu chưa đăng nhập admin
  if (isAdminPath && !admin && !isLoginAdmin) {
    return <Navigate to="/loginadmin" replace />;
  }

  // Chuyển hướng từ /loginadmin về /admin/dashboard nếu đã đăng nhập admin
  if (isLoginAdmin && admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Chuyển hướng từ /admin/* về / nếu người dùng không phải admin
  if (isAdminPath && user && user.role !== "admin" && !admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isLoginAdmin ? (
          // Giao diện đăng nhập Admin
          <Routes>
            <Route path="/loginadmin" element={<LoginAdmin />} />
          </Routes>
        ) : isAdminPath ? (
          // Giao diện Admin
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/team" element={<Team />} />
                <Route path="/admin/contacts" element={<Contacts />} />
                <Route path="/admin/invoices" element={<Invoices />} />
                <Route path="/admin/form" element={<Form />} />
                <Route path="/admin/bar" element={<Bar />} />
                <Route path="/admin/pie" element={<Pie />} />
                <Route path="/admin/line" element={<Line />} />
                <Route path="/admin/faq" element={<FAQ />} />
                <Route path="/admin/tourcontrol" element={<TourControl />} />
                <Route path="/admin/category" element={<Category />} />
                <Route path="/admin/voucher" element={<Voucher />} />
                <Route path="/admin/rightsgroup" element={<Rightsgroup />} />
                <Route path="/admin/delegation" element={<Delegation />} />
                <Route path="/admin/geography" element={<Geography />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        ) : (
          // Giao diện Client
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/contact-us" element={<Contact />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tour-details" element={<TourDetails />} />
              <Route
                path="/booking"
                element={
                  <PrivateRoute>
                    <Booking />
                  </PrivateRoute>
                }
              />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/gallery" element={<PhotoGallery />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <CartPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <PrivateRoute>
                    <Invoicess />
                  </PrivateRoute>
                }
              />
              <Route path="/hotel-services" element={<HotelServices />} />
              <Route path="/hotel-details/:hotelId" element={<HotelDetails />} />
            </Routes>
            <Chatbox />
            <Footer />
          </>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Component chính bao bọc toàn bộ ứng dụng trong AuthProvider và AdminAuthProvider
function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;