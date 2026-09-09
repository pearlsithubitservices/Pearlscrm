const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    employeeRole: {
      type: String,
      required: true,
      trim: true,
      default: "Employee",
    },

    empId: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
      default: "Engineering",
    },

    status: {
      type: String,
      enum: ["Active", "Suspended", "Pending"],
      default: "Active",
    },

    sme: {
      type: Boolean,
      default: false,
    },

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    contact: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    location: String,
    joinDate: Date,
    notes: String,
    profile: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bankDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    salary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);