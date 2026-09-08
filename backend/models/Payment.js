const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    issuedDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Paid",
        "Pending",
        "Overdue",
        "Cancelled",
        "partial",
        "Partial",
      ],
      default: "Pending",
    },

    paymentDescription: {
      type: String,
      default: "",
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema );