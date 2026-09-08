const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsAppTemplate" },
    templateName: { type: String },
    messageBody: { type: String },
    audienceFilters: {
      status: [String],
      source: [String],
      priority: [String],
      assignedTo: [String],
      followUpDue: Boolean,
      lastContactOlderThanDays: Number,
      tags: [String],
    },
    audienceCount: { type: Number, default: 0 },
    recipients: [
      {
        name: String,
        phone: String,
        leadId: String,
        variables: mongoose.Schema.Types.Mixed,
      },
    ],
    deliveryMode: {
      type: String,
      enum: ["send_now", "schedule", "recurring", "delay_failed"],
      default: "send_now",
    },
    scheduledAt: { type: Date },
    recurring: {
      frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
      endDate: { type: Date },
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["draft", "queued", "running", "completed", "paused", "failed"],
      default: "draft",
    },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
    },
    createdBy: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppCampaign", campaignSchema);
