import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminContext";
import { CartProvider } from "./context/CartContext";

// Admin Components
import Topbar from "./Admin/global/Topbar";
import Sidebar from "./Admin/global/Sidebar";
import Dashboard from "./Admin/dashboard";
import Team from "./Admin/team";
import InvoicesAdmin from "./Admin/invoices";
import Contacts from "./Admin/contacts";
import Bar from "./Admin/bar/index";
import Form from "./Admin/form";
import Line from "./Admin/line";
import Pie from "./Admin/pie";
import TourControl from "./Admin/TourControl";
import LoginAdmin from "./Admin/Loginadmin";
import Category from "./Admin/category";
import Voucher from "./Admin/voucher";
import Rightsgroup from "./Admin/rightsgroup";
import Delegation from "./Admin/delegation";
import Setting from "./Admin/Setting";
import Hotel from "./Admin/Hotel/hotel";
import QLHotel from "./Admin/Hotel/RoomManagement";
import Review from "./Admin/Review/review";

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
import PaymentReturn from "./pages/Cart/PaymentReturn";
import Chatbox from "./components/Chatbox/ChatBox";
import PrivateRoute from "./components/Common/PrivateRoute";
import HotelServices from "./pages/HotelService/HotelServices";
import HotelDetails from "./pages/HotelService/HotelDetails";
import Profile from "./pages/Profile/Profile";
import Invoicess from "./pages/Invoices/Invoicess";
import Categories from "./pages/Categories/Categories";
import { getGeneralSettings } from "./Admin/Setting/SettingApi";

const AdminContent = ({ children, isSidebar, setIsSidebar }) => {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            {children}
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const ClientContent = ({ children, shouldWrap }) => {
  return shouldWrap ? (
    <AuthProvider>
      <Header />
      {children}
      <Chatbox />
      <Footer />
    </AuthProvider>
  ) : (
    <AuthProvider>{children}</AuthProvider>
  );
};

const AppContent = () => {
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const { admin, loading: adminLoading } = useAdminAuth();
  const [settings, setSettings] = useState({
    websiteName: "GoTravel",
    logo: "%PUBLIC_URL%/favicon.ico",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getGeneralSettings();
        if (data) {
          const newSettings = {
            websiteName: data.websiteName || "GoTravel",
            logo: data.logo || "%PUBLIC_URL%/favicon.ico",
          };
          setSettings(newSettings);
          document.title = newSettings.websiteName;
          const favicon = document.getElementById("favicon");
          if (favicon) {
            favicon.href = newSettings.logo;
          }
        }
      } catch (error) {
        console.error("Error fetching settings in App.jsx:", error);
      }
    };
    fetchSettings();
  }, []);

  const noWrapperRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const shouldWrap = !noWrapperRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const isAdminPath = location.pathname.startsWith("/admin");
  const isLoginAdmin = location.pathname === "/loginadmin";
  const isAuthenticated = !!admin;

  if (adminLoading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (isAdminPath && !isAuthenticated && !isLoginAdmin) {
    return <Navigate to="/loginadmin" replace />;
  }

  if (isLoginAdmin && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const clientRoutes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/contact-us" element={<Contact />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tours/category/:slugCategory" element={<Tours />} />
      <Route path="/tour-details/:SlugTour" element={<TourDetails />} />
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
      <Route path="/payment/return" element={<PaymentReturn />} />
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
      <Route path="/categories" element={<Categories />} />
      <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
    </Routes>
  );

  return (
    <>
      {isLoginAdmin ? (
        <Routes>
          <Route path="/loginadmin" element={<LoginAdmin />} />
        </Routes>
      ) : isAdminPath ? (
        <AdminContent isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
          <Routes>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/team" element={<Team />} />
            <Route path="/admin/contacts" element={<Contacts />} />
            <Route path="/admin/invoices" element={<InvoicesAdmin />} />
            <Route path="/admin/form" element={<Form />} />
            <Route path="/admin/bar" element={<Bar />} />
            <Route path="/admin/pie" element={<Pie />} />
            <Route path="/admin/line" element={<Line />} />
            <Route path="/admin/tourcontrol" element={<TourControl />} />
            <Route path="/admin/category" element={<Category />} />
            <Route path="/admin/voucher" element={<Voucher />} />
            <Route path="/admin/rightsgroup" element={<Rightsgroup />} />
            <Route path="/admin/delegation" element={<Delegation />} />
            <Route path="/admin/settings" element={<Setting />} />
            <Route path="/admin/hotel" element={<Hotel />} />
            <Route path="/admin/qlhotel" element={<QLHotel />} />
            <Route path="/admin/review" element={<Review />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AdminContent>
      ) : (
        <ClientContent shouldWrap={shouldWrap}>{clientRoutes}</ClientContent>
      )}
    </>
  );
};

function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;