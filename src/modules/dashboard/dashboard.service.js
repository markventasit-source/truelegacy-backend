const Activity = require("./activity.model");

exports.activity_overview = async (start_date, end_date) => {
  try {
    const result = await Activity.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        },
      },
      {
        $addFields: {
          weekday: {
            $switch: {
              branches: [
                { case: { $eq: [{ $dayOfWeek: "$date" }, 2] }, then: "Monday" },
                {
                  case: { $eq: [{ $dayOfWeek: "$date" }, 3] },
                  then: "Tuesday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$date" }, 4] },
                  then: "Wednesday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$date" }, 5] },
                  then: "Thursday",
                },
                { case: { $eq: [{ $dayOfWeek: "$date" }, 6] }, then: "Friday" },
                {
                  case: { $eq: [{ $dayOfWeek: "$date" }, 7] },
                  then: "Saturday",
                },
                { case: { $eq: [{ $dayOfWeek: "$date" }, 1] }, then: "Sunday" },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $group: {
          _id: "$weekday",
          admin_actions: { $sum: "$admin_actions" },
          user_logins: { $sum: "$user_logins" },
          documents_uploaded: { $sum: "$documents_uploaded" },
        },
      },
      {
        $project: {
          _id: 0,
          weekday: "$_id",
          admin_actions: 1,
          user_logins: 1,
          documents_uploaded: 1,
        },
      },
    ]);

    const orderedWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const output = {};

    orderedWeek.forEach((day) => {
      const found = result.find((item) => item.weekday === day);
      output[day] = found || {
        weekday: day,
        admin_actions: 0,
        user_logins: 0,
        documents_uploaded: 0,
      };
    });

    return output;
  } catch (error) {
    throw error;
  }
};
