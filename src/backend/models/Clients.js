const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    website: {
      type: String,
      trim: true
    },
    projectName:{
        type:String,
        trim:true
    },

    contactNumber: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    revenue: {
      type: Number,
      default: 0
    },

    headquarters: {
      type: String,
      trim: true
    },

    employees: {
      type: Number,
      default: 0
    },

    budget: {
      type: Number,
      default: 0
    },

    managers: [{
      type: String
    }],

    projectstartdate: {
      type: Date
    },

    duedate: {
      type: Date
    },

    foundeddate: {
      type: Date
    },

    projectnotes: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["New", "Interested", "Converted", "Lost"],
      default: "New"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Client",
  clientSchema
);