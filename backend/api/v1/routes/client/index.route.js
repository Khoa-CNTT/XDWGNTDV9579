const userRoute = require("./user.route");
const homeRoute = require("./home.route");
const categoryRoute = require("./category.route");
const tourRoute = require("./tour.route");
const cartRoute = require("./cart.route");
const hotelRoute = require("./hotel.route");

module.exports = (app) => {
    const version = "/api/v1";

    app.use(version + '/', homeRoute);
    app.use(version + '/users', userRoute);
    app.use(version + '/categories', categoryRoute);
    app.use(version + '/tours', tourRoute);
    app.use(version + '/carts', cartRoute);
    app.use(version + '/hotels', hotelRoute);
}