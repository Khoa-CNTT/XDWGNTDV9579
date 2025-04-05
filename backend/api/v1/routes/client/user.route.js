const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

const authMiddleware = require("../../middlewares/client/auth.middleware");
const validate = require("../../validates/client/user.validate");

router.post('/register', validate.registerPost, controller.register);
router.post('/login', validate.loginPost, controller.login);
router.post('/password/forgot', validate.forgotPassword, controller.forgotPassword);
router.post('/password/otp', controller.otpPassword);
router.post('/password/reset', validate.resetPasswordPost, controller.resetPassword);
router.get('/detail', authMiddleware.requireAuth, controller.detail);
router.patch('/edit', authMiddleware.requireAuth, controller.edit);
router.get('/logout', controller.logout);

module.exports = router;