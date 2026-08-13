const express = require("express");
const settings_controller = require("./settings.controller");
const router = express.Router();

router.route("/").get(settings_controller.get_version);

module.exports = router;
