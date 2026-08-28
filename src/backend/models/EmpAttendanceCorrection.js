// models/AttendanceCorrection.js
const mongoose = require("mongoose");

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    managerId: {
      type: String,
      required: true,
    },
    managerName: {
      type: String,
      required: true,
    },

    correctionType: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    correctCheckIn: {
      type: String, // HH:mm
      required: true,
    },

    correctCheckOut: {
      type: String, // HH:mm
      required: true,
    },

    workMode: {
      type: String,
     
      required: true,
    },

    reason: {
      type: String,
      maxlength: 500,
      required: true,
    },

    documents: [
      {
        type: String, // file path or URL
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AttendanceCorrection",
  attendanceCorrectionSchema
);