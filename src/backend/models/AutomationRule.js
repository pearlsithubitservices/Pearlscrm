const mongoose = require("mongoose");

const automationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    trigger: {
      type: String,
      required: true,
      enum: ["Message", "Time Based"],
    },

    condition: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "Fetch Attendance",
        "Start Leave Flow",
        "Fetch Leave Balance",
        "Fetch Leave Status",
        "Provide Payslip",
        "Route to HR",
        "Assign to Human",
        "Send Normal Response",
        "Send Away Message",
      ],
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
  "AutomationRule",
  automationRuleSchema
);