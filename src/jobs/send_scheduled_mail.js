const cron = require("node-cron");
const moment = require("moment-timezone");
const Notifications = require("../modules/notification/notification.model");
const {
  handle_email_notification,
} = require("../modules/notification/notification.service");

cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      const cutoff_date = moment
        .tz("Asia/Kolkata")
        .startOf("day")
        .add(1, "day")
        .toDate();
      const scheduled_mail = await Notifications.find({
        status: "scheduled",
        send_date: { $lt: cutoff_date },
      });
      console.log("Scheduled mail count", scheduled_mail.length);
      if (scheduled_mail.length > 0) {
        await Promise.all(
          scheduled_mail.map(async (mail) => {
            mail.status = "sended";
            await mail.save();

            const users = mail.users.map((user) => user.user);
            const notification_payload = {
              subject: mail.subject,
              content: mail.content,
              image: mail.image,
              link: mail.link,
            };
            handle_email_notification(users, notification_payload);
          })
        );
        console.log(`Scheduled mail sent successfully`);
      }
    } catch (error) {
      console.error("Error updating events", error);
    }
  },
  { timezone: "Asia/Kolkata" }
);
