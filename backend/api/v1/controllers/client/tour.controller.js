const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");

// [GET]/tours/:slugCategory
module.exports.index = async (req, res) => {
    const slugCategory = req.params.slugCategory
    const category = await Category.findOne({
        slug: slugCategory,
        deleted: false
    });
    const tours = await Tour.find({
        category_id: category.id,
        deleted: false
    });

    res.json(tours);
}

// [GET]/tours/detail/:slugTour
module.exports.detail = async (req, res) => {
    const slugTour = req.params.slugTour
    const tourDetail = await Tour.findOne({
        slug: slugTour,
        deleted: false,
        status: "active"
    });
    const tourDetailObj = tourDetail.toObject();
    tourDetailObj.price_special = tourDetail.price * (1 - tourDetail.discount / 100);
    res.json(tourDetailObj);
}