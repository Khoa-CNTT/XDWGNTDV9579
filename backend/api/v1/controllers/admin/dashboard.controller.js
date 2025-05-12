const Account = require("../../models/account.model");
const Category = require("../../models/category.model");
const Hotel = require("../../models/hotel.model");
const Order = require("../../models/order.model");
const Review = require("../../models/hotelReview.model");
const Role = require("../../models/role.model");
const Tour = require("../../models/tour.model");
const User = require("../../models/user.model");
const Voucher = require("../../models/voucher.model");

// [GET]/api/v1/admin/dashboard
module.exports.dashboard = async (req, res) => {
    const statistic = {
        category: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        tour: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        hotel: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        order: {
            total: 0,
            pending: 0,
            paid: 0,
            cancel: 0
        },
        review: {
            total: 0,
            average: 0,
            five: 0,
            four: 0,
            three: 0,
            two: 0,
            one: 0
        },
        role: {
            total: 0
        },
        voucher: {
            total: 0,
            valid: 0,
            expire: 0
        },
        account: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        user: {
            total: 0,
            active: 0,
            inactive: 0,
        },
    };

    statistic.category.total = await Category.countDocuments({ deleted: false });
    statistic.category.active = await Category.countDocuments({ status: "active", deleted: false });
    statistic.category.inactive = await Category.countDocuments({ status: "inactive", deleted: false });

    statistic.tour.total = await Tour.countDocuments({ deleted: false });
    statistic.tour.active = await Tour.countDocuments({ status: "active", deleted: false });
    statistic.tour.inactive = await Tour.countDocuments({ status: "inactive", deleted: false });

    statistic.hotel.total = await Hotel.countDocuments({ deleted: false });
    statistic.hotel.active = await Hotel.countDocuments({ status: "active", deleted: false });
    statistic.hotel.inactive = await Hotel.countDocuments({ status: "inactive", deleted: false });

    statistic.review.total = await Review.countDocuments({});
    statistic.review.five = await Review.countDocuments({ rating: "5" });
    statistic.review.four = await Review.countDocuments({ rating: "4" });
    statistic.review.three = await Review.countDocuments({ rating: "3" });
    statistic.review.two = await Review.countDocuments({ rating: "2" });
    statistic.review.one = await Review.countDocuments({ rating: "1" });
    statistic.review.average = (5 * statistic.review.five + 4 * statistic.review.four + 3 * statistic.review.three + 2 * statistic.review.two + 1 * statistic.review.one) / statistic.review.total

    statistic.role.total = await Role.countDocuments({});

    statistic.voucher.total = await Voucher.countDocuments({ deleted: false });
    statistic.voucher.valid = await Voucher.countDocuments({ expireAt: { $gt: new Date(Date.now()) } });
    statistic.voucher.expire = await Voucher.countDocuments({ endDate: { $lt: new Date(Date.now()) } });

    statistic.order.total = await Order.countDocuments({});
    statistic.order.pending = await Order.countDocuments({ status: "pending" });
    statistic.order.paid = await Order.countDocuments({ status: "paid" });
    statistic.order.cancel = await Order.countDocuments({ status: "cancelled" });

    statistic.account.total = await Account.countDocuments({ deleted: false });
    statistic.account.active = await Account.countDocuments({ status: "active" });
    statistic.account.inactive = await Account.countDocuments({ status: "inactive" });

    statistic.user.total = await User.countDocuments({ deleted: false });
    statistic.user.active = await User.countDocuments({ status: "active" });
    statistic.user.inactive = await User.countDocuments({ status: "inactive" });

    res.json({
        code: 200,
        statistic
    })
}