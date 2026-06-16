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
    department:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
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
      enum: ['present','absent','half day','late comer','early logout','leave'],
      
    },

    workingHours: {
      type: Number,
      default: 0,//seconds
    },
    isOnline:{
        type:Boolean,
        default:false,
    },
    photoStatus:{
        type:String,
        default:null,
    },

    // ✅ NEW: multiple breaks support
    breaks: [breakSchema],
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model('EmpattendanceSchema', EmpattendanceSchema);