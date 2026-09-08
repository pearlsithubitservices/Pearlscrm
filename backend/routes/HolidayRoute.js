const express = require('express');
const Holiday = require('../models/LeaveModels/Holidays');
const { getIO } = require('../Socket');

const multer = require('multer');
const XLSX = require('xlsx');

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

// ==============================
// CREATE SINGLE HOLIDAY
// ==============================
router.post("/", async (req, res) => {
  try {
    const holiday = await Holiday.create({
      holidayName: req.body.holidayName,
      holidayDate: req.body.holidayDate,
      holidayType: req.body.holidayType,
      description: req.body.description,
    });

    const io = getIO();
    if (io) {
      io.emit("holidayCreated", holiday);
    }

    res.status(201).json({
      success: true,
      holiday,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// GET ALL HOLIDAYS (with 2026 Auto-Seed if empty)
// ==============================
router.get("/", async (req, res) => {
  try {
    let holidays = await Holiday.find().sort({
      holidayDate: 1,
    });

    // Auto-seed if database is currently empty
    if (holidays.length === 0) {
      const defaultHolidays = [
        { holidayName: "New Year's Day", holidayDate: new Date("2026-01-01"), holidayType: "Public", description: "First day of the year" },
        { holidayName: "Pongal / Makar Sankranti", holidayDate: new Date("2026-01-14"), holidayType: "Festival", description: "Harvest festival celebrations" },
        { holidayName: "Republic Day", holidayDate: new Date("2026-01-26"), holidayType: "National", description: "National Republic Day" },
        { holidayName: "Tamil New Year / Puthandu", holidayDate: new Date("2026-04-14"), holidayType: "Festival", description: "Traditional Tamil New Year" },
        { holidayName: "May Day / Labor Day", holidayDate: new Date("2026-05-01"), holidayType: "Public", description: "International Workers' Day" },
        { holidayName: "Bakrid / Eid al-Adha", holidayDate: new Date("2026-05-27"), holidayType: "Festival", description: "Feast of Sacrifice" },
        { holidayName: "Independence Day", holidayDate: new Date("2026-08-15"), holidayType: "National", description: "Indian Independence Day" },
        { holidayName: "Ganesh Chaturthi", holidayDate: new Date("2026-09-14"), holidayType: "Festival", description: "Lord Ganesha festival" },
        { holidayName: "Gandhi Jayanti", holidayDate: new Date("2026-10-02"), holidayType: "National", description: "Mahatma Gandhi birthday" },
        { holidayName: "Diwali / Deepavali", holidayDate: new Date("2026-11-08"), holidayType: "Festival", description: "Festival of Lights" },
        { holidayName: "Christmas Day", holidayDate: new Date("2026-12-25"), holidayType: "Public", description: "Christmas celebrations" },
      ];

      try {
        holidays = await Holiday.insertMany(defaultHolidays);
      } catch (seedErr) {
        console.error("Auto-seed holidays error:", seedErr);
      }
    }

    res.status(200).json({
      success: true,
      holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// UPDATE HOLIDAY
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const updatedHoliday = await Holiday.findByIdAndUpdate(
      req.params.id,
      {
        holidayName: req.body.holidayName,
        holidayDate: req.body.holidayDate,
        holidayType: req.body.holidayType,
        description: req.body.description,
      },
      { new: true, runValidators: true }
    );

    if (!updatedHoliday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    const io = getIO();
    if (io) {
      io.emit("holidayUpdated", updatedHoliday);
    }

    res.status(200).json({
      success: true,
      holiday: updatedHoliday,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// DELETE HOLIDAY
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const deletedHoliday = await Holiday.findByIdAndDelete(
      req.params.id
    );

    if (!deletedHoliday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    const io = getIO();
    if (io) {
      io.emit("holidayDeleted", { id: req.params.id, holiday: deletedHoliday });
    }

    res.status(200).json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// BULK UPLOAD HOLIDAYS (Excel)
// ==============================
router.post(
  "/bulk-upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
      });

      const sheet =
        workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet);

      const holidays = rows.map((row) => ({
        holidayName: row["Holiday Name"],
        holidayDate: row["Holiday Date"],
        holidayType: row["Holiday Type"] || "Public",
        description: row["Description"] || "",
      }));

      await Holiday.insertMany(holidays);

      const io = getIO();
      if (io) {
        io.emit("holidaysBulkUploaded", { count: holidays.length });
      }

      res.status(200).json({
        success: true,
        count: holidays.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;