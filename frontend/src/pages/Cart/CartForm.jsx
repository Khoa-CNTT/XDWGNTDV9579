import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const CartForm = () => {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    voucher: "",
    note: "",
  });

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("🎉 Đặt tour thành công!");
    console.log("Thông tin khách hàng:", customer);
  };

  return (
    <Form className="cart-form p-4 border rounded shadow-sm bg-light" onSubmit={handleSubmit}>
      <h3>📝 Thông tin khách hàng</h3>
      <Form.Group>
        <Form.Label>Họ tên</Form.Label>
        <Form.Control type="text" name="name" placeholder="Nhập họ tên" onChange={handleChange} required />
      </Form.Group>

      <Form.Group>
        <Form.Label>Số điện thoại</Form.Label>
        <Form.Control type="tel" name="phone" placeholder="Nhập số điện thoại" onChange={handleChange} required />
      </Form.Group>

      <Form.Group>
        <Form.Label>Mã giảm giá (nếu có)</Form.Label>
        <Form.Control type="text" name="voucher" placeholder="Nhập mã giảm giá" onChange={handleChange} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Ghi chú</Form.Label>
        <Form.Control as="textarea" name="note" placeholder="Ghi chú thêm" onChange={handleChange} />
      </Form.Group>

      <Button variant="success" type="submit" className="mt-3 cart-submit-btn">
        📅 Đặt Tour
      </Button>

      <ToastContainer />
    </Form>
  );
};

export default CartForm;
