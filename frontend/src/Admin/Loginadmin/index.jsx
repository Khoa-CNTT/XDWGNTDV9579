import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import api from "../../utils/api";
import { useAdminAuth } from "../../context/AdminContext";
import { toast } from "react-toastify";

const LoginAdmin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/admin/accounts/login", {
                email,
                password,
            });
            console.log("Login response:", JSON.stringify(response.data, null, 2));

            if (response.data.code === 200) {
                const token = response.data.token;

                // Gọi GET /api/v1/admin/accounts để lấy thông tin tài khoản
                const accountsResponse = await api.get("/admin/accounts", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Accounts response:", JSON.stringify(accountsResponse.data, null, 2));

                // Lọc tài khoản dựa trên email
                const account = accountsResponse.data.find(acc => acc.email === email);
                if (!account) {
                    toast.error("Không tìm thấy tài khoản với email này!");
                    throw new Error("Không tìm thấy tài khoản!");
                }

                const adminData = {
                    _id: account._id || "",
                    email: account.email || email,
                    fullName: account.fullName || "",
                    phone: account.phone || "",
                    avatar: account.avatar || "",
                };
                console.log("Saving adminData to localStorage:", JSON.stringify(adminData, null, 2));
                loginAdmin(adminData, token);
                localStorage.setItem("adminInfo", JSON.stringify(adminData));
                localStorage.setItem("adminToken", token);
                toast.success("Đăng nhập thành công!");
                navigate("/admin/dashboard");
            } else {
                setError(response.data.message || "Đăng nhập thất bại!");
                toast.error(response.data.message || "Đăng nhập thất bại!");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
            setError(errorMessage);
            toast.error(errorMessage);
            if (err.response?.status === 400 && errorMessage.includes("quyền")) {
                toast.error("Vui lòng liên hệ quản trị viên để cấp quyền account_view!");
            }
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
                        InputLabelProps={{ style: { color: "#222222" } }}
                        InputProps={{ style: { color: "#222222" } }}
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
                        InputLabelProps={{ style: { color: "#222222" } }}
                        InputProps={{ style: { color: "#222222" } }}
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
                            "&:hover": { backgroundColor: "#218838" },
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
                    </Button>
                </form>
            </Box>
        </Box>
    );
};

export default LoginAdmin;