const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

const validate = require("../../validates/client/user.validate");

router.post('/register', validate.registerPost, controller.register);
router.post('/login', validate.loginPost, controller.login);

module.exports = router;