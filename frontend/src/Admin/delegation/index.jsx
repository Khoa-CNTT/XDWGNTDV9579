import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getRightsGroups, updatePermissions } from "../rightsgroup/RightsgroupApi";
import { useAdminAuth } from "../../context/AdminContext";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";

// Danh sách tính năng và quyền
const FEATURES = [
    { name: "Tour", permissions: ["tour_view", "tour_create", "tour_edit", "tour_delete"] },
    { name: "Danh mục", permissions: ["category_view", "category_create", "category_edit", "category_delete"] },
    { name: "Đơn hàng", permissions: ["invoice_view", "invoice_create", "invoice_edit", "invoice_delete"] },
    { name: "Voucher", permissions: ["voucher_view", "voucher_create", "voucher_edit", "voucher_delete"] },
    { name: "Nhóm quyền", permissions: ["role_view", "role_create", "role_edit", "role_delete", "role_permissions"] },
    { name: "Tài khoản khách hàng", permissions: ["user_view", "user_create", "user_edit", "user_delete"] },
    { name: "Khách sạn", permissions: ["hotel_view", "hotel_create", "hotel_edit", "hotel_delete"] },
    { name: "Tài khoản nội bộ", permissions: ["account_view", "account_create", "account_edit", "account_delete"] },
    { name: "Hoá đơn", permissions: ["order_view", "order_edit", "order_delete"] },
    { name: "Review", permissions: ["review_view", "review_delete"] },
    { name: "Setting", permissions: ["general"] },
];

// Định nghĩa hành động và tên hiển thị
const ACTIONS = {
    view: "Xem",
    create: "Thêm mới",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    permissions: "Phân quyền",
};

const DelegationControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { adminToken } = useAdminAuth();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [previousPermissions, setPreviousPermissions] = useState({});

    // Lấy danh sách nhóm quyền từ API
    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await getRightsGroups();
            const formattedRoles = Array.isArray(data)
                ? data.map((role) => ({
                    id: role._id,
                    title: role.title,
                    permissions: role.permissions || [],
                }))
                : [];
            setRoles(formattedRoles);
            // Tạo cấu trúc permissions dựa trên roles và FEATURES
            const newPermissions = {};
            const newPreviousPermissions = {};
            FEATURES.forEach((feature) => {
                newPermissions[feature.name] = {
                    feature: feature.name,
                    roles: formattedRoles.reduce((acc, role) => {
                        acc[role.title] = feature.permissions.reduce((permAcc, perm) => {
                            permAcc[perm.split("_")[1]] = role.permissions.includes(perm);
                            return permAcc;
                        }, {});
                        return acc;
                    }, {}),
                };
                newPreviousPermissions[feature.name] = { roles: {} };
            });
            setPermissions(newPermissions);
            setPreviousPermissions(newPreviousPermissions);
            console.log("Roles loaded:", formattedRoles);
            console.log("Permissions structured:", newPermissions);
            if (formattedRoles.length === 0) {
                toast.info("Không có nhóm quyền nào để hiển thị!", { position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải danh sách nhóm quyền!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Fetch roles error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = adminToken || localStorage.getItem("adminToken");
        console.log("adminToken in DelegationControl:", token);
        if (token) {
            fetchRoles();
        } else {
            toast.error("Vui lòng đăng nhập để tiếp tục!", { position: "top-right" });
            setTimeout(() => {
                window.location.href = "/loginadmin";
            }, 2000);
        }
    }, [adminToken]);

    // Xử lý thay đổi quyền
    const handlePermissionChange = (featureName, roleTitle, action) => {
        setPermissions((prevPermissions) => {
            const newPermissions = { ...prevPermissions };
            newPermissions[featureName].roles[roleTitle][action] =
                !newPermissions[featureName].roles[roleTitle][action];
            return newPermissions;
        });
    };

    // Xử lý checkbox "Tất cả" cho một nhóm quyền (theo hàng)
    const handleSelectAllRole = (roleTitle) => {
        setPermissions((prevPermissions) => {
            const newPermissions = { ...prevPermissions };
            const allSelected = FEATURES.every((feature) =>
                Object.values(newPermissions[feature.name].roles[roleTitle]).every((isChecked) => isChecked)
            );

            if (!allSelected) {
                // Lưu trạng thái hiện tại vào previousPermissions trước khi tích "Tất cả"
                const rolePreviousPermissions = {};
                FEATURES.forEach((feature) => {
                    rolePreviousPermissions[feature.name] = JSON.parse(
                        JSON.stringify(newPermissions[feature.name].roles[roleTitle])
                    );
                });
                setPreviousPermissions((prev) => ({
                    ...prev,
                    roles: {
                        ...prev.roles,
                        [roleTitle]: rolePreviousPermissions,
                    },
                }));
                // Tích tất cả checkbox trong hàng
                FEATURES.forEach((feature) => {
                    Object.keys(newPermissions[feature.name].roles[roleTitle]).forEach((action) => {
                        newPermissions[feature.name].roles[roleTitle][action] = true;
                    });
                });
            } else {
                // Khôi phục trạng thái trước đó từ previousPermissions
                const previousRolePermissions = prevPermissions.roles?.[roleTitle];
                if (previousRolePermissions) {
                    FEATURES.forEach((feature) => {
                        Object.keys(newPermissions[feature.name].roles[roleTitle]).forEach((action) => {
                            newPermissions[feature.name].roles[roleTitle][action] =
                                previousRolePermissions[feature.name][action];
                        });
                    });
                } else {
                    // Nếu không có trạng thái trước đó, bỏ tích tất cả
                    FEATURES.forEach((feature) => {
                        Object.keys(newPermissions[feature.name].roles[roleTitle]).forEach((action) => {
                            newPermissions[feature.name].roles[roleTitle][action] = false;
                        });
                    });
                }
            }
            return newPermissions;
        });
    };

    // Kiểm tra trạng thái checkbox "Tất cả" cho một nhóm quyền
    const isAllRoleSelected = (roleTitle) => {
        return FEATURES.every((feature) =>
            Object.values(permissions[feature.name]?.roles[roleTitle] || {}).every((isChecked) => isChecked)
        );
    };

    // Cập nhật quyền lên backend
    const handleUpdatePermissions = async () => {
        setLoading(true);
        try {
            // Tạo mảng permissionsData cho API /permissions
            const permissionsData = {
                permissions: roles.map((role) => {
                    const rolePermissions = [];
                    FEATURES.forEach((feature) => {
                        feature.permissions.forEach((perm) => {
                            const action = perm.split("_")[1];
                            if (permissions[feature.name]?.roles[role.title]?.[action]) {
                                rolePermissions.push(perm);
                            }
                        });
                    });
                    return {
                        id: role.id,
                        permissions: rolePermissions,
                    };
                }),
            };
            console.log("Permissions data to send:", permissionsData);
            const response = await updatePermissions(permissionsData);
            console.log("Update permissions response:", response);
            if (response.code === 200) {
                toast.success("Cập nhật phân quyền thành công!", { position: "top-right" });
                await fetchRoles(); // Tải lại dữ liệu để đồng bộ
            } else {
                const errorMessage = response.message || "Cập nhật phân quyền thất bại!";
                toast.error(errorMessage, { position: "top-right" });
                console.error("Update permissions failed:", response);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Cập nhật phân quyền thất bại!";
            toast.error(errorMessage, { position: "top-right" });
            console.error("Update permissions error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box m="20px">
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
                theme="light"
                limit={3}
            />

            <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" mb={2}>
                Phân quyền
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                </Box>
            ) : roles.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <Typography variant="h4" color={colors.grey[100]}>
                        Không có nhóm quyền nào để hiển thị
                    </Typography>
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400], border: "none" }}>
                        <Table sx={{ width: "100%", border: "none" }}>
                            <TableHead sx={{
                                backgroundColor: colors.blueAccent[700],
                                color: colors.grey[100], borderBottom: "none"
                            }}>
                                <TableRow>
                                    <TableCell sx={{ color: colors.grey[100], fontSize: "14px", fontWeight: "bold", borderBottom: "none" }}>
                                        Tính năng
                                    </TableCell>
                                    {roles.map((role) => (
                                        <TableCell
                                            align="center"
                                            key={role.id}
                                            sx={{ color: colors.grey[100], fontSize: "14px", fontWeight: "bold", borderBottom: "none" }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                                                {role.title}
                                                <Checkbox
                                                    checked={isAllRoleSelected(role.title)}
                                                    onChange={() => handleSelectAllRole(role.title)}
                                                    disabled={loading}
                                                    sx={{
                                                        color: `${colors.greenAccent[200]} !important`,
                                                        "&.Mui-checked": {
                                                            color: `${colors.greenAccent[200]} !important`,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: colors.primary[400] }}>
                                {Object.values(permissions).map((permission) => (
                                    <React.Fragment key={permission.feature}>
                                        <TableRow>
                                            <TableCell
                                                colSpan={roles.length + 1}
                                                sx={{ fontWeight: "bold", color: colors.grey[100], borderBottom: "none" }}
                                            >
                                                {permission.feature}
                                            </TableCell>
                                        </TableRow>
                                        {FEATURES.find((f) => f.name === permission.feature).permissions.map(
                                            (perm) => {
                                                const action = perm.split("_")[1];
                                                return (
                                                    <TableRow key={`${permission.feature}-${action}`}>
                                                        <TableCell sx={{ color: colors.grey[100], borderBottom: "none", paddingLeft: "40px" }}>
                                                            {ACTIONS[action]}
                                                        </TableCell>
                                                        {roles.map((role) => (
                                                            <TableCell align="center" key={role.id} sx={{ borderBottom: "none" }}>
                                                                <Checkbox
                                                                    checked={
                                                                        permission.roles[role.title][action] || false
                                                                    }
                                                                    onChange={() =>
                                                                        handlePermissionChange(
                                                                            permission.feature,
                                                                            role.title,
                                                                            action
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    sx={{
                                                                        color: `${colors.greenAccent[200]} !important`,
                                                                        "&.Mui-checked": {
                                                                            color: `${colors.greenAccent[200]} !important`,
                                                                        },
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdatePermissions}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                        </Button>
                    </Box>
                    <Box mt={4} display="flex" justifyContent="flex-end"></Box>
                </>
            )}
        </Box>
    );
};

export default DelegationControl;