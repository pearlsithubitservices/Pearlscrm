const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    assignedTo: String,
    priority: String,
    status: String,
    dueDate: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);