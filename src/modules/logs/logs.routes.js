const express = require("express");
const logs_controller = require("./logs.controller");
const log_activity = require("../../middlewares/log_activity");
const router = express.Router();

router.get("/", log_activity("view_logs"), logs_controller.get_logs);

router.get("/:id", log_activity("view_log"), logs_controller.get_log_by_id);

module.exports = router;
