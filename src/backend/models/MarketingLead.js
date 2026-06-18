const mongoose = require("mongoose");

const marketingLeadSchema = new mongoose.Schema(
  {
    date: String,
    callAnswer: String,
    businessName: String,
    contactNumber: String,
    followGivenBy: String,
    location: String,
    actionsTaken: String,
    businessType: String,
    yearsInBusiness: Number,
    mailId: String,
    suggestions: String,

    status: {
      type: String,
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MarketingLead",
  marketingLeadSchema
);