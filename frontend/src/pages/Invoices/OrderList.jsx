import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form, Spinner, Alert, Pagination } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../utils/api";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./orderlist.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelInfo, setCancelInfo] = useState({
    numberAccount: "",
    bankName: "",
  });
  const [errors, setErrors] = useState({ numberAccount: "", bankName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPage: 1,
    limitItems: 5,
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Đơn hàng của tôi - GoTravel";
    window.scrollTo(0, 0);
    fetchOrders();
  }, [searchParams]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const page = searchParams.get("page") || 1;
      const limit = searchParams.get("limit") || 5;
      const response = await api.get(`/users/orders?page=${page}&limit=${limit}`);
      if (response.data.code === 200) {
        setOrders(response.data.data || []);
        setPagination(response.data.pagination || { currentPage: 1, totalPage: 1, limitItems: 5 });
      } else {
        toast.error(response.data.message || "Không thể tải danh sách đơn hàng!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelInfo({ numberAccount: "", bankName: "" });
    setErrors({ numberAccount: "", bankName: "" });
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
  };

  const validateCancelForm = () => {
    const newErrors = { numberAccount: "", bankName: "" };
    let isValid = true;

    if (!cancelInfo.numberAccount.trim()) {
      newErrors.numberAccount = "Vui lòng nhập số tài khoản!";
      isValid = false;
    }

    if (!cancelInfo.bankName.trim()) {
      newErrors.bankName = "Vui lòng nhập tên ngân hàng!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCancelOrder = async () => {
    if (!validateCancelForm()) {
      toast.error("Vui lòng kiểm tra thông tin trước khi hủy!");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Gửi yêu cầu hủy đơn hàng:", { orderId: selectedOrderId, cancelInfo });
      const response = await api.patch(`/api/v1/checkout/cancel/${selectedOrderId}`, cancelInfo);
      console.log("Phản hồi từ server:", response.data);
      if (response.data.code === 200) {
        toast.success("Hủy đơn hàng thành công!");
        setShowCancelModal(false);
        fetchOrders();
      } else {
        toast.error(response.data.message || "Hủy đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCancelInfo((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return { className: "status-pending", label: "Đang chờ" };
      case "paid":
        return { className: "status-paid", label: "Đã thanh toán" };
      case "cancelled":
        return { className: "status-cancelled", label: "Đã hủy" };
      default:
        return { className: "", label: status };
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPage) {
      setSearchParams({ page: newPage, limit: pagination.limitItems });
    }
  };

  const renderPagination = () => {
    const { currentPage, totalPage } = pagination;
    const items = [];

    // Nút Previous
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Hiển thị các số trang
    for (let number = 1; number <= totalPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Nút Next
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPage}
      />
    );

    return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
  };

  return (
    <>
      <Breadcrumbs title="Đơn hàng của tôi" pagename="Đơn hàng" />
      <section className="orders-section">
        <Container>
          <h1>Danh sách đơn hàng</h1>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <Alert variant="info">Bạn chưa có đơn hàng nào.</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusData = getStatusClass(order.status);
                    return (
                      <tr key={order._id}>
                        <td>{order.orderCode}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td>{order.totalPrice.toLocaleString()} VNĐ</td>
                        <td>
                          <span className={`status-badge ${statusData.className}`}>
                            {statusData.label}
                          </span>
                        </td>
                        <td>
                          {order.status === "paid" && (
                            <Button
                              className="cancel-btn"
                              onClick={() => handleOpenCancelModal(order._id)}
                            >
                              Hủy đơn hàng
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              {renderPagination()}
            </>
          )}
        </Container>
      </section>

      <Modal show={showCancelModal} onHide={handleCloseCancelModal}>
        <Modal.Header closeButton>
          <Modal.Title>Hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng cung cấp thông tin tài khoản để hoàn tiền (nếu có).</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Số tài khoản</Form.Label>
              <Form.Control
                type="text"
                name="numberAccount"
                value={cancelInfo.numberAccount}
                onChange={handleInputChange}
                placeholder="Nhập số tài khoản"
                isInvalid={!!errors.numberAccount}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">{errors.numberAccount}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên ngân hàng</Form.Label>
              <Form.Control
                type="text"
                name="bankName"
                value={cancelInfo.bankName}
                onChange={handleInputChange}
                placeholder="Nhập tên ngân hàng"
                isInvalid={!!errors.bankName}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">{errors.bankName}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCancelModal} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button variant="danger" onClick={handleCancelOrder} disabled={isSubmitting}>
            {isSubmitting ? <Spinner animation="border" size="sm" /> : "Xác nhận hủy"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderList;