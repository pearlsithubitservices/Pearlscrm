const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema(
  {
    start: Date,
    end: Date,
    duration: Number, // seconds
  },
  { _id: false }
);

const EmpattendanceSchema = new mongoose.Schema(
  {
    employee_uid: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },


    employee_name: {
      type: String,
      required: true,
    },

    clockIn: {
      type: Date,
    },

    clockOut: {
      type: Date,
    },

    status: {
      type: String,
      default: 'absent',

    },
    attendanceState: {
      type: String,
      enum: [
        "clocked_out",
        "working",
        "break",
        "clock_in"
      ],
      default: "clocked_out",
      required: true,
    },

    workingHours: {
      type: Number,
      default: 0,//seconds
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    photoStatus: {
      type: String,
      default: null,
    },

    // ✅ NEW: multiple breaks support
    breaks: {
      type: [breakSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model('EmpattendanceSchema', EmpattendanceSchema);