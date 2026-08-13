const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { _id: false }
);

const performanceReviewSchema = new mongoose.Schema(
  {
    employee_uid: {
      type: String,
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    employeeDesignation: {
      type: String,
      required: true,
    },

    reviewerName: {
      type: String,
      required: true,
    },

    reviewerDesignation: {
      type: String,
      default: "HR Manager",
    },

    reviewerImage: {
      type: String,
      default: "",
    },

    reviewTitle: {
      type: String,
      required: true,
    },

    overallRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },

    reviewDate: {
      type: Date,
      default: Date.now,
    },

    metrics: [metricSchema],

    feedback: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);