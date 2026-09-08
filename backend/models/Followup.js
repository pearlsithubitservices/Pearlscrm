const mongoose = require("mongoose");

const FollowupSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["New", "Pending", "In Progress", "Completed", "Scheduled"],
      default: "Pending",
    },

    leadSchedule: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      default: "Call",
    },

    assignedTo: {
      type: String,
      trim: true,
    },

    followupCount: {
      type: Number,
      default: 1,
      min: 0,
    },

    followupTime: {
      type: String, // Example: "17:30"
    },

    date: {
      type: String,
    },

    nextFollowupDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    history: [
      {
        date: { type: String },
        note: { type: String },
        author: { type: String, default: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isCompleted: {
      type: Boolean,
      default: false,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Followup ||
  mongoose.model("Followup", FollowupSchema);