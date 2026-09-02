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

// Get Payments
route.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.clientId) {
      filter.clientId = req.query.clientId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const payment = await PaymentModel.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Payment Status
route.put("/:id", async (req, res) => {
  try {
    const payment = await PaymentModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = route;