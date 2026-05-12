const express = require("express");

const router = express.Router();

const Lead = require("../models/Leads");

router.post("/", async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;