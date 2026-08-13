const mongoose = require("mongoose");

const notifications_schema = mongoose.Schema(
  {
    type: [
      {
        type: String,
        trim: true,
        enum: ["email", "in-app"],
      },
    ],
    subject: { type: String, trim: true },
    content: { type: String, trim: true },
    image: { type: String, trim: true },
    link: { type: String, trim: true },
    users: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        read: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      trim: true,
      enum: ["drafted", "scheduled", "sended", "failed"],
      default: "drafted",
    },
    send_date: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

notifications_schema.index({
  subject: "text",
  content: "text",
});

const Notifications = mongoose.model("Notifications", notifications_schema);

module.exports = Notifications;
