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
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["New", "Pending", "Completed"],
      default: "New",
    },

    leadSchedule: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Call", "Email", "Website", "Meeting"],
      required: true,
    },

    assignedTo: {
      type: String,
      trim: true,
    },

    followupCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    followupTime: {
      type: String, // Example: "17:30"
    },

    nextFollowupDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    isCompleted: {
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