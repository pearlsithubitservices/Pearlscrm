// routes/attendanceCorrectionRoutes.js
const express = require("express");
const router = express.Router();
const AttendanceCorrection = require("../models/EmpAttendanceCorrection");

// CREATE Attendance Correction
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const newRequest = await AttendanceCorrection.create(data);

    res.status(201).json({
      success: true,
      message: "Attendance correction request submitted",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const data = await AttendanceCorrection.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await AttendanceCorrection.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;