import React, { createContext, useContext, useState, useEffect } from "react";
import { debounce } from "lodash"; // Thêm lodash để debounce
import api from "../utils/api";
import { toast } from "react-toastify";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ tours: [], hotels: [], totalPrice: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading để tránh spam yêu cầu

  useEffect(() => {
    fetchCart();
  }, []);

  // Debounce fetchCart để tránh gọi API quá nhanh
  const debouncedFetchCart = debounce(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/carts/");
      if (response.data) {
        const cartData = {
          tours: response.data.tours || [],
          hotels: response.data.hotels || [],
          totalPrice: response.data.totalPrice || 0,
        };
        setCart(cartData);

        // Tính tổng số lượng dịch vụ
        const totalCount =
          cartData.tours.reduce(
            (sum, tour) =>
              sum +
              tour.timeStarts.reduce((tSum, time) => tSum + (time.quantity || 0), 0),
            0
          ) +
          cartData.hotels.reduce(
            (sum, hotel) =>
              sum +
              hotel.rooms.reduce((rSum, room) => rSum + (room.quantity || 0), 0),
            0
          );
        setCartCount(totalCount);
        console.log("Cart count updated:", totalCount); // Log để gỡ lỗi
      }
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Không thể tải giỏ hàng!");
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const fetchCart = async () => {
    await debouncedFetchCart();
  };

  const addToCart = async (type, item) => {
    try {
      setIsLoading(true);
      if (type === "tour") {
        const payload = {
          timeDepart: item.timeDepart,
          quantity: item.quantity,
        };
        await api.post(`/carts/add/${item._id}`, payload);
      } else if (type === "room") {
        const payload = {
          quantity: item.quantity,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
        };
        await api.post(`/carts/add/${item.hotelId}/${item.roomId}`, payload);
      }
      await fetchCart();
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (type, item, newQuantity) => {
    try {
      if (newQuantity < 1) {
        toast.warn("Số lượng phải lớn hơn 0!");
        return;
      }
      setIsLoading(true);
      if (type === "tour") {
        const payload = { timeDepart: item.timeDepart, quantity: newQuantity };
        await api.patch(`/carts/update/${item.id}`, payload);
      } else if (type === "room") {
        const payload = { quantity: newQuantity };
        await api.patch(`/carts/updateRoom/${item.hotel_id}/${item.room_id}`, payload);
      }
      await fetchCart();
      toast.success("Cập nhật số lượng thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Không thể cập nhật số lượng!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (type, id, roomId) => {
    try {
      setIsLoading(true);
      console.log("Calling removeFromCart with:", { type, id, roomId }); // Log để gỡ lỗi
      if (type === "tour") {
        await api.patch(`/carts/delete/${id}`);
      } else if (type === "room" && roomId) {
        await api.patch(`/carts/deleteHotel/${id}/${roomId}`);
      } else if (type === "room") {
        await api.patch(`/carts/deleteHotel/${id}`);
      }
      await fetchCart();
      toast.success("Đã xóa khỏi giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa khỏi giỏ hàng:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Không thể xóa khỏi giỏ hàng!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async (data) => {
    try {
      setIsLoading(true);
      const response = await api.post("/checkout/order", data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await api.patch("/carts/clear");
      await fetchCart();
      setCartCount(0);
      toast.success("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Không thể xóa giỏ hàng!");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout,
        fetchCart,
        clearCart,
        cartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};