const express = require("express");

const router = express.Router();

const Settings = require("../../models/settings");

// =====================================================
// GET SETTINGS
// =====================================================

router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exists
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE / UPDATE SETTINGS
// =====================================================

router.put("/", async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyWebsite,
      timeZone,
      dateFormat,
      currency,
      emailNotifications,
      systemNotifications,
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    settings.companyName = companyName ?? settings.companyName;
    settings.companyEmail = companyEmail ?? settings.companyEmail;
    settings.companyPhone = companyPhone ?? settings.companyPhone;
    settings.companyWebsite = companyWebsite ?? settings.companyWebsite;

    settings.timeZone = timeZone ?? settings.timeZone;
    settings.dateFormat = dateFormat ?? settings.dateFormat;
    settings.currency = currency ?? settings.currency;

    if (typeof emailNotifications === "boolean") {
      settings.emailNotifications = emailNotifications;
    }

    if (typeof systemNotifications === "boolean") {
      settings.systemNotifications = systemNotifications;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("SAVE SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save settings",
      error: error.message,
    });
  }
});

module.exports = router;