const response_handler = require("../../helpers/response_handler");
const { delete_file_from_s3 } = require("../../utils/delete_file_from_s3");
const User = require("../user/user.model");
const Notification = require("./notification.model");
const {
  handle_both_notification,
  handle_in_app_notification,
  handle_email_notification,
} = require("./notification.service");
const validation = require("./notification.validation");

exports.get_notifications = async (req, res) => {
  try {
    const { page_no = 1, limit = 10, search } = req.query;
    const skip_count = limit * (page_no - 1);
    const filter = {};

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const [notifications, total_count] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip_count)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    return response_handler(
      res,
      200,
      "Notifications fetched successfully",
      notifications,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.create_notification = async (req, res) => {
  try {
    const { error, value } = validation.create_notification.validate(req.body);
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }

    const { role } = value;

    const users = await User.find({ role, status: "active" });
    value.users = users.map((user) => ({
      user: user._id,
      read: false,
    }));

    const notification = await Notification.create(value);
    return response_handler(
      res,
      200,
      "Notification created successfully",
      notification
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_notification_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Notification ID is required");
    }
    const notification = await Notification.findById(id);
    return response_handler(
      res,
      200,
      "Notification fetched successfully",
      notification
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_notification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Notification ID is required");
    }

    const existing_notification = await Notification.findById(id);
    if (!existing_notification) {
      return response_handler(res, 400, "Notification not found");
    }
    if (existing_notification.media) {
      await delete_file_from_s3([existing_notification.media]);
    }

    const notification = await Notification.findByIdAndDelete(id);
    return response_handler(
      res,
      200,
      "Notification deleted successfully",
      notification
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.send_notification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Notification ID is required");
    }
    const notification = await Notification.findById(id);
    if (!notification) {
      return response_handler(res, 400, "Notification not found");
    }
    const { type } = notification;
    const users = notification.users.map((user) => user.user);
    let response;
    if (type.includes("in-app") && type.includes("email")) {
      response = await handle_both_notification(users, notification);
    } else if (type.includes("in-app")) {
      response = await handle_in_app_notification(users, notification);
    } else if (type.includes("email")) {
      response = await handle_email_notification(users, notification);
    }
    if (response && response.success) {
      notification.status = "sended";
    } else {
      notification.status = "failed";
    }
    await notification.save();
    return response_handler(res, 200, "Notification sent successfully");
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_notification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Notification ID is required");
    }

    const { error, value } = validation.update_notification.validate(req.body);
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }

    const existing_notification = await Notification.findById(id);
    if (!existing_notification) {
      return response_handler(res, 400, "Notification not found");
    }

    const existing_image = existing_notification.image;
    const new_image = value.image;
    if (existing_image && new_image && existing_image !== new_image) {
      await delete_file_from_s3([existing_image]);
    }

    if (value.role !== existing_notification.role) {
      const users = await User.find({ role: value.role, status: "active" });
      value.users = users.map((user) => ({
        user,
      }));
    }

    const updated_notification = await Notification.findByIdAndUpdate(
      id,
      value,
      { new: true }
    );
    return response_handler(
      res,
      200,
      "Notification updated successfully",
      updated_notification
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
