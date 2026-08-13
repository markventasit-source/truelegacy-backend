const moment = require("moment-timezone");
const response_handler = require("../../helpers/response_handler");
const User = require("../user/user.model");
const Enquiries = require("../enquiries/enquiries.model");
const Notifications = require("../notification/notification.model");
const { activity_overview } = require("./dashboard.service");
//TODO: Documents upload count should be added in second phase

exports.get_dashboard = async (req, res) => {
  try {
    let { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      start_date = moment().startOf("month").toDate();
      end_date = moment().endOf("month").toDate();
    } else {
      start_date = moment(start_date).startOf("day").toDate();
      end_date = moment(end_date).endOf("day").toDate();
    }
    const guest_start_date = moment().startOf("month").toDate();
    const guest_end_date = moment().endOf("month").toDate();
    const today_start = moment().startOf("day").toDate();
    const today_end = moment().endOf("day").toDate();
    const [
      total_members,
      total_guest,
      total_enquiries,
      total_documents,
      total_notifications,
      sucess_notifications,
      scheduled_notifications,
      failed_notifications,
      progress_enquiries,
      resolved_enquiries,
      activity_overview_chart,
      active_users,
      todays_enquiries,
    ] = await Promise.all([
      User.countDocuments({ role: "member" }),
      User.countDocuments({
        role: "guest",
        createdAt: { $gte: guest_start_date, $lte: guest_end_date },
      }),
      Enquiries.countDocuments(),
      0,
      Notifications.countDocuments(),
      Notifications.countDocuments({ status: "sended" }),
      Notifications.countDocuments({ status: "scheduled" }),
      Notifications.countDocuments({ status: "failed" }),
      Enquiries.countDocuments({ status: "progress" }),
      Enquiries.countDocuments({ status: "resolved" }),
      activity_overview(start_date, end_date),
      User.countDocuments({ status: "active", role: "member" }),
      Enquiries.countDocuments({
        createdAt: { $gte: today_start, $lte: today_end },
      }),
    ]);
    const final_data = {
      total_members,
      active_users,
      total_guest,
      total_enquiries,
      todays_enquiries,
      total_documents,
      total_notifications,
      sucess_notifications,
      scheduled_notifications,
      failed_notifications,
      activity_overview_chart,
      enquiries: {
        progress: progress_enquiries,
        resolved: resolved_enquiries,
      },
    };
    return response_handler(
      res,
      200,
      "Dashboard fetched successfully",
      final_data
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
