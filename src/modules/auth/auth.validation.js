const Joi = require("joi");

exports.user_signup_validation = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Please enter a valid name using letters.",
    "any.required":
      "Name is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  email: Joi.string().required().messages({
    "string.base": "Please enter a valid email address.",
    "any.required": "Email is required to continue.",
  }),
  password: Joi.string().messages({
    "string.base": "Password Please enter valid text.",
  }),
  phone: Joi.string().messages({
    "string.base": "Phone Please enter valid number.",
  }),
  role: Joi.string().messages({
    "string.base": "Role Please enter valid text.",
  }),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
});
