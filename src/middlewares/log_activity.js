const Activity = require("../modules/dashboard/activity.model");
const Logs = require("../modules/logs/logs.model");

const log_activity = (action = "") => {
  return async (req, res, next) => {
    if (req.user_id !== "6929a3c250ac8ff04e687751") {
      res.on("close", async () => {
        try {
          const log = new Logs({
            user: req.user_id || null,
            method: req.method,
            route: req.originalUrl,
            status_code: res.statusCode,
            ip:
              req.headers["x-forwarded-for"] ||
              req.ip ||
              req.connection.remoteAddress,
            user_agent: req.headers["user-agent"],
            action: action,
            request_body: req.body,
            error_message: res.locals?.error_message || "",
          });
          const today = new Date().setHours(0, 0, 0, 0);
          let activity = await Activity.findOne({ date: today });
          if (!activity) {
            activity = await Activity.create({
              date: today,
              admin_actions: 0,
              user_logins: 0,
              documents_uploaded: 0,
            });
          }
          if (req.user && req.user.role === "admin" && req.method !== "GET") {
            activity.admin_actions += 1;
          }
          if (
            req.originalUrl === "/api/v1/auth/login" &&
            req.method === "POST"
          ) {
            activity.user_logins += 1;
          }
          await Promise.all([log.save(), activity.save()]);
        } catch (err) {
          console.log(`Error logging activity: ${err.message}`);
        }
      });
    }
    next();
  };
};

module.exports = log_activity;
