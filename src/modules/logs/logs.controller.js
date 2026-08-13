const response_handler = require("../../helpers/response_handler");
const Logs = require("./logs.model");

function get_pure_IPv4(ip) {
  if (ip.startsWith("::ffff:")) {
    return ip.split("::ffff:")[1];
  }
  return ip;
}

exports.get_logs = async (req, res) => {
  try {
    const { page_no = 1, limit = 10, search } = req.query;
    const method = req.query["method[]"];

    const skip_count = limit * (page_no - 1);
    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      const numericSearch = Number(search);

      filter.$or = [
        { action: { $regex: regex } },
        { method: { $regex: regex } },
        ...(isNaN(numericSearch) ? [] : [{ status_code: numericSearch }]),
      ];
    }

    if (method) {
      filter.method = { $in: method };
    }

    const [data, total_count] = await Promise.all([
      Logs.find(filter)
        .populate("user", "name role")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip_count)
        .limit(limit),
      Logs.countDocuments(filter),
    ]);

    const mapped_data = data.map((item) => {
      return {
        _id: item._id,
        action: item.action,
        method: item.method,
        route: item.route,
        createdAt: item.createdAt,
        status_code: item.status_code,
        ip: get_pure_IPv4(item?.ip) || "Localhost",
        user_name: item?.user?.name || "Unknown User",
        user_type: item?.user?.role === "admin" ? "Admin" : "User",
      };
    });
    return response_handler(
      res,
      200,
      "Logs fetched successfully",
      mapped_data,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_log_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Log ID is required");
    }
    const log = await Logs.findById(id).populate("user", "name image role");
    if (!log) {
      return response_handler(res, 404, "Log not found");
    }
    const mapped_data = {
      ...log._doc,
      ip: get_pure_IPv4(log?.ip) || "Localhost",
      user_name: log?.user?.name || "Unknown User",
      user_type: log?.user?.role === "admin" ? "Admin" : "User",
    };
    return response_handler(res, 200, "Log fetched successfully", mapped_data);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
