const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    feedbackType: {
      type: String,
      required: true,

    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comments: {
      type: String,
      required: true,
    },

    suggestion: {
      type: String,
      default: "",
    },

    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);