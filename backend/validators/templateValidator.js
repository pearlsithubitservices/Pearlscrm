const Joi = require("joi");

const createTemplateSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().valid("MARKETING", "UTILITY", "AUTHENTICATION").optional(),
  language: Joi.string().optional(),
  body: Joi.string().required(),
  header: Joi.string().optional(),
  footer: Joi.string().optional(),
  variables: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().optional(),
});

module.exports = { createTemplateSchema };
