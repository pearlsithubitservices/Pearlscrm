const mongoose = require("mongoose");

const taskDocumentSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: "FILE" },
    size: { type: String, default: "0 KB" },
    url: { type: String, required: true },
    uploadedBy: { type: String, default: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskDocument", taskDocumentSchema);
