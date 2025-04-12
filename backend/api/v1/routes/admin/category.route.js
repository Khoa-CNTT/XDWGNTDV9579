const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/category.controller");
const validate = require("../../validates/admin/category.validate");

router.get('/', controller.index);
router.post('/create', validate.categoryValidate, controller.create);
router.patch('/changeStatus/:status/:id', controller.changeStatus);
router.patch('/edit/:id', controller.edit);
router.get('/detail/:id', controller.detail);
router.delete('/delete/:id', controller.delete);

module.exports = router;