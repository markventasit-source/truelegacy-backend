const mongoose = require("mongoose");

const counter_schema = mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    driver_sequence_value: { type: Number, default: 0 },
    rider_sequence_value: { type: Number, default: 0 },
    invoice_sequence_value: { type: Number, default: 0 },
    receipt_sequence_value: { type: Number, default: 0 },
    transaction_sequence_value: { type: Number, default: 0 },
    promocode_sequence_value: { type: Number, default: 0 },
    vehicle_sequence_value: { type: Number, default: 0 },
    ride_sequence_value: { type: Number, default: 0 },
    report_sequence_value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Counter = mongoose.model("Counter", counter_schema);

module.exports = Counter;
