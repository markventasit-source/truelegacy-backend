const express = require("express");
const pages_controller = require("./pages.controller");
const log_activity = require("../../middlewares/log_activity");
const auth_verify = require("../../middlewares/auth_verify");
const router = express.Router();

router.get("/blogs", log_activity("view_blogs"), pages_controller.get_blogs);
router.get(
  "/blog/:id",
  log_activity("view_blog"),
  pages_controller.get_blog_by_id
);

router.use(auth_verify);
router.post("/blog", log_activity("create_blog"), pages_controller.create_blog);
router.put(
  "/blog/:id",
  log_activity("update_blog"),
  pages_controller.update_blog
);
router.delete(
  "/blog/:id",
  log_activity("delete_blog"),
  pages_controller.delete_blog
);

module.exports = router;
