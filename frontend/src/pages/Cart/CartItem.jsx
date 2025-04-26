import React, { useState } from "react";
import "./cart.css";

const CartItem = ({ item, removeItem, updateQuantity }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    updateQuantity(item.id, newQuantity);
  };

  return (
    <tr>
      <td>
        {item.image ? (
          <img src={item.image} alt={item.name} className="cart-item-image" />
        ) : (
          <div className="cart-placeholder">No Image</div>
        )}
      </td>
      <td>{item.name}</td>
      <td>{item.price.toLocaleString()} VNĐ</td>
      <td>
        <div className="quantity-control">
          <button onClick={() => handleQuantityChange(quantity - 1)}>-</button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
          />
          <button onClick={() => handleQuantityChange(quantity + 1)}>+</button>
        </div>
      </td>
      <td>{(item.price * quantity).toLocaleString()} VNĐ</td>
      <td>
        <button className="remove-btn" onClick={removeItem}>
          <i className="bi bi-trash"></i> Xóa
        </button>
      </td>
    </tr>
  );
};

export default CartItem;