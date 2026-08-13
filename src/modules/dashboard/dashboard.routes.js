const express = require("express");
const dashboard_controller = require("./dashboard.controller");
const log_activity = require("../../middlewares/log_activity");
const router = express.Router();

router.get(
  "/",
  log_activity("view_dashboard"),
  dashboard_controller.get_dashboard
);

module.exports = router;
