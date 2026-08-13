const Joi = require("joi");
const { GENDER, RELIGION } = require("../../config/constants");

exports.create_succession_validation = Joi.object({
  gender: Joi.string()
    .valid(...Object.values(GENDER))
    .required()
    .messages({
      "any.only": "Please select a valid gender.",
      "any.required": "Gender is required.",
    }),
  religion: Joi.string()
    .valid(...Object.values(RELIGION))
    .required()
    .messages({
      "any.only": "Please select a valid religion.",
      "any.required": "Religion is required.",
    }),
  married: Joi.boolean().required().messages({
    "any.required": "Marital status is required.",
  }),
  inter_caste: Joi.boolean().default(false),
  divorced: Joi.boolean().default(false),
  spouse_alive: Joi.when("married", {
    is: true,
    then: Joi.boolean().required().messages({
      "any.required": "Spouse alive status is required when married.",
    }),
    otherwise: Joi.boolean().default(false),
  }),
  marital_status: Joi.string()
    .valid("married", "divorced", "unmarried", "widowed")
    .optional(),
  children: Joi.object({
    sons: Joi.number().min(0).default(0),
    daughters: Joi.number().min(0).default(0),
    deceased_sons: Joi.number().min(0).default(0),
    deceased_daughters: Joi.number().min(0).default(0),
  }).default(),
  parents_alive: Joi.string()
    .valid("both", "father", "mother", "none")
    .required()
    .messages({
      "any.only": "Please select a valid parents_alive option.",
      "any.required": "Parents alive status is required.",
    }),
  siblings: Joi.object({
    brothers: Joi.number().min(0).default(0),
    sisters: Joi.number().min(0).default(0),
  }).default(),
});


exports.share_succession_validation = Joi.object({
  survey_id: Joi.string().required().messages({
    "any.required": "Survey ID is required"
  }),
  tree_image: Joi.string().required().messages({
    "any.required": "Tree image is required"
  }),
  mobile: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid mobile number format",
      "any.required": "Mobile number is required"
    }),
  name: Joi.string().required().messages({
    "any.required": "Name is required"
  }), 
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required"
    })
});