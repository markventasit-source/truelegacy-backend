const response_handler = require("../../helpers/response_handler");
const Settings = require("./settings.model");

exports.get_version = async (req, res) => {
  try {
    const settings = await Settings.findOne().select("application");
    return response_handler(
      res,
      200,
      "Settings fetched successfully",
      settings
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
