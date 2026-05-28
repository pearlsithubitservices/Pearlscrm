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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);