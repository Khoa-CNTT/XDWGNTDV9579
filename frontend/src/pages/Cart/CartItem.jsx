import React from "react";
import { Button, Image } from "react-bootstrap";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

const CartItem = ({ item, removeItem, updateQuantity }) => {
  return (
    <tr>
      <td>
        {/* Bọc ảnh trong div để kiểm soát kích thước */}
        <div className="cart-image-container">
          <Image src={item.image} alt={item.name} className="cart-item-image" rounded />
        </div>
      </td>
      <td>{item.name}</td>
      <td>{item.price.toLocaleString()}đ</td>
      <td>{item.discount}%</td>
      <td>
        <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
          <FaMinus />
        </Button>
        <span className="mx-2">{item.quantity}</span>
        <Button variant="outline-primary" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
          <FaPlus />
        </Button>
      </td>
      <td>{(item.quantity * (item.price * (1 - item.discount / 100))).toLocaleString()}đ</td>
      <td>
        <Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>
          <FaTrash /> Xóa
        </Button>
      </td>
    </tr>
  );
};

export default CartItem;
