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

module.exports = route;