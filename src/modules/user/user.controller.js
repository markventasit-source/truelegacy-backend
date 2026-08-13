const mongoose = require("mongoose");
const response_handler = require("../../helpers/response_handler");
const { hash_password } = require("../../utils/bcrypt");
const User = require("./user.model");
const validation = require("./user.validation");

exports.get_users = async (req, res) => {
  try {
    const { page_no = 1, limit = 10, search, role } = req.query;
    const skip_count = limit * (page_no - 1);
    const status = req.query["status[]"];
    const filter = {
      _id: {
        $nin: [
          new mongoose.Types.ObjectId(req.user_id),
          new mongoose.Types.ObjectId("6929a3c250ac8ff04e687751"), //! TTJ Admin
        ],
      },
    };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (role) {
      filter.role = role;
    }
    if (status) {
      filter.status = { $in: status };
    }
    const [users, total_count] = await Promise.all([
      User.find(filter)
        .skip(skip_count)
        .limit(limit)
        .sort({ createdAt: -1, _id: -1 }),
      User.countDocuments(filter),
    ]);
    return response_handler(
      res,
      200,
      "Users fetched successfully",
      users,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_user_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "User ID is required");
    }
    const user = await User.findById(id);
    return response_handler(res, 200, "User fetched successfully", user);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_user = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "User ID is required");
    }
    const { error, value } = validation.update_user.validate(req.body);
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }
    if (value.password) {
      const hashed_password = await hash_password(value.password);
      value.password = hashed_password;
    }
    const user = await User.findByIdAndUpdate(id, value, { new: true });
    return response_handler(res, 200, "User updated successfully", user);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_user = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "User ID is required");
    }
    const user = await User.findByIdAndUpdate(
      id,
      { status: "deleted" },
      {
        new: true,
      }
    );
    return response_handler(res, 200, "User deleted successfully", user);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_profile = async (req, res) => {
  try {
    const user = await User.findById(req.user_id);
    return response_handler(
      res,
      200,
      "User profile fetched successfully",
      user
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.bulk_delete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return response_handler(res, 400, "User IDs are required");
    }
    const users = await User.updateMany(
      { _id: { $in: ids } },
      { status: "deleted" }
    );
    return response_handler(res, 200, "Users deleted successfully", users);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
