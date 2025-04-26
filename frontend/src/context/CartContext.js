import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext({
  cartCount: 0,
  fetchCartCount: () => {},
  addToCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const fetchCartCount = async () => {
    try {
      if (!user) {
        setCartCount(0);
        return;
      }
      const response = await api.get("/carts");
      if (response.data.code === 200) {
        // Kiểm tra và mặc định tours và hotels là mảng rỗng nếu không tồn tại
        const tours = response.data.tours || [];
        const hotels = response.data.hotels || [];
        
        const tourQuantity = tours.reduce((total, item) => total + item.quantity, 0);
        const roomQuantity = hotels.reduce(
          (total, hotel) => total + (hotel.rooms || []).reduce((sum, room) => sum + room.quantity, 0),
          0
        );
        setCartCount(tourQuantity + roomQuantity);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Không thể lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  };

  const addToCart = async (type, payload) => {
    try {
      let response;
      if (type === "tour") {
        response = await api.post(`/carts/add/${payload.tourId}`, {
          quantity: payload.quantity,
        });
      } else if (type === "room") {
        response = await api.post(`/carts/add/${payload.hotelId}/${payload.roomId}`, {
          quantity: payload.quantity,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
        });
      }
      if (response.data.code === 200) {
        toast.success("Đã thêm vào giỏ hàng!");
        await fetchCartCount(); // Cập nhật số lượng sau khi thêm
      } else {
        toast.error(response.data.message || "Không thể thêm vào giỏ hàng!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng!");
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};