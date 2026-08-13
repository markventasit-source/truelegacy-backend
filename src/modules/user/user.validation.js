const Joi = require("joi");

exports.update_user = Joi.object({
  name: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  role: Joi.string(),
  image: Joi.string(),
  status: Joi.string(),
});

exports.update_temp_user = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});