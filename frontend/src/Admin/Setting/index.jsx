import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, useTheme, CircularProgress, Card, CardContent, CardHeader, Divider, Avatar } from "@mui/material";
import { tokens } from "../../theme";
import { useAdminAuth } from "../../context/AdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getGeneralSettings, updateGeneralSettings } from "./SettingApi";

const Setting = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        websiteName: "",
        logo: "",
        phone: "",
        email: "",
        address: "",
        slogan: "",
        copyright: ""
    });
    const [logoPreview, setLogoPreview] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await getGeneralSettings();
            console.log("Settings data:", data);
            if (data) {
                setSettings({
                    websiteName: data.websiteName || "",
                    logo: data.logo || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    address: data.address || "",
                    slogan: data.slogan || "",
                    copyright: data.copyright || ""
                });
                if (data.logo) {
                    setLogoPreview(data.logo);
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Không thể tải cài đặt!", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSettings(prev => ({
                ...prev,
                logo: file
            }));
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await updateGeneralSettings(settings);
            console.log("Update response:", response);
            if (response.code === 200) {
                toast.success("Cập nhật cài đặt thành công!", { position: "top-right" });
                // Reload the entire page after a short delay to ensure toast is visible
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error(response.message || "Cập nhật thất bại!", { position: "top-right" });
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                zIndex={9999}
            />
            <Box sx={{ margin: '40px' }}>
                <Card>
                    <CardHeader
                        title={
                            <Typography variant="h4" color={colors.grey[100]}>
                                Cài đặt thông tin website
                            </Typography>
                        }
                    />
                    <Divider />
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Logo section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    {logoPreview && (
                                        <Box>
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                style={{
                                                    width: '250px',
                                                    height: '250px',
                                                    objectFit: 'contain',
                                                    borderRadius: '50%',
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                    border: '2px solid #000'
                                                }}
                                            />
                                        </Box>
                                    )}
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                        <Button
                                            sx={{
                                                backgroundColor: colors.blueAccent[200],
                                                color: "white",
                                                "&:hover": {
                                                    backgroundColor: colors.blueAccent[1100],
                                                },
                                            }}
                                            variant="contained"
                                            component="label"
                                            disabled={loading}
                                        >
                                            Chọn ảnh
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                hidden
                                            />
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Form fields */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Tên website"
                                        name="websiteName"
                                        value={settings.websiteName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Số điện thoại"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Địa chỉ"
                                        name="address"
                                        value={settings.address}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Slogan"
                                        name="slogan"
                                        value={settings.slogan}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Copyright"
                                        name="copyright"
                                        value={settings.copyright}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                </Box>

                                {/* Submit button */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Setting;