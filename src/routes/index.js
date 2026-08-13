const express = require("express");
const router = express.Router();
const auth_route = require("../modules/auth/auth.routes");
const user_route = require("../modules/user/user.routes");
const logs_route = require("../modules/logs/logs.routes");
const notification_route = require("../modules/notification/notification.routes");
const pages_route = require("../modules/pages/pages.routes");
const succession_route = require("../modules/succession/succession.routes");
const enquiries_route = require("../modules/enquiries/enquiries.routes");
const readiness_survey_route = require("../modules/readiness-survey/readiness_survey.routes");
const upload_route = require("../modules/upload/upload.routes");
const dashboard_route = require("../modules/dashboard/dashboard.routes");
const auth_verify = require("../middlewares/auth_verify");

router.use("/auth", auth_route);
router.use("/readiness-survey", readiness_survey_route);
router.use("/succession", succession_route);
router.use("/pages", pages_route);
router.use("/enquiries", enquiries_route);
router.use(auth_verify);
router.use("/upload", upload_route);
router.use("/user", user_route);
router.use("/logs", logs_route);
router.use("/notification", notification_route);
router.use("/dashboard", dashboard_route);

module.exports = router;
