// src/components/AdvanceSearch/AdvanceSearch.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../AdvanceSearch/search.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import CustomDropdown from "../CustomDropdown/CustomDropdown";
import api from "../../utils/api"; // Đảm bảo đường dẫn chính xác
import { toast } from "react-toastify";

const AdvanceSearch = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Xử lý chọn vị trí
  const selectedLocation = (value) => {
    setLocation(value);
    console.log("Vị trí:", value);
  };

  // Xử lý chọn số lượng khách
  const selectedGuest = (value) => {
    setGuests(value);
    console.log("Khách:", value);
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    // Validation cơ bản
    if (!location || !guests) {
      toast.error("Vui lòng chọn vị trí và số lượng khách!");
      return;
    }

    if (endDate < startDate) {
      toast.error("Ngày về phải lớn hơn hoặc bằng ngày đi!");
      return;
    }

    setLoading(true);

    try {
      // Gửi yêu cầu đến backend để lấy danh sách tour
      const response = await api.get("/tours", {
        params: {
          location,
          guests,
          start_date: startDate.toISOString().split("T")[0], // Định dạng YYYY-MM-DD
          end_date: endDate.toISOString().split("T")[0],
        },
      });

      // Điều hướng đến trang Tours với dữ liệu từ backend
      navigate("/tours", { state: { tours: response.data } });
      toast.success("Tìm kiếm thành công!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="box-search-advance">
      <Container>
        <Row>
          <Col md={12} xs={12}>
            <div className="box-search shadow-sm">
              <div className="item-search">
                <CustomDropdown
                  label="Vị trí"
                  onSelect={selectedLocation}
                  options={[
                    "Cố Đô Huế, TP. Huế",
                    "Tràng An, Ninh Bình",
                    "SaPa, Lào Cai",
                    "Động Phong Nha, Quảng Bình",
                    "Phố Cổ Hội An, Quảng Nam",
                  ]}
                />
              </div>
              <div className="item-search item-search-2">
                <label className="item-search-label">Ngày đi</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()} // Không cho phép chọn ngày trong quá khứ
                  dateFormat="dd, MMMM, yyyy"
                />
              </div>
              <div className="item-search item-search-2">
                <label className="item-search-label">Ngày về</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate} // Ngày về không được nhỏ hơn ngày đi
                  dateFormat="dd, MMMM, yyyy"
                />
              </div>
              <div className="item-search bd-none">
                <CustomDropdown
                  label="Khách"
                  onSelect={selectedGuest}
                  options={[
                    "1 người lớn",
                    "2 người lớn",
                    "2 người lớn, 1 trẻ em",
                    "2 người lớn, 2 trẻ em",
                    "2 người lớn, 3 trẻ em",
                  ]}
                />
              </div>
              <div className="item-search bd-none">
                <Button
                  className="primaryBtn flex-even d-flex justify-content-center"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <i className="bi bi-arrow-repeat spinning me-2"></i>
                  ) : (
                    <i className="bi bi-search me-2"></i>
                  )}
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AdvanceSearch;