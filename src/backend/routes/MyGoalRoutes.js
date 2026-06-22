const express = require("express");
const router = express.Router();
const Goal = require("../models/Performance/MyGoal");

// CREATE goal
router.post("/", async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single goal
router.get("/:id", async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE goal (progress update)
router.put("/:id", async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD progress log
router.patch("/:id/progress", async (req, res) => {
  try {
    const { progress, description } = req.body;

    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          progress,
          progressDescription: description,
        },
        $push: {
          progressLogs: {
            progress,
            description,
            date: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.status(200).json({
      goals: goal,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE goal
router.delete("/:id", async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;