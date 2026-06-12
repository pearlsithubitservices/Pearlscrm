const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    // BASIC INFO
    month: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Present"],
      default: "Pending",
    },

    // 💰 EARNINGS (FLAT)
    basicSalary: {
      type: Number,
      default: 0,
    },

    medical: {
      type: Number,
      default: 0,
    },

    performanceBonus: {
      type: Number,
      default: 0,
    },

    conveyance: {
      type: Number,
      default: 0,
    },

    // 🧾 DEDUCTIONS (FLAT)
    pf: {
      type: Number,
      default: 0,
    },

    esi: {
      type: Number,
      default: 0,
    },

    tds: {
      type: Number,
      default: 0,
    },

    professionalTax: {
      type: Number,
      default: 0,
    },

    // 📊 TOTALS
    gross: {
      type: Number,
      required: true,
    },

    totalDeductions: {
      type: Number,
      required: true,
    },

    net: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payslip", payslipSchema);