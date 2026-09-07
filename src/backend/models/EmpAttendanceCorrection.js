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
      default: "General",
    },
    managerId: {
      type: String,
      default: "ADMIN-01",
    },
    managerName: {
      type: String,
      default: "Admin",
    },

    correctionType: {
      type: String,
      default: "Missed Check-In",
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
      default: "",
    },

    workMode: {
      type: String,
      default: "In Office",
    },

    reason: {
      type: String,
      maxlength: 500,
      default: "Attendance Correction Request",
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