const mongoose = require("mongoose");

const benefitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    provider: {
      type: String,
      default: "Company Standard",
    },
    coverAmount: {
      type: String,
      default: "N/A",
    },
    contribution: {
      type: String,
      default: "Company Funded",
    },
    footer: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Benefit", benefitSchema);
