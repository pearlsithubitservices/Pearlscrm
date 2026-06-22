const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    // Employee Details
    employeeId: {
      type: String,
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    // Ticket Details
    issuedcategory: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 500,
    },

    attachment: {
      type: String, // uploaded file path/URL
      default: null,
    },

    // Ticket Status
    status: {
      type: String,
      enum: [ "In Progress", "Resolved", "Closed"],
      default: "In Progress",
    },

    // Team/Person Handling the Ticket
    assignedTo: {
      type: String,
      default: "",
    },

    // Admin remarks or resolution notes
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);