const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            enum: ["Recommended", "New", "Mandatory"],
            default: "Recommended",
        },
        duration: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            required: true,
        },
        image: {
            type: String, // image URL
            required: true,
        },
        description: {
            type: String,
        },
        provider: {
            type: String,
        },
        enrolledCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);