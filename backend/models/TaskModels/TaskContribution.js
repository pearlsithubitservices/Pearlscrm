const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },

    task: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contribution", contributionSchema);