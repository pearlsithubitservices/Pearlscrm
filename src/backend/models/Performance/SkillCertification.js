const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
            required: true,
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
        },
    },
    { _id: false }
);

const certificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        issuer: {
            type: String,
            required: true,
        },
        issued: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const skillsCertificationSchema = new mongoose.Schema(
    {
        employee_uid: {
            type: String,
            required: true,
        },

        skills: [skillSchema],

        certifications: [certificationSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "SkillsCertification",
    skillsCertificationSchema
);