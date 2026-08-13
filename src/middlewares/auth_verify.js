const jwt = require("jsonwebtoken");
const response_handler = require("../helpers/response_handler");
const User = require("../modules/user/user.model");
const auth_verify = async (req, res, next) => {
  const api_key = req.headers["x-api-key"];
  if (!api_key) {
    return response_handler(res, 401, `No API key provided`);
  }
  if (api_key !== process.env.API_KEY) {
    return response_handler(res, 401, `Invalid API key`);
  }

  const header = req.headers["authorization"];
  const jwt_token = header && header.split(" ")[1];

  if (!jwt_token) {
    return response_handler(res, 401, `No token provided`);
  }

  try {
    const decoded = jwt.verify(jwt_token, process.env.JWT_SECRET);
    req.user_id = decoded.user_id;
    const user = await User.findById(req.user_id);
    if (!user) {
      return response_handler(res, 401, `User not found`);
    }
    req.user = user;
    next();
  } catch (error) {
    return response_handler(res, 500, `Failed to authenticate token`);
  }
};

module.exports = auth_verify;
