
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

        
        "Fetch My Tasks",
        "Fetch Pending Tasks",
        "Fetch Completed Tasks",
        "Start Task Flow",
        "Update Task Status",
        "Handle Task Request",
        
        "Fetch My Projects",
        "Fetch Project Progress",
        "Fetch Project Deadlines",
        "Fetch Project Team",
        "Fetch Project Milestones",
        "Handle Project Request",
        
        "Provide Payslip",
        "Fetch My Payroll",
        "Fetch Paid Payroll",
        "Fetch Pending Payroll",
        "Handle Payroll Request",

       
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
