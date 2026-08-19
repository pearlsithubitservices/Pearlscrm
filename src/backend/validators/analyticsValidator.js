const Joi = require("joi");

const dateRangeSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

module.exports = { dateRangeSchema };
