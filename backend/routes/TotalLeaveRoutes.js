const express = require("express");
const router = express.Router();
const TotalLeave = require("../models/LeaveModels/TotalLeaveModel");


// ================= CREATE =================
router.post("/", async (req, res) => {
  try {
    const data = await TotalLeave.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const data = await TotalLeave.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= GET BY EMPLOYEE =================
router.get("/:employeeId", async (req, res) => {
  try {
    const data = await TotalLeave.findOne({
      employeeId: req.params.employeeId,
    });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= UPDATE =================
router.put("/:employeeId", async (req, res) => {
  try {
    const data = await TotalLeave.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      req.body,
      { new: true }
    );

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;