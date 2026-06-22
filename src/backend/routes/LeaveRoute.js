const express = require("express");
const router = express.Router();

const Leave = require("../models/LeaveModels/Leavemanegement");

// =====================
// TEST ROUTE
// =====================
router.get("/test", (req, res) => {
  res.send("Leave Route Working");
});

// =====================
// CREATE LEAVE
// =====================
router.post("/", async (req, res) => {
  try {
    const {
      leaveTitle,
      leaveReason,
      leaveFrom,
      leaveTo,
      leaveDays,
      employeeName,
      employeeId,
      managerName,
      managerId,
      department,
      leaveType,
    } = req.body;

    const leave = await Leave.create({
      leaveTitle,
      leaveReason,
      leaveFrom,
      leaveTo,
      leaveDays,
      employeeName,
      employeeId,
      managerName,
      managerId,
      department,
      leaveType,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================
// GET ALL LEAVES
// =====================
router.get("/", async (req, res) => {
  try {
    const leave = await Leave.find().sort({ createdAt: -1 });
    res.json(leave);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =====================
// GET LEAVES BY EMPLOYEE
// =====================
router.post("/by-employee", async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required",
      });
    }

    const leaves = await Leave.find({ employeeId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================
// UPDATE STATUS
// =====================
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

   

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    res.status(200).json({
      success: true,
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================
// UPDATE LEAVE
// =====================
router.put("/:id", async (req, res) => {
  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      leave: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;