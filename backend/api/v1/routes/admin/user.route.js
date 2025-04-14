const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/user.contoller");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.patch("/changeStatus/:status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.delete);

module.exports = router;