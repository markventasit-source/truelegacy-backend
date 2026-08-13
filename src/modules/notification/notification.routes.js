const express = require("express");
const notification_controller = require("./notification.controller");
const log_activity = require("../../middlewares/log_activity");
const router = express.Router();

router
  .route("/")
  .get(
    log_activity("view_notifications"),
    notification_controller.get_notifications
  )
  .post(
    log_activity("create_notification"),
    notification_controller.create_notification
  );

router.post(
  "/send/:id",
  log_activity("send_notification"),
  notification_controller.send_notification
);

router
  .route("/:id")
  .get(
    log_activity("view_notification"),
    notification_controller.get_notification_by_id
  )
  .put(
    log_activity("update_notification"),
    notification_controller.update_notification
  )
  .delete(
    log_activity("delete_notification"),
    notification_controller.delete_notification
  );

module.exports = router;
