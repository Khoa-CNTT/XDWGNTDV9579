import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";

const RightsGroupControl = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Dữ liệu mẫu
    const [rightsGroups, setRightsGroups] = useState([
        {
            id: 1,
            name: "Admin",
            description: "Quản lý web",
        },
        {
            id: 2,
            name: "Nhân viên",
            description: "Là nhân viên website",
        },
    ]);

    // State quản lý modal
    const [open, setOpen] = useState(false);
    const [newRightsGroup, setNewRightsGroup] = useState({
        id: "",
        name: "",
        description: "",
    });

    // Hàm mở/đóng modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Hàm xử lý thêm nhóm quyền mới
    const handleAdd = () => {
        if (!newRightsGroup.name || !newRightsGroup.description) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setRightsGroups([
            ...rightsGroups,
            { ...newRightsGroup, id: rightsGroups.length + 1 },
        ]);
        setNewRightsGroup({ id: "", name: "", description: "" });
        handleClose();
    };

    // Hàm xử lý sửa, xóa
    const handleEdit = (id) => {
        alert(`Sửa nhóm quyền có ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhóm quyền này?")) {
            setRightsGroups(rightsGroups.filter((group) => group.id !== id));
        }
    };

    // Cấu hình các cột trong DataGrid
    const columns = [
        { field: "id", headerName: "STT", flex: 0.3 },
        { field: "name", headerName: "Nhóm quyền", flex: 1 },
        { field: "description", headerName: "Mô tả ngắn", flex: 1 },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            renderCell: (params) => (
                <Box display="flex" gap={1}>
                    <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => alert(`Chi tiết nhóm quyền: ${params.row.name}`)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(params.row.id)}
                    >
                        Sửa
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Xóa
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            {/* Tiêu đề */}
            <Typography variant="h4" fontWeight="bold" mb={2}>
                Nhóm quyền
            </Typography>

            {/* Thanh công cụ */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                    placeholder="Nhập từ khóa"
                    variant="outlined"
                    size="small"
                    sx={{ width: "300px" }}
                />
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Thêm mới
                </Button>
            </Box>

            {/* Bảng dữ liệu */}
            <Box
                height="60vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                        color: colors.grey[100],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontWeight: "bold",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                    },
                }}
            >
                <DataGrid rows={rightsGroups} columns={columns} />
            </Box>

            {/* Modal thêm mới */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                        textAlign: "center",
                    }}
                >
                    Thêm mới nhóm quyền
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Tên nhóm quyền"
                        value={newRightsGroup.name}
                        onChange={(e) =>
                            setNewRightsGroup({ ...newRightsGroup, name: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mô tả ngắn"
                        value={newRightsGroup.description}
                        onChange={(e) =>
                            setNewRightsGroup({
                                ...newRightsGroup,
                                description: e.target.value,
                            })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="error"
                        variant="contained"
                        sx={{ fontWeight: "bold" }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleAdd}
                        color="success"
                        variant="contained"
                        sx={{ fontWeight: "bold" }}
                    >
                        Thêm mới
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RightsGroupControl;