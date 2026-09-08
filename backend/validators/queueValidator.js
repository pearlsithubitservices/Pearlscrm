const Joi = require("joi");

const audiencePreviewSchema = Joi.object({
  status: Joi.array().items(Joi.string()).optional(),
  source: Joi.array().items(Joi.string()).optional(),
  assignedTo: Joi.array().items(Joi.string()).optional(),
});

module.exports = { audiencePreviewSchema };
