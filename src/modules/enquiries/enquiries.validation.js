const Joi = require("joi");

exports.create_enquiry = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Please enter a valid name using letters.",
    "any.required":
      "Name is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  email: Joi.string().required().messages({
    "string.base": "Please enter a valid email address.",
    "any.required": "Email is required to continue.",
  }),
  message: Joi.string().required().messages({
    "string.base": "Please enter a valid message using letters.",
    "any.required":
      "Message is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  phone: Joi.string().messages({
    "string.base": "Phone Please enter valid number.",
  }),
  source: Joi.string().messages({
    "string.base": "Source Please enter valid text.",
  }),
  date: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .messages({
      "string.pattern.base": "Start date must be in DD-MM-YYYY format.",
    }),
  time: Joi.string()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .messages({
      "string.pattern.base": "Time must be in HH:MM AM/PM format.",
    }),
  type: Joi.string().messages({
    "string.base": "Type Please enter valid text.",
  }),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
});

exports.update_enquiry = Joi.object({
  name: Joi.string().messages({
    "string.base": "Name Please enter valid text.",
  }),
  email: Joi.string().messages({
    "string.base": "Email Please enter valid text.",
  }),
  message: Joi.string().messages({
    "string.base": "Message Please enter valid text.",
  }),
  phone: Joi.string().messages({
    "string.base": "Phone Please enter valid number.",
  }),
  source: Joi.string().messages({
    "string.base": "Source Please enter valid text.",
  }),
  date: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .messages({
      "string.pattern.base": "Start date must be in DD-MM-YYYY format.",
    }),
  time: Joi.string()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .messages({
      "string.pattern.base": "Time must be in HH:MM AM/PM format.",
    }),
  type: Joi.string().messages({
    "string.base": "Type Please enter valid text.",
  }),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
});
