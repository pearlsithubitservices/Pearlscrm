 const mongoose = require("mongoose");

const aiConfigSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    provider: {
      type: String,
      default: "Gemini",
    },

    model: {
      type: String,
      default: "gemini-2.5-flash",
    },

    systemInstructions: {
      type: String,
      default:
        "You are a helpful HR assistant. Answer employee questions clearly and professionally. Use available CRM data when required. Do not invent employee information.",
    },

    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },

    maxTokens: {
      type: Number,
      default: 500,
      min: 1,
    },

    humanHandoff: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIConfig",
  aiConfigSchema
);