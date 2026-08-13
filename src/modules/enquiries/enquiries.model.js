const mongoose = require("mongoose");

const enquiries_schema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, trim: true },
    source: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
      enum: ["contact", "service", "call"],
      default: "contact",
    },
    date: { type: Date },
    time: { type: String, trim: true },
    crm_id: { type: String, trim: true },
    crm_sync_status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    crm_error: { type: String },
    crm_last_attempt_at: { type: Date },
    status: {
      type: String,
      trim: true,
      enum: ["progress", "resolved"],
      default: "progress",
    },
  },
  { timestamps: true }
);

const Enquiries = mongoose.model("Enquiries", enquiries_schema);

module.exports = Enquiries;
