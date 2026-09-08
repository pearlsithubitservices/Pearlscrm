const mongoose = require("mongoose");

const messageLogSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsAppCampaign" },
    broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsAppBroadcast" },
    recipientPhone: { type: String, required: true },
    recipientName: { type: String },
    leadId: { type: String },
    templateName: { type: String },
    messageBody: { type: String },
    whatsappMessageId: { type: String },
    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed", "clicked"],
      default: "queued",
    },
    errorMessage: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

messageLogSchema.index({ campaignId: 1, status: 1 });
messageLogSchema.index({ whatsappMessageId: 1 });

module.exports = mongoose.model("WhatsAppMessageLog", messageLogSchema);
