const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    holidayName: {
      type: String,
      required: true,
      trim: true,
    },

    holidayDate: {
      type: Date,
      required: true,
    },

    holidayType: {
      type: String,
      enum: ["Public", "Festival", "National", "Optional"],
      default: "Public",
    },

    description: {
      type: String,
      default: "",
    },

    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports= mongoose.model('Holiday', holidaySchema)