const userRoute = require("./user.route");
const homeRoute = require("./home.route");

module.exports = (app) => {
    const version = "/api/v1";

    app.use(version + '/', homeRoute);
    app.use(version + '/users', userRoute);
}