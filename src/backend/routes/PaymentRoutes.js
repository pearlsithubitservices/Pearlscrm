const express = require("express");

const route = express.Router();
const PaymentModel = require("../models/Payment");

// Create Payment
route.post("/", async (req, res) => {
  try {
    const payment = await PaymentModel.create(req.body);

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get Payments
route.get("/", async (req, res) => {
  try {
    const payment = await PaymentModel.find().sort({
      createdAt: -1,
    });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get Single Payment
route.get("/:id", async (req, res) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Payment
route.put("/:id", async (req, res) => {
  try {
    const payment = await PaymentModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Payment updated successfully", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Payment
route.delete("/:id", async (req, res) => {
  try {
    const payment = await PaymentModel.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = route;