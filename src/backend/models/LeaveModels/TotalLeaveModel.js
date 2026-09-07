const mongoose = require("mongoose");

const totalLeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    personalLeave: {
      type: Number,
      default: 10,
    },

    sickLeave: {
      type: Number,
      default: 15,
    },

    annualLeave: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TotalLeave", totalLeaveSchema);