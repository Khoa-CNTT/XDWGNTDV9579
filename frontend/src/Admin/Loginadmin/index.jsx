import React, { useState } from "react";
import { Box, Button, TextField, Typography, Link } from "@mui/material";

const LoginAdmin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Username:", username);
        console.log("Password:", password);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            sx={{
                backgroundImage: `url('https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/canh-dep-2.jpg')`, // Hình nền từ URL
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Box
                width="400px"
                p={4}
                borderRadius="12px"
                bgcolor="rgb(255, 255, 255,0.4)"
                boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
            >
                {/* Tiêu đề */}
                <Typography
                    variant="h4"
                    textAlign="center"
                    fontWeight="bold"
                    mb={2}
                    sx={{ fontFamily: "'Poppins', sans-serif", color: "#333" }}
                >
                    Đăng nhập Admin
                </Typography>

                {/* Form đăng nhập */}
                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        InputLabelProps={{
                            style: { color: "#222222" },
                        }}
                        InputProps={{
                            style: { color: "#222222" },
                        }}
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
                    />
                    {/* <Box display="flex" justifyContent="space-between" mt={1}>
                        <Link href="#" underline="hover" sx={{ fontSize: "14px", color: "#555" }}>
                            Forgot Password?
                        </Link>
                    </Box> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            fontWeight: "bold",
                            backgroundColor: "#28a745", // Màu xanh lá
                            color: "#fff",
                            "&:hover": {
                                backgroundColor: "#218838", // Màu xanh lá đậm hơn khi hover
                            },
                        }}
                    >
                        ĐĂNG NHẬP
                    </Button>
                </form>

                {/* Footer */}
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