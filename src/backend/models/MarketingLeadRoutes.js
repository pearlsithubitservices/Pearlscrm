const express = require("express");
const router = express.Router();

const MarketingLead = require(
  "../models/MarketingLead"
);

// Get All Leads
router.get("/", async (req, res) => {
  try {
    const leads = await MarketingLead.find();

    res.json(leads);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Add Lead
router.post("/", async (req, res) => {
  try {
    const lead = new MarketingLead(req.body);

    const savedLead =
      await lead.save();

    res.status(201).json(savedLead);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// Update Lead
router.put("/:id", async (req, res) => {
  try {
    const updatedLead =
      await MarketingLead.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Delete Lead
router.delete("/:id", async (req, res) => {
  try {
    await MarketingLead.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;