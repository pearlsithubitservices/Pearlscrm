const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        employee_uid: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        time: {
            type: String,
            default: () =>
                new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Activity", activitySchema);