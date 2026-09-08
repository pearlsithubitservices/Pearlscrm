const mongoose = require("mongoose");

const whatsAppConnectionSchema = new mongoose.Schema(
  {
    phoneNumberId: { type: String, required: true },
    businessAccountId: { type: String },
    displayPhoneNumber: { type: String },
    verifiedName: { type: String },
    qualityRating: { type: String },
    status: {
      type: String,
      enum: ["connected", "disconnected", "pending"],
      default: "pending",
    },
    lastSyncedAt: { type: Date },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppConnection", whatsAppConnectionSchema);
