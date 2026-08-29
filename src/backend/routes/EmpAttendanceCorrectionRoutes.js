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

    // If Approved, update or create the employee's attendance record for that date
    if (status === "Approved" && updated.employeeId && updated.date) {
      try {
        const EmpAttendanceModel = require("../models/EmpAttendanceModel");
        
        const reqDate = new Date(updated.date);
        const startOfDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        let attendance = await EmpAttendanceModel.findOne({
          employee_uid: updated.employeeId,
          date: { $gte: startOfDay, $lt: endOfDay },
        });

        const parseTimeToDate = (timeStr, baseDate) => {
          if (!timeStr) return null;
          const [hrs, mins] = timeStr.split(":").map(Number);
          const d = new Date(baseDate);
          d.setHours(hrs || 0, mins || 0, 0, 0);
          return d;
        };

        const cIn = parseTimeToDate(updated.correctCheckIn, startOfDay);
        const cOut = parseTimeToDate(updated.correctCheckOut, startOfDay);
        let workingSecs = 0;

        if (cIn && cOut && cOut >= cIn) {
          workingSecs = Math.floor((cOut.getTime() - cIn.getTime()) / 1000);
        }

        if (!attendance) {
          attendance = new EmpAttendanceModel({
            employee_uid: updated.employeeId,
            employee_name: updated.fullName,
            department: updated.department,
            date: startOfDay,
            clockIn: cIn,
            clockOut: cOut,
            isOnline: false,
            status: "present",
            attendanceState: "clocked_out",
            workingHours: workingSecs,
            location: updated.workMode || "Office",
          });
        } else {
          if (cIn) attendance.clockIn = cIn;
          if (cOut) attendance.clockOut = cOut;
          attendance.workingHours = workingSecs;
          attendance.attendanceState = "clocked_out";
          attendance.isOnline = false;
          attendance.status = "present";
        }

        await attendance.save();

        try {
          const { getIO } = require("../Socket");
          getIO()?.emit("attendanceUpdated", { employee_uid: updated.employeeId, attendance });
        } catch (e) {}
      } catch (err) {
        console.error("Error auto-updating attendance record:", err);
      }
    }

    try {
      const { getIO } = require("../Socket");
      getIO()?.emit("correctionStatusUpdated", { updated });
    } catch (e) {}

    res.status(200).json({
      success: true,
      message: `Correction request ${status} successfully`,
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