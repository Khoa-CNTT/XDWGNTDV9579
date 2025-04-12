const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/account.controller");
const validate = require("../../validates/admin/account.validate");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get("/", authMiddleware.requireAuth, controller.index);
router.post("/create", authMiddleware.requireAuth, validate.createAccount, controller.createPost);
router.post("/login", validate.loginPost, controller.login);
router.get("/detail/:id", authMiddleware.requireAuth, controller.detail);
router.patch("/edit/:id", authMiddleware.requireAuth, controller.edit);
router.patch("/changeStatus/:status/:id", authMiddleware.requireAuth, controller.changeStatus);
router.delete("/delete/:id", authMiddleware.requireAuth, controller.delete);

module.exports = router;