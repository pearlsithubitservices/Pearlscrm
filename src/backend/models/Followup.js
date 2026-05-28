const mongoose = require("mongoose");

const followupSchema = new mongoose.Schema(
  {
    leadName: String,
    company: String,
    followupType: String,
    date: String,
    time: String,
    status: String,
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Followup", followupSchema);