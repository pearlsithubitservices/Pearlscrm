const mongoose = require('mongoose');

const attendanceSchema =
new mongoose.Schema({

  employee_uid: {
    type: String,
    required: true
  },

  employee_name: {
    type: String,
    required: true
  },

  login_time: {
    type: Date
  },

  logout_time: {
    type: Date
  },

  break_start: {
    type: Date
  },

  break_end: {
    type: Date
  },

  total_work_seconds: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: [
      'Online',
      'Break',
      'Offline'
    ],
    default: 'Offline'
  }

}, {
  timestamps: true
});

module.exports =
mongoose.model(
  'Attendance',
  attendanceSchema
);