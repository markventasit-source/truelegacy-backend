const mongoose = require("mongoose");

const settings_schema = mongoose.Schema(
  {
    application: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settings_schema);

module.exports = Settings;
