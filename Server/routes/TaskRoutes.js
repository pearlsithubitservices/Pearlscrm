const express = require("express");

const router = express.Router();

const Task = require("../models/TaskModels/Task");

//create Task

router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get Task
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).populate("assignedTo");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/recent/:employee_uid", async (req, res) => {
  try {
    const recentTasks = await Task.find({
      assignedTo: req.params.employee_uid,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: recentTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//Get Task by ID
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

//Update Task
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