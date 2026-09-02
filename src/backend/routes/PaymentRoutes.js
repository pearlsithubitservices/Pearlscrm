const express = require("express");

const route = express.Router();
const PaymentModel = require("../models/Payment");

// Create Payment
route.post("/", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.budget !== undefined) {
      payload.budget = Number(payload.budget);
    }

    const payment = await PaymentModel.create(payload);

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

// Get All Payments
route.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const payments = await PaymentModel.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(payments);
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
      return res.status(404).json({ message: "Payment record not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Payment by ID
route.put("/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.budget !== undefined) {
      payload.budget = Number(payload.budget);
    }

    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: false }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.status(200).json({
      message: "Payment updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Payment by ID
route.delete("/:id", async (req, res) => {
  try {
    const deletedPayment = await PaymentModel.findByIdAndDelete(req.params.id);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.status(200).json({
      message: "Payment deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = route;