const jwt = require("jsonwebtoken");

const generate_OTP = (length) => {
  const characters = "0123456789";
  const charactersLength = characters.length;
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    otp += characters.charAt(randomIndex);
  }

  return otp;
};

const generate_token = (user_id) => {
  const payload = {
    user_id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {});
};

const generate_random_password = () => {
  const passwordLength = 10;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0, n = charset.length; i < passwordLength; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

module.exports = {
  generate_OTP,
  generate_token,
  generate_random_password,
};
