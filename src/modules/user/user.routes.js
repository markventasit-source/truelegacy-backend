const express = require("express");
const user_controller = require("./user.controller");
const log_activity = require("../../middlewares/log_activity");
const router = express.Router();

router.route("/").get(log_activity("view_users"), user_controller.get_users);

router.get(
  "/profile",
  log_activity("view_profile"),
  user_controller.get_profile
);

router.post(
  "/bulk-delete",
  log_activity("bulk_delete"),
  user_controller.bulk_delete
);

router
  .route("/:id")
  .get(log_activity("view_user"), user_controller.get_user_by_id)
  .put(log_activity("update_user"), user_controller.update_user)
  .delete(log_activity("delete_user"), user_controller.delete_user);

module.exports = router;
