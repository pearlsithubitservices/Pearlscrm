const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsAppCampaign", required: true },
    campaignName: { type: String },
    totalMessages: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    messagesPerMinute: { type: Number, default: 0 },
    activeWorkers: { type: Number, default: 0 },
    estimatedCompletion: { type: Date },
    queues: {
      delivery: { type: Number, default: 0 },
      processing: { type: Number, default: 0 },
      retry: { type: Number, default: 0 },
      batch: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["idle", "running", "paused", "completed"],
      default: "idle",
    },
    liveLogs: [{ message: String, level: String, timestamp: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppQueue", queueSchema);
