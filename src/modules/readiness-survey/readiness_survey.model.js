const mongoose = require("mongoose");

const readiness_survey_response_schema = new mongoose.Schema(
  {
    answers: {
      age_category: { type: String,  trim: true },
      net_worth_category: { type: String,  trim: true },
      asset_control: { type: String,  trim: true },
      nominee_awareness: { type: String, trim: true },
      overseas_awareness: { type: String, trim: true },
      family_transparency: { type: String, trim: true },
      has_will: { type: String,  trim: true },
      has_trust: { type: String,  trim: true },
      has_executor: { type: String,  trim: true },
    },
    total_score: { type: Number},
    ranking: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Limited"],
    },
    interpretation_text: { type: String, trim: true },
  },
  {
  timestamps: true,
}
);

readiness_survey_response_schema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model(
  "ReadinessSurveyResponse",
  readiness_survey_response_schema
);
