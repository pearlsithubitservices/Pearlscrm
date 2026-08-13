const mongoose = require("mongoose");

const progressLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    alignedTo: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      
      default: "pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    goalDescription: {
      type: String,
      required: true,
    },

    progressDescription: {
      type: String,
      default: "",
    },

    progressLogs: [progressLogSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);