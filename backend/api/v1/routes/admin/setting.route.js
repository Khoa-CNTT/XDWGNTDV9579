const express = require('express');
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/setting.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/setting.validate");
const upload = multer();

router.get('/general', controller.general);
router.patch('/general', upload.single('logo'),
    uploadCloud.uploadSingle,
    validate.settingValidate,
    controller.generalPatch);

module.exports = router;