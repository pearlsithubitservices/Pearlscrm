const express = require("express");
const router = express.Router();

const Leave = require("../models/LeaveModels/Leavemanegement");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");

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

    if (!leaveTitle || !leaveReason || !leaveFrom || !leaveTo || !employeeId || !employeeName || !department || !leaveType) {
      return res.status(400).json({ success: false, message: "All required leave fields must be provided" });
    }

    const startDate = new Date(leaveFrom);
    const endDate = new Date(leaveTo);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return res.status(400).json({ success: false, message: "Invalid leave date range" });
    }

    const calculatedLeaveDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      leaveTitle,
      leaveReason,
      leaveFrom,
      leaveTo,
      leaveDays: calculatedLeaveDays,
      employeeName,
      employeeId,
      managerName,
      managerId,
      department,
      leaveType,
      status: "Pending",
    });

    // Notify the manager (and HR/admin) that a new leave request came in
    const notifData = {
      title: "New Leave Request",
      sub: `${employeeName} applied for ${leaveType} leave (${calculatedLeaveDays} day${calculatedLeaveDays > 1 ? "s" : ""}) from ${new Date(leaveFrom).toLocaleDateString()} to ${new Date(leaveTo).toLocaleDateString()}.`,
      notificationType: "Leave",
      employeeId: managerId || null,
      senderId: employeeId,
    };
    await Notification.create(notifData).catch((err) =>
      console.error("Notification creation failed:", err)
    );

    const io = getIO();
    if (io) {
      if (managerId) io.to("user_" + managerId).emit("newNotification", notifData);
      io.emit("newNotification", notifData);
    }

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

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid leave status" });
    }

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

    // Notify the employee that their leave request has been actioned
    const empId = updatedLeave.employeeId;
    if (empId) {
      const notifData = {
        title: `Leave ${status}`,
        sub: `Your ${updatedLeave.leaveType} leave request (${new Date(
          updatedLeave.leaveFrom
        ).toLocaleDateString()} - ${new Date(updatedLeave.leaveTo).toLocaleDateString()}) has been ${status.toLowerCase()}.`,
        notificationType: "Leave",
        employeeId: empId,
      };
      await Notification.create(notifData).catch((err) =>
        console.error("Notification creation failed:", err)
      );

      const io = getIO();
      if (io) {
        io.to("user_" + empId).emit("newNotification", notifData);
        io.emit("newNotification", notifData);
      }
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

// =====================
// DELETE LEAVE REQUEST
// =====================
router.delete("/:id", async (req, res) => {
  try {
    const deletedLeave = await Leave.findByIdAndDelete(req.params.id);
    if (!deletedLeave) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }
    res.status(200).json({ success: true, leave: deletedLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;