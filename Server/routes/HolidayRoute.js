const express = require('express');
const Holiday = require('../models/LeaveModels/Holidays')

const multer =require('multer');
const XLSX = require('xlsx');

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

// Create Single Holiday
router.post("/", async (req, res) => {
  try {
    const holiday = await Holiday.create({
      holidayName: req.body.holidayName,
      holidayDate: req.body.holidayDate,
      holidayType: req.body.holidayType,
      description: req.body.description,
    });

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

// Get All Holidays
router.get("/", async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({
      holidayDate: 1,
    });

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

module.exports=router;