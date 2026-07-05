const express = require("express");
const router = express.Router();

const Policy = require("../models/ReimbursementPolicies");

// CREATE policy
router.post("/", async (req, res) => {
  try {
    const policy = await Policy.create(req.body);
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all policies
router.get("/", async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE policy
router.put("/:id", async (req, res) => {
  try {
    const updated = await Policy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE policy
router.delete("/:id", async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;