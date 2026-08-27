const mongoose = require("mongoose");

const messageTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Attendance",
        "Leave",
        "Payroll",
        "Support",
        "General",
      ],
      default: "General",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MessageTemplate",
  messageTemplateSchema
);