const response_handler = require("../../helpers/response_handler");
const User = require("../user/user.model");
const { generate_token, generate_random_password } = require("./auth.service");
const { hash_password, compare_passwords } = require("../../utils/bcrypt");
const validation = require("./auth.validation");

exports.user_signup = async (req, res) => {
  try {
    const { error, value } = validation.user_signup_validation.validate(
      req.body
    );
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }
    const existing_user = await User.findOne({
      email: value.email,
      role: value.role,
    });
    if (existing_user) {
      return response_handler(res, 400, `${value.role} already exists`);
    }
    const password = value.password || generate_random_password();
    const hashed_password = await hash_password(password);
    const user_data = { ...value, password: hashed_password, role: value.role };
    const user = await User.create(user_data);
    //TODO: Send email to that user with password and login URL
    if (!user) {
      return response_handler(res, 400, `${value.role} not created`);
    }
    return response_handler(
      res,
      200,
      `${value.role} created successfully`,
      user
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role = "admin" } = req.body;
    if (!email || !password) {
      return response_handler(res, 400, "Email and password are required");
    }
    const user = await User.findOne({
      email,
      role,
      status: { $ne: "deleted" },
    });
    if (!user) {
      return response_handler(res, 400, "User not found");
    } else if (user.status === "inactive") {
      return response_handler(res, 400, "User is inactive");
    }
    const is_password_correct = await compare_passwords(
      password,
      user.password
    );
    if (!is_password_correct) {
      return response_handler(res, 400, "Invalid password");
    }
    const token = generate_token(user._id);
    return response_handler(res, 200, "User logged in successfully", {
      token,
      role,
    });
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
