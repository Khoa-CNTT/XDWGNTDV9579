const Order = require("../../models/order.model");
const paginationHelper = require("../../helper/pagination");
const Tour = require("../../models/tour.model");
const Hotel = require("../../models/hotel.model");
const Room = require("../../models/room.model");
const tourHelper = require("../../helper/tours");

// [GET]/api/v1/admin/orders
module.exports.index = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("order_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách đơn hàng"
        });
    } else {
        let find = {};

        // Search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            find.$or = [
                { orderCode: searchRegex }
            ];
        }

        if (req.query.startDate || req.query.endDate) {
            find.createdAt = {};
            if (req.query.startDate) {
                find.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                const end = new Date(req.query.endDate);
                end.setDate(end.getDate() + 1);
                find.createdAt.$lt = end;
            }
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
        const countRecords = await Order.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 10
            },
            req.query,
            countRecords
        );
        // end pagination

        const orders = await Order.find(find).sort(sort).limit(objPagination.limitItems).skip(objPagination.skip);

        res.json({
            orders: orders,
            totalPage: objPagination.totalPage
        });
    }
};

// [PATCH]/api/v1/admin/orders/changeStatus/:status/:id
module.exports.changeStatus = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("order_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền cập nhật trạng thái đơn hàng"
        });
    } else {
        try {
            const status = req.params.status;
            const id = req.params.id;

            await Order.updateOne({
                _id: id
            }, {
                status: status
            });

            res.json({
                code: 200,
                message: "Cập nhật trạng thái thành công!"
            });
        } catch (error) {
            res.json({
                code: 500,
                message: "Có lỗi " + error
            });
        }
    }
};

// [GET]/api/v1/admin/orders/detail/:id
module.exports.detail = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("order_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem chi tiết đơn hàng"
        });
    } else {
        const id = req.params.id;
        const order = await Order.findOne({
            _id: id
        });
        const tours = [];
        for (const item of order.tours) {
            const tourInfo = await Tour.findOne({
                _id: item.tour_id
            });
            tours.push({
                tourInfo: tourInfo,
                quantity: item.quantity,
                priceNew: tourHelper.priceNewTour(tourInfo)
            });
        }

        const hotels = [];
        for (const item of order.hotels) {
            const hotelInfo = await Hotel.findOne({
                _id: item.hotel_id
            });
            const rooms = [];
            for (const room of item.rooms) {
                const roomInfo = await Room.findOne({
                    _id: room.room_id
                });
                rooms.push({
                    roomInfo: roomInfo,
                    quantity: room.quantity,
                    price: room.price
                });
            }
            hotels.push({
                hotelInfo: hotelInfo,
                rooms: rooms
            });
        } res.json({
            code: 200,
            message: "Lấy thông tin đơn hàng thành công!",
            data: {
                order: order,
                tours: tours,
                hotels: hotels
            }
        });
    }
};

// [DELETE]/api/v1/admin/orders/delete/:id
module.exports.delete = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("order_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa đơn hàng"
        });
    } else {
        try {
            const id = req.params.id;
            await Order.deleteOne({
                _id: id
            });

            res.json({
                code: 200,
                message: "Xóa đơn hàng thành công!"
            });
        } catch (error) {
            res.json({
                code: 500,
                message: "Lỗi" + error
            });
        }
    }
};