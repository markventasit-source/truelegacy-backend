const mongoose = require("mongoose");
const { GENDER, RELIGION } = require("../../config/constants");

const children_schema = new mongoose.Schema({
  sons: { type: Number, default: 0 },
  daughters: { type: Number, default: 0 },
  deceased_sons: { type: Number, default: 0 },
  deceased_daughters: { type: Number, default: 0 },
});

const parents_schema = new mongoose.Schema({
  mother_alive: { type: Boolean, default: false },
  father_alive: { type: Boolean, default: false },
});

const siblings_schema = new mongoose.Schema({
  brothers: { type: Number, default: 0 },
  sisters: { type: Number, default: 0 },
});

const computed_share_schema = new mongoose.Schema({
  heir_type: {
    type: String,
    enum: [
      "wife",
      "husband",
      "son",
      "daughter",
      "husbands_mother",
      "husbands_father",
      "wife_mother",
      "wife_father",
      "husbands_brother",
      "husbands_sister",
      "wife_brother",
      "wife_sister",
      "will_paper",
      "residuary_heirs"
    ],
  },
  share_percent: { type: Number },
  class: { type: String },
  note: { type: String },
});

const family_tree_schema = new mongoose.Schema({
  tree_data: Object,
  last_updated: { type: Date, default: Date.now },
});

const survey_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deceased: {
      name: { type: String, default: "" },
      gender: { type: String, enum: Object.values(GENDER), required: true },
      religion: { type: String, enum: Object.values(RELIGION), required: true },
      married: { type: Boolean, required: true },
      inter_caste: { type: Boolean, default: false },
      spouse_alive: { type: Boolean, default: false },
      marital_status: {
        type: String,
        enum: ["married", "divorced", "unmarried", "widowed"],
        default: "unmarried"
      },
      children: children_schema,
      parents: parents_schema,
      siblings: siblings_schema,
    },
    computed_shares: [computed_share_schema],
    matched_case_id: { type: String, trim: true },
    matched_case_description: { type: String, trim: true },
    total_percent: { type: Number, default: 0 },
    family_tree: family_tree_schema,
  },
  {
    timestamps: true,
  }
);

survey_schema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("Survey", survey_schema);
