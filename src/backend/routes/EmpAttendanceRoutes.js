const express = require("express");
const router = express.Router();

const EmpAttendanceModel = require("../models/EmpAttendanceModel");
const {
  calculateAttendanceStatus,
} = require("../../Utils/formatNumber");


// =====================================================
// DATE HELPERS
// =====================================================

const parseDateOnly = (dateString) => {
  if (!dateString) return null;

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  const parsed = new Date(
    year,
    month,
    day
  );

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
};


const findAttendanceForDate = async (
  employee_uid,
  dateString
) => {
  const startOfDay = parseDateOnly(
    dateString
  );

  if (!startOfDay) {
    return null;
  }

  const endOfDay = new Date(
    startOfDay
  );

  endOfDay.setDate(
    endOfDay.getDate() + 1
  );

  let attendance =
    await EmpAttendanceModel.findOne({
      employee_uid,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

  if (!attendance) {
    attendance =
      await EmpAttendanceModel.findOne({
        employee_uid,
        date: startOfDay,
      });
  }

  return attendance;
};


// =====================================================
// GET ALL ATTENDANCE
// =====================================================

router.get("/", async (req, res) => {
  try {
    const attendances =
      await EmpAttendanceModel.find()
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances,
    });

  } catch (err) {

    console.error(
      "Failed to get attendance:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// =====================================================
// GET ACTIVE ATTENDANCE
// =====================================================
// Employees currently clocked in / working.

router.get("/active", async (req, res) => {
  try {
    const attendances =
      await EmpAttendanceModel.find({
        isOnline: true,
      }).sort({
        clockIn: -1,
      });

    res.status(200).json(
      attendances
    );

  } catch (err) {

    console.error(
      "Failed to get active attendance:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// =====================================================
// GET ATTENDANCE HISTORY
// =====================================================
// Returns all attendance records.

router.get("/history", async (req, res) => {
  try {
    const attendances =
      await EmpAttendanceModel.find()
        .sort({
          date: -1,
          clockIn: -1,
        });

    res.status(200).json(
      attendances
    );

  } catch (err) {

    console.error(
      "Failed to get attendance history:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// =====================================================
// CLOCK IN
// =====================================================

router.post(
  "/clock-in",
  async (req, res) => {
    try {
      const {
        employee_uid,
        employee_name,
        department,
        date,
      } = req.body;

      const startOfDay =
        parseDateOnly(date);

      let attendance =
        await findAttendanceForDate(
          employee_uid,
          date
        );

      // Uncomment this if you want to prevent
      // an employee from clocking in twice.
      /*
      if (
        attendance?.clockIn &&
        !attendance.clockOut
      ) {
        return res.status(400).json({
          success: false,
          message: "Already clocked in",
        });
      }
      */

      if (!attendance) {
        attendance =
          new EmpAttendanceModel({
            employee_uid,
            employee_name,
            department,
            date: startOfDay,
            clockIn: new Date(),
            isOnline: true,
            status: "present",
            attendanceState: "working",
          });

      } else {
        attendance.clockIn =
          new Date();

        attendance.isOnline =
          true;

        attendance.status =
          "present";

        attendance.attendanceState =
          "working";
      }

      await attendance.save();

      res.status(200).json({
        success: true,
        message:
          "Clocked in successfully",
        data: attendance,
      });

    } catch (err) {

      console.error(
        "Clock in failed:",
        err
      );

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);


// =====================================================
// CLOCK OUT
// =====================================================

router.post(
  "/clock-out",
  async (req, res) => {
    try {
      const {
        employee_uid,
      } = req.body;

      console.log(req.body);

      const attendance =
        await EmpAttendanceModel.findOne({
          employee_uid,
          clockIn: {
            $ne: null,
          },
        }).sort({
          clockIn: -1,
        });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            "Attendance not found",
        });
      }

      if (!attendance.clockIn) {
        return res.status(400).json({
          success: false,
          message:
            "Employee has not clocked in",
        });
      }

      attendance.clockOut =
        new Date();

      attendance.isOnline =
        false;

      attendance.attendanceState =
        "clocked_out";

      let totalBreakSeconds = 0;

      attendance.breaks.forEach(
        (b) => {
          totalBreakSeconds +=
            b.duration || 0;
        }
      );

      attendance.workingHours =
        Math.max(
          0,
          (
            attendance.clockOut -
            attendance.clockIn
          ) / 1000 -
          totalBreakSeconds
        );

      attendance.status =
        calculateAttendanceStatus(
          attendance.clockIn,
          attendance.clockOut,
          attendance.workingHours
        );

      await attendance.save();

      res.status(200).json({
        success: true,
        message:
          "Clocked out successfully",
        data: attendance,
      });

    } catch (err) {

      console.error(
        "Clock out failed:",
        err
      );

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);


// =====================================================
// START BREAK
// =====================================================

router.post(
  "/break/start",
  async (req, res) => {
    try {
      const {
        employee_uid,
        date,
      } = req.body;

      const attendance =
        await findAttendanceForDate(
          employee_uid,
          date
        );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            "Attendance not found",
        });
      }

      const activeBreak =
        attendance.breaks.find(
          (b) => !b.end
        );

      if (activeBreak) {
        return res.status(400).json({
          success: false,
          message:
            "Break already started",
        });
      }

      attendance.breaks.push({
        start: new Date(),
      });

      attendance.status =
        "present";

      attendance.isOnline =
        false;

      attendance.attendanceState =
        "break";

      await attendance.save();

      res.status(200).json({
        success: true,
        message:
          "Break started",
        data: attendance,
      });

    } catch (err) {

      console.error(
        "Break start failed:",
        err
      );

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);


// =====================================================
// END BREAK
// =====================================================

router.post(
  "/break/end",
  async (req, res) => {
    try {
      const {
        employee_uid,
        date,
      } = req.body;

      const attendance =
        await findAttendanceForDate(
          employee_uid,
          date
        );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            "Attendance not found",
        });
      }

      const activeBreak =
        attendance.breaks.find(
          (b) => !b.end
        );

      if (!activeBreak) {
        return res.status(400).json({
          success: false,
          message:
            "No active break found",
        });
      }

      activeBreak.end =
        new Date();

      activeBreak.duration =
        Math.floor(
          (
            activeBreak.end -
            activeBreak.start
          ) / 1000
        );

      attendance.status =
        "present";

      attendance.isOnline =
        true;

      attendance.attendanceState =
        "working";

      await attendance.save();

      res.status(200).json({
        success: true,
        message:
          "Break ended",
        data: attendance,
      });

    } catch (err) {

      console.error(
        "Break end failed:",
        err
      );

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);


// =====================================================
// GET ATTENDANCE BY EMPLOYEE UID
// =====================================================

router.get(
  "/employee/:employee_uid",
  async (req, res) => {
    try {
      const {
        employee_uid,
      } = req.params;

      const attendance =
        await EmpAttendanceModel.find({
          employee_uid,
        }).sort({
          date: -1,
        });

      res.status(200).json({
        success: true,
        count:
          attendance.length,
        data:
          attendance,
      });

    } catch (err) {

      console.error(
        "Failed to get employee attendance:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message,
      });
    }
  }
);


// =====================================================
// UPDATE ATTENDANCE
// =====================================================

router.put(
  "/:id",
  async (req, res) => {
    try {
      const {
        clockIn,
        clockOut,
        breaks,
        status,
        isOnline,
      } = req.body;

      const attendance =
        await EmpAttendanceModel.findById(
          req.params.id
        );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            "Attendance not found",
        });
      }

      attendance.clockIn =
        clockIn
          ? new Date(clockIn)
          : attendance.clockIn;

      attendance.clockOut =
        clockOut
          ? new Date(clockOut)
          : attendance.clockOut;

      attendance.breaks =
        breaks ||
        attendance.breaks;

      attendance.isOnline =
        isOnline !== undefined
          ? isOnline
          : attendance.isOnline;

      // Recalculate break durations.
      attendance.breaks.forEach(
        (b) => {
          if (
            b.start &&
            b.end
          ) {
            b.duration =
              Math.max(
                0,
                Math.floor(
                  (
                    new Date(b.end) -
                    new Date(b.start)
                  ) / 1000
                )
              );
          } else {
            b.duration = 0;
          }
        }
      );

      // Recalculate working hours.
      if (
        attendance.clockIn &&
        attendance.clockOut
      ) {
        let totalBreakSeconds = 0;

        attendance.breaks.forEach(
          (b) => {
            totalBreakSeconds +=
              b.duration || 0;
          }
        );

        attendance.workingHours =
          Math.max(
            0,
            Math.floor(
              (
                attendance.clockOut -
                attendance.clockIn
              ) / 1000
            ) -
            totalBreakSeconds
          );
      }

      if (status) {
        attendance.status =
          status;
      } else {
        attendance.status =
          calculateAttendanceStatus(
            attendance.clockIn,
            attendance.clockOut,
            attendance.workingHours
          );
      }

      await attendance.save();

      res.status(200).json({
        success: true,
        message:
          "Attendance updated successfully",
        data:
          attendance,
      });

    } catch (err) {

      console.error(
        "Attendance update failed:",
        err
      );

      res.status(500).json({
        success: false,
        error:
          err.message,
      });
    }
  }
);


// =====================================================
// MARK ABSENT
// =====================================================

router.post(
  "/mark-absent",
  async (req, res) => {
    try {
      const {
        employee_uid,
      } = req.body;

      if (!employee_uid) {
        return res.status(400).json({
          success: false,
          message:
            "employee_uid is required",
        });
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      const existingAttendance =
        await EmpAttendanceModel.findOne({
          employee_uid,
          date: {
            $gte: today,
            $lt: tomorrow,
          },
        });

      if (existingAttendance) {
        return res.status(200).json({
          success: true,
          message:
            "Attendance already exists",
          data:
            existingAttendance,
        });
      }

      const attendance =
        await EmpAttendanceModel.create({
          employee_uid,
          date:
            today,
          status:
            "absent",
          isOnline:
            false,
          breaks:
            [],
          workingHours:
            0,
        });

      res.status(201).json({
        success: true,
        message:
          "Absent attendance created",
        data:
          attendance,
      });

    } catch (err) {

      console.error(
        "Mark absent failed:",
        err
      );

      res.status(500).json({
        success: false,
        error:
          err.message,
      });
    }
  }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;