const express = require("express");
const multer = require("multer");
const upload_controller = require("./upload.controller");
const log_activity = require("../../middlewares/log_activity");
const response_handler = require("../../helpers/response_handler");
const router = express.Router();

//* Configure multer with file size limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return response_handler(
            res,
            400,
            "File size too large. Maximum allowed size is 10MB"
          );
        }
        if (err.code === "LIMIT_FIELD_VALUE") {
          return response_handler(res, 400, "Field value too large");
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return response_handler(res, 400, "Unexpected field name");
        }
        return response_handler(res, 400, `Upload error: ${err.message}`);
      } else if (err) {
        return response_handler(res, 400, err.message);
      }
      next();
    });
  },
  log_activity("create_upload"),
  upload_controller.create_upload
);

module.exports = router;
