const systemConfig = require("../../../../config/system");

const accountRoutes = require("./account.route");
const hotelRoutes = require("./hotel.route");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
    const version = "/api/v1";
    const PARTH_ADMIN = systemConfig.prefixAdmin;

    app.use(version + PARTH_ADMIN + "/accounts", accountRoutes);
    app.use(version + PARTH_ADMIN + "/hotels", authMiddleware.requireAuth, hotelRoutes);
}