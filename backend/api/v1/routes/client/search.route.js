const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/search.controller");

router.get('/tours', controller.result);
router.get('/hotels', controller.result);

module.exports = router;