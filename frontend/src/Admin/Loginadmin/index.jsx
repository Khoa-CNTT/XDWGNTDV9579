import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import api from "../../utils/api"; // Import instance api từ api.js
import { useAdminAuth } from "../../context/AdminContext"; // Import useAdminAuth từ AdminAuthContext

const LoginAdmin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginAdmin } = useAdminAuth(); // Lấy hàm loginAdmin từ AdminAuthContext

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/admin/accounts/login", {
                email,
                password,
            });

            if (response.data.code === 200) {
                // Chuẩn bị dữ liệu admin
                const adminData = {
                    email: email,
                };

                // Gọi hàm loginAdmin từ AdminAuthContext
                loginAdmin(adminData, response.data.token);

                // Chuyển hướng được xử lý trong loginAdmin
            } else {
                setError(response.data.message || "Đăng nhập thất bại!");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            sx={{
                backgroundImage: `url('https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/canh-dep-2.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Box
                width="400px"
                p={4}
                borderRadius="12px"
                bgcolor="rgba(255, 255, 255, 0.4)"
                boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
            >
                <Typography
                    variant="h4"
                    textAlign="center"
                    fontWeight="bold"
                    mb={2}
                    sx={{ fontFamily: "'Poppins', sans-serif", color: "#333" }}
                >
                    Đăng nhập Admin
                </Typography>

                {error && (
                    <Typography color="error" textAlign="center" mb={2}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputLabelProps={{
                            style: { color: "#222222" },
                        }}
                        InputProps={{
                            style: { color: "#222222" },
                        }}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputLabelProps={{
                            style: { color: "#222222" },
                        }}
                        InputProps={{
                            style: { color: "#222222" },
                        }}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            fontWeight: "bold",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            "&:hover": {
                                backgroundColor: "#218838",
                            },
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "ĐĂNG NHẬP"}
                    </Button>
                </form>

                <Typography
                    variant="body2"
                    textAlign="center"
                    mt={3}
                    sx={{ fontFamily: "'Poppins', sans-serif", color: "#222222" }}
                >
                    © 2025 Design by Group 66
                </Typography>
            </Box>
        </Box>
    );
};

export default LoginAdmin;