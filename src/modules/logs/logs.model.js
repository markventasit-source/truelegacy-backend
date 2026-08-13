const mongoose = require("mongoose");

const logs_schema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    method: { type: String, trim: true },
    route: { type: String, trim: true },
    status_code: { type: Number },
    ip: { type: String, trim: true },
    user_agent: { type: String, trim: true },
    request_body: { type: Object },
    action: { type: String, trim: true },
    error_message: { type: String, trim: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

logs_schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Logs = mongoose.model("Logs", logs_schema);

module.exports = Logs;
