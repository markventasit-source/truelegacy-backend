const express = require("express");
const enquiries_controller = require("./enquiries.controller");
const log_activity = require("../../middlewares/log_activity");
const auth_verify = require("../../middlewares/auth_verify");
const router = express.Router();

router.post(
  "/",
  log_activity("create_enquiry"),
  enquiries_controller.create_enquiry
);

router.use(auth_verify);

router.get(
  "/",
  log_activity("view_enquiries"),
  enquiries_controller.get_enquiries
);

router
  .route("/:id")
  .get(log_activity("view_enquiry"), enquiries_controller.get_enquiry_by_id)
  .put(log_activity("update_enquiry"), enquiries_controller.update_enquiry)
  .delete(log_activity("delete_enquiry"), enquiries_controller.delete_enquiry);

module.exports = router;
