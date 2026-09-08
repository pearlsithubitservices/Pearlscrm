const express = require("express");
const router = express.Router();
const Feedback = require("../models/CommunicationModels/Feedback");

// CREATE FEEDBACK
router.post("/", async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL FEEDBACK
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE FEEDBACK STATUS
router.put("/:id", async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(adminComment !== undefined && { adminComment }) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;