const Joi = require("joi");

const createBroadcastSchema = Joi.object({
  name: Joi.string().required(),
  campaignId: Joi.string().optional(),
  audienceLabel: Joi.string().optional(),
  audienceCount: Joi.number().optional(),
  scheduleLabel: Joi.string().optional(),
  scheduledAt: Joi.date().optional(),
  recurring: Joi.object().optional(),
  status: Joi.string().valid("draft", "scheduled", "active").optional(),
  createdBy: Joi.string().optional(),
});

module.exports = { createBroadcastSchema };
