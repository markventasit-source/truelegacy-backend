const Counter = require("../modules/settings/counter.model");

exports.generate_counter = async (counter_name) => {
  const field_name = `${counter_name}_sequence_value`;
  const counter = await Counter.findOneAndUpdate(
    { _id: "sequence_counters" },
    { $inc: { [field_name]: 1 } },
    { new: true, upsert: true }
  );
  return counter[field_name];
};
