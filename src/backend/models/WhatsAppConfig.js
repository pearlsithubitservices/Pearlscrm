const mongoose = require("mongoose");

const WhatsAppConfigSchema = new mongoose.Schema(
  {
    phoneNumberId: {
      type: String,
      default: "",
    },

    businessAccountId: {
      type: String,
      default: "",
    },

    accessToken: {
      type: String,
      default: "",
    },

    webhookUrl: {
      type: String,
      default: "",
    },

    verifyToken: {
      type: String,
      default: "",
    },

    connected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WhatsAppConfig",
  WhatsAppConfigSchema
);