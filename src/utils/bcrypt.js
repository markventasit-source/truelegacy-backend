const bcrypt = require("bcrypt");

exports.hash_password = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

exports.compare_passwords = async (password, hashed_password) => {
  return await bcrypt.compare(password, hashed_password);
};
