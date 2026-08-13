const express = require("express");
const router = express.Router();
const Payslip = require("../models/Payroll&Benefits/Payslip");

// CREATE PAYSLIP
router.post("/", async (req, res) => {
  try {
    const payslip = await Payslip.create(req.body);
    res.status(201).json(payslip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PAYSLIPS
router.get("/", async (req, res) => {
  try {
    const payslips = await Payslip.find().sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;