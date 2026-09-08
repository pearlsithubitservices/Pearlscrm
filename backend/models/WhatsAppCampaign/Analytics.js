const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    deliveryRate: { type: Number, default: 0 },
    readRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalRead: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 },
    totalResponses: { type: Number, default: 0 },
    campaignsPaused: { type: Number, default: 0 },
    trends: {
      deliveryRate: { type: Number, default: 0 },
      readRate: { type: Number, default: 0 },
      clickRate: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      responses: { type: Number, default: 0 },
    },
    campaignComparisons: [
      {
        campaignId: mongoose.Schema.Types.ObjectId,
        name: String,
        sent: Number,
        delivered: Number,
        read: Number,
        failed: Number,
      },
    ],
  },
  { timestamps: true }
);

analyticsSchema.index({ date: -1 });

module.exports = mongoose.model("WhatsAppAnalytics", analyticsSchema);
