const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");
const generate = require("../../helper/generate");
const paginationHelper = require("../../helper/pagination");
const tourHelper = require("../../helper/tours");

// [GET]/api/v1/admin/tours
module.exports.index = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách tour"
        });
    } else {
        let find = { deleted: false };

        if (req.query.status) {
            find.status = req.query.status;
        };

        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }

        // pagination
        const countRecords = await Tour.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 5
            },
            req.query,
            countRecords
        );
        // end pagination

        const tours = await Tour.find().sort(sort).limit(objPagination.limitItems).skip(objPagination.skip);
        let toursObject = tours.map(item => item.toObject());

        toursObject.forEach(item => {
            item.price_special = tourHelper.priceNewTour(item);
        });
        res.json(toursObject);
    }
};

// [POST]/api/v1/admin/tours/create
module.exports.createPost = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_create")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền tạo mới tour"
        });
    } else {
        try {
            const countTour = await Tour.countDocuments();
            const code = generate.generateTourCode(countTour + 1);

            const tour = new Tour({
                title: req.body.title,
                code: code,
                price: parseInt(req.body.price),
                discount: parseInt(req.body.discount),
                stock: parseInt(req.body.stock),
                category_id: req.body.category_id,
                timeStart: req.body.timeStart,
                status: req.body.status,
                images: req.body.images,
                information: req.body.information,
                schedule: req.body.schedule,
            });
            const data = await tour.save();
            res.json({
                code: 200,
                message: "Tạo thành công",
                data: data
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!" + error
            });
        }
    }
};

// [PATCH]/api/v1/admin/tours/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa trạng thái tour"
        });
    } else {
        try {
            const id = req.params.id;
            const status = req.params.status;
            await Tour.updateOne({
                _id: id
            }, {
                status: status
            });
            res.json({
                code: 200,
                message: "Cập nhật trạng thái thành công"
            })
        } catch (error) {
            res.json({
                code: 404,
                message: "Lỗi! " + error
            })
        }
    }
};

// [DELETE]/api/v1/admin/delete/:id
module.exports.deleteTour = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa tour"
        });
    } else {
        try {
            const id = req.params.id;

            await Tour.deleteOne({
                _id: id
            });

            res.json({
                code: 200,
                message: "Xóa tour thành công!"
            })
        } catch (error) {
            res.json({
                code: 404,
                message: "Lỗi! " + error
            })
        }
    }
};

// [GET]/api/v1/admin/detail/:id
module.exports.detail = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem chi tiết tour"
        });
    } else {
        const id = req.params.id;

        const tour = await Tour.findOne({
            _id: id,
            deleted: false,
        });

        const category = await Category.findOne({
            _id: tour.category_id,
            deleted: false
        });
        res.json({
            tour: tour,
            category: category
        });
    }
};

// [PATCH]/api/v1/admin/tours/edit/:id
module.exports.editPatch = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa tour"
        });
    } else {
        try {
            const id = req.params.id;
            if (req.body.price) req.body.price = parseInt(req.body.price);
            if (req.body.discount) req.body.discount = parseInt(req.body.discount);
            if (req.body.stock) req.body.stock = parseInt(req.body.stock);
            if (req.body.position) req.body.position = parseInt(req.body.position);

            const data = await Tour.updateOne({
                _id: id
            }, {
                ...req.body
            });


            res.json({
                code: 200,
                message: "Cập nhật tour thành công"
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Cập nhật tour thất bại" + error
            });
        }
    }
};

// [PATCH]/api/v1/admin/tours/change-stock/:stock/:id
module.exports.stock = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("tour_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa trạng thái tour"
        });
    } else {
        try {
            const id = req.params.id;
            const stock = parseInt(req.params.stock);
            const data = await Tour.findOneAndUpdate({
                _id: id
            }, {
                stock: stock
            }, { new: true });
            res.json({
                code: 200,
                message: "Cập nhật số lượng thành công",
                data: data
            });
        } catch (error) {
            res.json({
                code: 500,
                message: "Lỗi! " + error
            })
        }
    }
};