const systemConfig = require("../../../../config/system");

const accountRoutes = require("./account.route");
const hotelRoutes = require("./hotel.route");
const categoryRoutes = require("./category.route");
const tourRoutes = require("./tour.route");
const userRoutes = require("./user.route");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
    const version = "/api/v1";
    const PARTH_ADMIN = systemConfig.prefixAdmin;

    app.use(version + PARTH_ADMIN + "/accounts", accountRoutes);
    app.use(version + PARTH_ADMIN + "/hotels", authMiddleware.requireAuth, hotelRoutes);
    app.use(version + PARTH_ADMIN + "/categories", authMiddleware.requireAuth, categoryRoutes);
    app.use(version + PARTH_ADMIN + "/tours", authMiddleware.requireAuth, tourRoutes);
    app.use(version + PARTH_ADMIN + "/users", authMiddleware.requireAuth, userRoutes);
}