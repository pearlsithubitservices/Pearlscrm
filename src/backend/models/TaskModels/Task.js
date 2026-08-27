const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    notes: String,

    assignedTo: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Employee",
      default: "Unassigned"
    },

    assignedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      default: "Admin"
    },

    priority: {
      type: String,
      enum: ["Hot", "Warm", "Cold", "High", "Medium", "Normal", "Low"],
      default: "High"
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "New"],
      default: "New"
    },

    dueDate: Date,
    projectId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);