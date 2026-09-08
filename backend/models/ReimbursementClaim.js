// models/ReimbursementClaim.js

const mongoose = require("mongoose");

const reimbursementClaimSchema = new mongoose.Schema(
    {
        employee_uid: {
            type: String,
            required: true,
        },

        employee_name: {
            type: String,
            required: true,
        },

        claimType: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        expenseDate: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            maxlength: 500,
        },

        receipt: {
            type: String, // uploaded file path
            default: null,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },

        remarks: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ReimbursementClaim",
    reimbursementClaimSchema
);