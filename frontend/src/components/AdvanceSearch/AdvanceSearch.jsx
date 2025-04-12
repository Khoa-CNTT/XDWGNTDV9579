// src/components/AdvanceSearch/AdvanceSearch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../AdvanceSearch/search.css";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import api from "../../utils/api";
import { toast } from "react-toastify";

const AdvanceSearch = () => {
  const [searchTab, setSearchTab] = useState("tour");
  const [searchQuery, setSearchQuery] = useState("");
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gọi API để lấy gợi ý và từ khóa liên quan khi người dùng nhập
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery) {
        setRelatedKeywords([]);
        setSuggestions([]);
        return;
      }

      try {
        const endpoint = searchTab === "tour" ? "/tours/search" : "/hotels/search";
        const response = await api.get(endpoint, {
          params: { query: searchQuery },
        });
        // Giả định API trả về cả từ khóa liên quan và kết quả
        setRelatedKeywords(response.data.relatedKeywords || []);
        setSuggestions(response.data.results || []);
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý:", error);
        setRelatedKeywords([]);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300); // Debounce để tránh gọi API quá nhiều
    return () => clearTimeout(debounce);
  }, [searchQuery, searchTab]);

  // Xử lý tìm kiếm khi nhấn nút
  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    setLoading(true);

    try {
      if (searchTab === "tour") {
        const response = await api.get("/tours", {
          params: { query: searchQuery },
        });
        navigate("/tours", { state: { tours: response.data } });
      } else {
        const response = await api.get("/hotels", {
          params: { query: searchQuery },
        });
        navigate("/hotel-services", { state: { hotels: response.data } });
      }
      toast.success("Tìm kiếm thành công!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn một từ khóa liên quan
  const handleSelectKeyword = (keyword) => {
    setSearchQuery(keyword);
  };

  // Xử lý khi chọn một gợi ý
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setRelatedKeywords([]);
    setSuggestions([]);
    if (searchTab === "tour") {
      navigate("/tours", { state: { tours: [suggestion] } });
    } else {
      navigate("/hotel-services", { state: { hotels: [suggestion] } });
    }
  };

  return (
    <section className="box-search-advance">
      <Container>
        <Row>
          <Col md={12} xs={12}>
            <div className="box-search shadow-sm">
              {/* Tab Tour và Khách sạn */}
              <div className="search-tabs">
                <button
                  className={`tab-btn ${searchTab === "tour" ? "active" : ""}`}
                  onClick={() => {
                    setSearchTab("tour");
                    setSearchQuery("");
                    setRelatedKeywords([]);
                    setSuggestions([]);
                  }}
                >
                  <i className="bi bi-bus-front me-2"></i>
                  Tour
                </button>
                <button
                  className={`tab-btn ${searchTab === "hotel" ? "active" : ""}`}
                  onClick={() => {
                    setSearchTab("hotel");
                    setSearchQuery("");
                    setRelatedKeywords([]);
                    setSuggestions([]);
                  }}
                >
                  <i className="bi bi-building me-2"></i>
                  Hotel
                </button>
              </div>

              {/* Ô tìm kiếm */}
              <div className="search-container">
                <div className="item-search">
                  <Form.Control
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchTab === "tour" ? "Nhập tên tour" : "Nhập địa điểm"
                    }
                    className="search-input"
                  />
                  {/* Danh sách gợi ý */}
                  {(relatedKeywords.length > 0 || suggestions.length > 0) && (
                    <div className="suggestions-container">
                      {/* Từ khóa liên quan */}
                      {relatedKeywords.length > 0 && (
                        <div className="related-keywords">
                          <h6>Từ khóa liên quan</h6>
                          <ul className="keywords-list">
                            {relatedKeywords.map((keyword, index) => (
                              <li
                                key={index}
                                onClick={() => handleSelectKeyword(keyword)}
                                className="keyword-item"
                              >
                                <i className="bi bi-search me-2"></i>
                                {keyword}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Gợi ý kết quả */}
                      {suggestions.length > 0 && (
                        <div className="suggestions-list">
                          <h6>Gợi ý kết quả</h6>
                          <ul className="results-list">
                            {suggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="result-item"
                              >
                                <img
                                  src={suggestion.image || "/default-image.jpg"}
                                  alt={suggestion.name}
                                  className="result-image"
                                />
                                <div className="result-info">
                                  <p className="result-name">{suggestion.name}</p>
                                  <p className="result-description">
                                    {suggestion.description || "Không có mô tả"}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Nút tìm kiếm */}
                <div className="search-btn-container">
                  <Button
                    className="search-btn"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <i className="bi bi-arrow-repeat spinning"></i>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AdvanceSearch;