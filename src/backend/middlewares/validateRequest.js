const { error } = require("../utils/response");

const validateRequest = (schema) => (req, res, next) => {
  const { error: validationError } = schema.validate(req.body, { abortEarly: false });
  if (validationError) {
    const messages = validationError.details.map((d) => d.message).join(", ");
    return error(res, messages, 400);
  }
  next();
};

module.exports = validateRequest;
