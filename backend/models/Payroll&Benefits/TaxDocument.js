const mongoose = require("mongoose");

const TaxDocumentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        financialYear: {
            type: String,
            default: "",
        },

        documentUrl: {
            type: String,
            default: "",
        },

        documentType: {
            type: String,

            default: "Other",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "TaxDocument",
    TaxDocumentSchema
);