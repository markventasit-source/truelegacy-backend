const Joi = require("joi");

exports.create_notification = Joi.object({
  type: Joi.array().required().messages({
    "array.base": "Type Please enter the items as a list.",
    "any.required": "Type is required. Don’t leave it blank.",
  }),
  subject: Joi.string().required().messages({
    "string.base": "Subject Please enter valid text.",
    "any.required": "Subject is required. Don’t leave it blank.",
  }),
  content: Joi.string().required().messages({
    "string.base": "Content Please enter valid text.",
    "any.required": "Content is required. Don’t leave it blank.",
  }),
  image: Joi.string().messages({
    "string.base": "Image Please enter valid text.",
  }),
  link: Joi.string().messages({
    "string.base": "Link Please enter valid text.",
  }),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
  send_date: Joi.date().messages({
    "date.base": "Send date Please enter a valid date.",
  }),
  users: Joi.array().messages({
    "array.base": "Users Please enter the items as a list.",
  }),
  role: Joi.string().messages({
    "string.base": "Role Please enter valid text.",
  })
});

exports.update_notification = Joi.object({
  type: Joi.array().messages({
    "array.base": "Type Please enter the items as a list.",
  }),
  subject: Joi.string().messages({
    "string.base": "Subject Please enter valid text.",
  }),
  content: Joi.string().messages({
    "string.base": "Content Please enter valid text.",
  }),
  image: Joi.string().messages({
    "string.base": "Image Please enter valid text.",
  }),
  link: Joi.string().messages({
    "string.base": "Link Please enter valid text.",
  }),
  users: Joi.array().messages({
    "array.base": "Users Please enter the items as a list.",
  }),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
  send_date: Joi.date().messages({
    "date.base": "Send date Please enter a valid date.",
  }),
  role: Joi.string().messages({
    "string.base": "Role Please enter valid text.",
  })
});
