const mongoose = require("mongoose");

const activity_schema = mongoose.Schema(
  {
    date: {
      type: Date,
    },
    admin_actions: {
      type: Number,
      default: 0,
    },
    user_logins: {
      type: Number,
      default: 0,
    },
    documents_uploaded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activity_schema);

module.exports = Activity;
