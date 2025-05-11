import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import "./cart.css";

const CartItem = ({ item, removeItem }) => {
  const { updateQuantity, isLoading } = useCart();
  const [quantity, setQuantity] = useState(item.quantity || 1);

  useEffect(() => {
    setQuantity(item.quantity || 1);
  }, [item.quantity]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    setQuantity(newQuantity);
    updateQuantity(
      item.type,
      item.type === "tour"
        ? { id: item.tour_id, timeDepart: item.timeDepart }
        : { hotel_id: item.hotel_id, room_id: item.room_id },
      newQuantity
    );
  };

  const handleRemove = () => {
    console.log("Removing item from CartItem:", item); // Log để gỡ lỗi
    removeItem(item);
  };

  return (
    <tr>
      <td>
        {item.image ? (
          <img src={item.image} alt={item.title} className="cart-item-image" />
        ) : (
          <div className="cart-placeholder">No Image</div>
        )}
      </td>
      <td>{item.title}</td>
      <td>
        {item.type === "tour"
          ? new Date(item.timeDepart).toLocaleDateString("vi-VN")
          : item.checkIn && item.checkOut
          ? `Check-in: ${new Date(item.checkIn).toLocaleDateString("vi-VN")}, Check-out: ${new Date(
              item.checkOut
            ).toLocaleDateString("vi-VN")}`
          : "Không áp dụng"}
      </td>
      <td>{item.price.toLocaleString()} VNĐ</td>
      <td>
        <div className="quantity-control">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isLoading || quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
            disabled={isLoading}
          />
          <button onClick={() => handleQuantityChange(quantity + 1)} disabled={isLoading}>
            +
          </button>
        </div>
      </td>
      <td>{(item.price * quantity).toLocaleString()} VNĐ</td>
      <td>
        <button
          className="remove-btn"
          onClick={handleRemove}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="bi bi-spinner bi-spin"></i>
          ) : (
            <i className="bi bi-trash"></i>
          )}{" "}
          Xóa
        </button>
      </td>
    </tr>
  );
};

export default CartItem;