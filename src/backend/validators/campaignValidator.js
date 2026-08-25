const Joi = require("joi");

const createCampaignSchema = Joi.object({
  name: Joi.string().required(),
  templateId: Joi.string().optional(),
  templateName: Joi.string().optional(),
  messageBody: Joi.string().optional(),
  audienceFilters: Joi.object().optional(),
  deliveryMode: Joi.string().valid("send_now", "schedule", "recurring", "delay_failed").optional(),
  scheduledAt: Joi.date().optional(),
  recurring: Joi.object().optional(),
  priority: Joi.string().valid("low", "normal", "high").optional(),
  status: Joi.string().valid("draft", "queued").optional(),
  createdBy: Joi.string().optional(),
});

const updateCampaignSchema = createCampaignSchema.fork(
  Object.keys(createCampaignSchema.describe().keys),
  (schema) => schema.optional()
);

module.exports = { createCampaignSchema, updateCampaignSchema };
