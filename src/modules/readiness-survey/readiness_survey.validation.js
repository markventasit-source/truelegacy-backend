const Joi = require("joi");

const answer_options = {
  age_category: ["Below 45 years", "45-60 years", "60-70 years", "Above 70 years"],
  net_worth_awareness: [
    "Less than ₹1 crore",
    "₹1 crore - ₹5 crores",
    "₹5 crores - ₹10 crores",
    "Above ₹10 crores",
  ],
  physical_control_immovable: ["Yes", "Partially", "No"],
  ownership_documents_available: ["Yes", "No"],
  nominee_vs_legal_heir_awareness: ["Yes", "No"],
  inheritance_law_awareness: ["Yes", "Partially", "No"],
  overseas_inheritance_awareness: ["Yes", "No"],
  family_wealth_sharing: ["Yes", "Partially", "No"],
  has_will: ["Yes", "No"],
  has_private_trust: ["Yes", "No"],
  has_executor_trustee: ["Yes", "No"],
};

exports.answer_options = answer_options;

exports.submit_readiness_survey_validation = Joi.object({
  answers: Joi.object({
    age_category: Joi.string()
      .valid(...answer_options.age_category)
      .required(),
    net_worth_awareness: Joi.string()
      .valid(...answer_options.net_worth_awareness)
      .required(),
    physical_control_immovable: Joi.string()
      .valid(...answer_options.physical_control_immovable)
      .required(),
    ownership_documents_available: Joi.string()
      .valid(...answer_options.ownership_documents_available)
      .required(),
    nominee_vs_legal_heir_awareness: Joi.string()
      .valid(...answer_options.nominee_vs_legal_heir_awareness)
      .required(),
    inheritance_law_awareness: Joi.string()
      .valid(...answer_options.inheritance_law_awareness)
      .required(),
    overseas_inheritance_awareness: Joi.string()
      .valid(...answer_options.overseas_inheritance_awareness)
      .required(),
    family_wealth_sharing: Joi.string()
      .valid(...answer_options.family_wealth_sharing)
      .required(),
    has_will: Joi.string().valid(...answer_options.has_will).required(),
    has_private_trust: Joi.string().valid(...answer_options.has_private_trust).required(),
    has_executor_trustee: Joi.string()
      .valid(...answer_options.has_executor_trustee)
      .required(),
  }).required(),
});
