const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsAppCampaign" },
    audienceLabel: { type: String },
    audienceCount: { type: Number, default: 0 },
    scheduleLabel: { type: String },
    scheduledAt: { type: Date },
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed", "cancelled"],
      default: "draft",
    },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppBroadcast", broadcastSchema);
