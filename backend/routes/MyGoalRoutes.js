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

// ADD progress log / update progress
router.patch("/:id/progress", async (req, res) => {
  try {
    const { progress, description } = req.body;
    const progressNum = Math.min(100, Math.max(0, Number(progress) || 0));
    const user = req.body.user || "Employee";

    const updateFields = {
      progress: progressNum,
      progressDescription: description || "",
    };

    if (progressNum >= 100) {
      updateFields.status = "Completed";
    } else if (progressNum > 0) {
      updateFields.status = "On Track";
    }

    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateFields,
        $push: {
          progressLogs: {
            progress: progressNum,
            description: description || "",
            user,
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
      success: true,
      goals: goal,
      goal,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE a specific progress log / note from a goal
router.delete("/:id/progress/:logId", async (req, res) => {
  try {
    const { id, logId } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Filter out target log by _id, index, or timestamp
    goal.progressLogs = (goal.progressLogs || []).filter((item, idx) => {
      if (item._id && String(item._id) === String(logId)) return false;
      if (String(idx) === String(logId)) return false;
      if (item.date && String(new Date(item.date).getTime()) === String(logId)) return false;
      return true;
    });

    if (goal.progressLogs.length > 0) {
      const sorted = [...goal.progressLogs].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      goal.progress = sorted[0].progress ?? 0;
      goal.progressDescription = sorted[0].description ?? "";
      goal.status = goal.progress >= 100 ? "Completed" : "On Track";
    } else {
      goal.progress = 0;
      goal.progressDescription = "";
      goal.status = "On Track";
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: "Progress note deleted successfully",
      goals: goal,
      goal,
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