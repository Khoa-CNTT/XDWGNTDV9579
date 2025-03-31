const userRoute = require("./user.route");

module.exports = (app) => {
    const version = "/api/v1";

    app.use(version + '/users', userRoute);
}