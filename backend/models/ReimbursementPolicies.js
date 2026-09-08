const mongoose = require("mongoose");

const reimbursementPolicySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "ReimbursementPolicy",
    reimbursementPolicySchema
);