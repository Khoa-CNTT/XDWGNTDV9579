const Tour = require("../../models/tour.model");

// [GET]/api/v1/
module.exports.index = async (req, res) => {
    const topSallers = await Tour.find({
        status: "active",
        deleted: false
    }).sort({ sold: "desc" }).limit(5);
    const newTours = await Tour.find({
        status: "active",
        deleted: false
    }).sort({ createdAt: -1 }).limit(5);
    res.json({
        topSallers: topSallers,
        newTours: newTours
    })
};