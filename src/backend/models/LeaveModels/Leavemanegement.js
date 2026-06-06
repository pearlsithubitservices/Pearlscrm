const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
    {
        leaveTitle: {
            type: String,
            required: true,
            trim: true,
        },

        leaveReason: {
            type: String,
            required: true,
            trim: true,
        },

        leaveFrom: {
            type: Date,
            required: true,
        },

        leaveTo: {
            type: Date,
            required: true,
        },

        leaveDays: {
            type: Number,
            required: true,
            min: 1,
        },
        leaveType:{
            type:String,
            required:true,
            trim:true,
        },

        employeeName: {
            type: String,
            required: true,
            trim: true,
        },

        employeeId: {
            type: String,
            
            required: true,
        },

        managerName: {
            type: String,
            required: true,
            trim: true,
        },
         department: {
            type: String,
            required: true,
            trim: true,
        },

        managerId: {
            type: String,
           
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Approved",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Leave", leaveSchema);