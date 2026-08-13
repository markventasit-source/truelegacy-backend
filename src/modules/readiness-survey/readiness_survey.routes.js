const express = require("express");
const readiness_survey_controller = require("./readiness_survey.controller");
const log_activity = require("../../middlewares/log_activity");

const router = express.Router();

router.get("/questions", readiness_survey_controller.questions);

router.get(
  "/download",
  log_activity("download_readiness_survey_pdf"),
  readiness_survey_controller.download_pdf
);

router.post(
  "/submit",
  log_activity("submit_readiness_survey"),
  readiness_survey_controller.submit
);

module.exports = router;
