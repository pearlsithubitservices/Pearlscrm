const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    notes: String,
    assignedEmployee: String,
    assignedTo: String,
    priority: String,
    status: {type: String, default: "Pending"},
    dueDate: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);