// routes/attendanceCorrectionRoutes.js
const express = require("express");
const router = express.Router();
const AttendanceCorrection = require("../models/EmpAttendanceCorrection");

// CREATE Attendance Correction
router.post("/", async (req, res) => {
  try {
    const data = req.body || {};

    const payload = {
      employeeId: data.employeeId || "EMP-001",
      fullName: data.fullName || "Employee",
      department: data.department || "General",
      managerId: data.managerId || "ADMIN-01",
      managerName: data.managerName || "Admin",
      correctionType: data.correctionType || "Missed Check-In",
      date: data.date ? new Date(data.date) : new Date(),
      correctCheckIn: data.correctCheckIn || "09:00",
      correctCheckOut: data.correctCheckOut || "18:00",
      workMode: data.workMode || "In Office",
      reason: data.reason || "Attendance Correction Request",
      status: "Pending",
    };

    const newRequest = await AttendanceCorrection.create(payload);

    try {
      const { getIO } = require("../Socket");
      getIO()?.emit("correctionStatusUpdated", { newRequest });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: "Attendance correction request submitted",
      data: newRequest,
    });
  } catch (error) {
    console.error("Attendance correction create error:", error);
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

    // If Approved, update the existing employee's attendance record for that date in-place
    if (status === "Approved" && updated.date) {
      try {
        const EmpAttendanceModel = require("../models/EmpAttendanceModel");
        const { calculateAttendanceStatus } = require("../../Utils/formatNumber");
        
        const reqDate = new Date(updated.date);
        const startOfDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate(), 23, 59, 59, 999);

        // 1. Try finding existing attendance record by employee_uid/name AND date range
        let attendance = await EmpAttendanceModel.findOne({
          $or: [
            { employee_uid: updated.employeeId },
            { employee_uid: new RegExp(`^${updated.employeeId}$`, "i") },
            { employee_name: new RegExp(`^${updated.fullName}$`, "i") }
          ],
          $or: [
            { date: { $gte: startOfDay, $lte: endOfDay } },
            { clockIn: { $gte: startOfDay, $lte: endOfDay } }
          ]
        });

        // 2. If not found by date range, try finding any record for that employee on that same calendar day
        if (!attendance && updated.employeeId) {
          const allRecords = await EmpAttendanceModel.find({
            $or: [
              { employee_uid: updated.employeeId },
              { employee_uid: new RegExp(`^${updated.employeeId}$`, "i") },
              { employee_name: new RegExp(`^${updated.fullName}$`, "i") }
            ]
          });

          attendance = allRecords.find((rec) => {
            const rDate = rec.clockIn || rec.date;
            if (!rDate) return false;
            return new Date(rDate).toDateString() === reqDate.toDateString();
          });
        }

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

        const calculatedStatus = calculateAttendanceStatus ? calculateAttendanceStatus(cIn, cOut, workingSecs) : "present";

        if (attendance) {
          // UPDATE EXISTING RECORD IN-PLACE
          if (cIn) attendance.clockIn = cIn;
          if (cOut) attendance.clockOut = cOut;
          attendance.workingHours = workingSecs;
          attendance.attendanceState = "clocked_out";
          attendance.isOnline = false;
          attendance.status = calculatedStatus || "present";
          if (updated.workMode) attendance.location = updated.workMode;
          await attendance.save();
        } else {
          // ONLY CREATE IF ABSOLUTELY NO RECORD EXISTED FOR THAT DAY
          attendance = await EmpAttendanceModel.create({
            employee_uid: updated.employeeId,
            employee_name: updated.fullName,
            department: updated.department,
            date: startOfDay,
            clockIn: cIn,
            clockOut: cOut,
            isOnline: false,
            status: calculatedStatus || "present",
            attendanceState: "clocked_out",
            workingHours: workingSecs,
            location: updated.workMode || "Office",
          });
        }

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