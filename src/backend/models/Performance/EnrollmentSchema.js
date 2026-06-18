const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        employee_uid: {
            type: String,
            required: true,
        },

        courseId: {
            type: String,

            required: true,
        },

        status: {
            type: String,
            enum: ["Enrolled", "In Progress", "Completed"],
            default: "Enrolled",
        },

        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        enrolledDate: {
            type: Date,
            default: Date.now,
        },

        completedDate: {
            type: Date,
        },

        certificateUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);