const express = require("express");
const auth_controller = require("./auth.controller");
const log_activity = require("../../middlewares/log_activity");
const auth_verify = require("../../middlewares/auth_verify");
const router = express.Router();

router.post("/login", log_activity("login"), auth_controller.login);
router.use(auth_verify);
router.post(
  "/user-signup",
  log_activity("user_signup"),
  auth_controller.user_signup
);

module.exports = router;
