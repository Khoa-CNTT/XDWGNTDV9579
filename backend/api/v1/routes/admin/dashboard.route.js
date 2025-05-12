const express = require('express');
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/dashboard.controller");


router.get("/", controller.dashboard);

module.exports = router;