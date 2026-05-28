const express = require("express");

const router = express.Router();

const Task = require("../models/Task");

router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {

  try {

    const task = await Task.findById(req.params.id);

    res.json(task);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

router.put('/:id', async (req, res) => {

  try {

    const updatedTask =
      await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(updatedTask);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;