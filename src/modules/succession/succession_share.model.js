const mongoose = require("mongoose");

const succession_share_schema = new mongoose.Schema(
  {
    survey_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    pdf_url: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

succession_share_schema.index({ survey_id: 1 });
succession_share_schema.index({ user_id: 1 });
succession_share_schema.index({ createdAt: -1 });

module.exports = mongoose.model("SuccessionShare", succession_share_schema);