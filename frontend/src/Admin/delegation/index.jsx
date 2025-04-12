import React, { useState } from "react";
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
} from "@mui/material";

const DelegationControl = () => {
    // Dữ liệu mẫu
    const [permissions, setPermissions] = useState([
        {
            feature: "Tour",
            roles: {
                Admin: { view: true, create: true, edit: true, delete: true },
                Employee: { view: true, create: false, edit: false, delete: false },
            },
        },
        {
            feature: "Danh mục",
            roles: {
                Admin: { view: true, create: true, edit: true, delete: true },
                Employee: { view: true, create: false, edit: false, delete: false },
            },
        },
        {
            feature: "Đơn hàng",
            roles: {
                Admin: { view: true, create: false, edit: true, delete: true },
                Employee: { view: true, create: false, edit: false, delete: false },
            },
        },
        {
            feature: "Voucher",
            roles: {
                Admin: { view: true, create: true, edit: true, delete: true },
                Employee: { view: true, create: false, edit: false, delete: false },
            },
        },
        {
            feature: "Nhóm quyền",
            roles: {
                Admin: { view: true, create: true, edit: true, delete: true },
                Employee: { view: true, create: false, edit: false, delete: false },
            },
        },
        {
            feature: "Tài khoản",
            roles: {
                Admin: { view: true, create: true, edit: true, delete: true },
                Employee: { view: true, create: false, edit: false, delete: false },
            },
        },
    ]);

    // Hàm xử lý thay đổi quyền
    const handlePermissionChange = (feature, role, action) => {
        setPermissions((prevPermissions) =>
            prevPermissions.map((item) =>
                item.feature === feature
                    ? {
                        ...item,
                        roles: {
                            ...item.roles,
                            [role]: {
                                ...item.roles[role],
                                [action]: !item.roles[role][action],
                            },
                        },
                    }
                    : item
            )
        );
    };

    return (
        <Box m="20px">
            {/* Tiêu đề */}
            <Typography variant="h4" fontWeight="bold" mb={2}>
                Phân quyền
            </Typography>

            {/* Bảng phân quyền */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tính năng</TableCell>
                            <TableCell align="center">Admin</TableCell>
                            <TableCell align="center">Nhân viên</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.map((permission) => (
                            <React.Fragment key={permission.feature}>
                                <TableRow>
                                    <TableCell colSpan={3} style={{ fontWeight: "bold" }}>
                                        {permission.feature}
                                    </TableCell>
                                </TableRow>
                                {["view", "create", "edit", "delete"].map((action) => (
                                    <TableRow key={action}>
                                        <TableCell>{action === "view" ? "Xem" : action === "create" ? "Thêm mới" : action === "edit" ? "Chỉnh sửa" : "Xóa"}</TableCell>
                                        {["Admin", "Employee"].map((role) => (
                                            <TableCell align="center" key={role}>
                                                <Checkbox
                                                    checked={permission.roles[role][action]}
                                                    onChange={() =>
                                                        handlePermissionChange(permission.feature, role, action)
                                                    }
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Nút cập nhật */}
            <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary">
                    Cập nhật
                </Button>
            </Box>
        </Box>
    );
};

export default DelegationControl;