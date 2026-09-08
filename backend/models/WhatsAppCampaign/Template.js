const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["MARKETING", "UTILITY", "AUTHENTICATION"],
      default: "UTILITY",
    },
    language: { type: String, default: "en" },
    status: {
      type: String,
      enum: ["APPROVED", "PENDING", "REJECTED", "IN_REVIEW", "DRAFT"],
      default: "DRAFT",
    },
    body: { type: String },
    header: { type: String },
    footer: { type: String },
    variables: [{ type: String }],
    metaTemplateId: { type: String },
    syncedAt: { type: Date },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppTemplate", templateSchema);
