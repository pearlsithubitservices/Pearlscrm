const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    notes: String,

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
    },

    priority: {
      type: String,
      enum: ["Hot", "Warm", "Cold"],
      default: "cold"
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending"
    },

    dueDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);