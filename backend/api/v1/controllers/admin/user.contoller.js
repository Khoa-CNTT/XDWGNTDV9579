const User = require("../../models/user.model");
const paginationHelper = require("../../helper/pagination");

// [GET]/api/v1/admin/users
module.exports.index = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("user_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách user"
        });
    } else {
        let find = { deleted: false };

        // Search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            find.$or = [
                { fullName: searchRegex }
            ];
        }

        if (req.query.status) {
            find.status = req.query.status;
        };

        // sort
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }

        // pagination
        const countRecords = await User.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 10
            },
            req.query,
            countRecords
        );
        // end pagination

        const accounts = await User.find(find).sort(sort).limit(objPagination.limitItems).skip(objPagination.skip).select("-password");

        res.json({
            users: accounts,
            totalPage: objPagination.totalPage
        });
    }
};

// [GET]/api/v1/admin/users/detail/:id
module.exports.detail = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("user_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem chi tiết user"
        });
    } else {
        const id = req.params.id;

        const data = await User.findOne({
            _id: id,
            deleted: false
        }).select("-password -token");

        return res.json({
            code: 200,
            message: "Lấy thông tin thành công!",
            data
        });
    }
};

// [PATCH]/api/v1/admin/users/changeStatus/:status/:id
module.exports.changeStatus = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("user_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền cập nhật trạng thái user"
        });
    } else {
        const status = req.params.status;
        const id = req.params.id;

        const data = await User.findOneAndUpdate(
            { _id: id, deleted: false },
            { status: status },
            { new: true }
        ).select("-password -token");

        return res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công!",
            data
        });
    }
};

// [DELETE]/api/v1/admin/users/delete/:id
module.exports.delete = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("user_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa user"
        });
    } else {
        const id = req.params.id;

        await User.deleteOne({
            _id: id
        });

        return res.json({
            code: 200,
            message: "xóa tài khoản thành công!",
        });
    }
};