const express = require("express");
const router = express.Router();

const Leave = require("../models/LeaveModels/Leavemanegement");
const TotalLeave = require("../models/LeaveModels/TotalLeaveModel");
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
      io.emit("leaveCreated", leave);
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

    const existingLeave = await Leave.findById(req.params.id);
    if (!existingLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    const previousStatus = existingLeave.status;
    existingLeave.status = status;
    const updatedLeave = await existingLeave.save();

    // Auto-deduct or refund leave balance in TotalLeave
    if (previousStatus !== status && updatedLeave.employeeId) {
      try {
        const leaveType = (updatedLeave.leaveType || "").toLowerCase();
        let fieldToUpdate = null;
        if (leaveType.includes("annual")) {
          fieldToUpdate = "annualLeave";
        } else if (leaveType.includes("sick")) {
          fieldToUpdate = "sickLeave";
        } else if (
          leaveType.includes("personal") ||
          leaveType.includes("casual") ||
          leaveType.includes("emergency")
        ) {
          fieldToUpdate = "personalLeave";
        }

        if (fieldToUpdate) {
          const days = Number(updatedLeave.leaveDays) || 1;
          let empTotalLeave = await TotalLeave.findOne({ employeeId: updatedLeave.employeeId });
          if (!empTotalLeave) {
            empTotalLeave = await TotalLeave.create({
              employeeId: updatedLeave.employeeId,
              annualLeave: 12,
              sickLeave: 15,
              personalLeave: 10,
            });
          }

          if (status === "Approved" && previousStatus !== "Approved") {
            // Deduct balance
            empTotalLeave[fieldToUpdate] = Math.max(0, (empTotalLeave[fieldToUpdate] || 0) - days);
            await empTotalLeave.save();
          } else if (previousStatus === "Approved" && status !== "Approved") {
            // Refund balance
            empTotalLeave[fieldToUpdate] = (empTotalLeave[fieldToUpdate] || 0) + days;
            await empTotalLeave.save();
          }
        }
      } catch (deductErr) {
        console.error("TotalLeave balance update error:", deductErr);
      }
    }

    // Broadcast Real-time event to all connected sockets
    const empId = updatedLeave.employeeId;
    const notifData = {
      title: `Leave ${status}`,
      sub: `Your ${updatedLeave.leaveType} leave request (${new Date(
        updatedLeave.leaveFrom
      ).toLocaleDateString()} - ${new Date(updatedLeave.leaveTo).toLocaleDateString()}) has been ${status.toLowerCase()}.`,
      notificationType: "Leave",
      employeeId: empId,
    };

    if (empId) {
      await Notification.create(notifData).catch((err) =>
        console.error("Notification creation failed:", err)
      );
    }

    const io = getIO();
    if (io) {
      if (empId) io.to("user_" + empId).emit("newNotification", notifData);
      io.emit("newNotification", notifData);
      // Real-time synchronization events
      io.emit("leaveStatusUpdated", updatedLeave);
      io.emit("leaveUpdated", updatedLeave);
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
    const updateData = { ...req.body };
    if (updateData.leaveFrom && updateData.leaveTo) {
      const startDate = new Date(updateData.leaveFrom);
      const endDate = new Date(updateData.leaveTo);
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate >= startDate) {
        updateData.leaveDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
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

    const io = getIO();
    if (io) {
      io.emit("leaveUpdated", updatedLeave);
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
    const leaveToDelete = await Leave.findById(req.params.id);
    if (!leaveToDelete) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    // If deleting an approved leave, refund the balance
    if (leaveToDelete.status === "Approved" && leaveToDelete.employeeId) {
      try {
        const leaveType = (leaveToDelete.leaveType || "").toLowerCase();
        let fieldToUpdate = null;
        if (leaveType.includes("annual")) {
          fieldToUpdate = "annualLeave";
        } else if (leaveType.includes("sick")) {
          fieldToUpdate = "sickLeave";
        } else if (
          leaveType.includes("personal") ||
          leaveType.includes("casual") ||
          leaveType.includes("emergency")
        ) {
          fieldToUpdate = "personalLeave";
        }

        if (fieldToUpdate) {
          const days = Number(leaveToDelete.leaveDays) || 1;
          const empTotalLeave = await TotalLeave.findOne({ employeeId: leaveToDelete.employeeId });
          if (empTotalLeave) {
            empTotalLeave[fieldToUpdate] = (empTotalLeave[fieldToUpdate] || 0) + days;
            await empTotalLeave.save();
          }
        }
      } catch (refundErr) {
        console.error("Refund on delete failed:", refundErr);
      }
    }

    await Leave.findByIdAndDelete(req.params.id);

    const io = getIO();
    if (io) {
      io.emit("leaveDeleted", { id: req.params.id, leave: leaveToDelete });
    }

    res.status(200).json({ success: true, leave: leaveToDelete });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;