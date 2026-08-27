const express = require("express");

const router = express.Router();

const WhatsAppConfig = require("../../models/WhatsAppConfig");

// =====================================================
// GET WHATSAPP CONFIGURATION
// =====================================================

router.get("/", async (req, res) => {
  try {
    const config = await WhatsAppConfig.findOne();

    if (!config) {
      return res.json({
        success: true,
        connected: false,
        config: null,
      });
    }

    res.json({
      success: true,
      connected: config.connected,
      config,
    });
  } catch (error) {
    console.error("Get WhatsApp config error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get WhatsApp configuration",
    });
  }
});

// =====================================================
// SAVE WHATSAPP CONFIGURATION
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      phoneNumberId,
      businessAccountId,
      accessToken,
      webhookUrl,
      verifyToken,
    } = req.body;

    let config = await WhatsAppConfig.findOne();

    if (!config) {
      config = new WhatsAppConfig();
    }

    config.phoneNumberId = phoneNumberId || "";
    config.businessAccountId = businessAccountId || "";
    config.accessToken = accessToken || "";
    config.webhookUrl = webhookUrl || "";
    config.verifyToken = verifyToken || "";

    // Real Meta connection will be handled later.
    config.connected = false;

    await config.save();

    res.json({
      success: true,
      message: "WhatsApp configuration saved successfully",
      config,
    });
  } catch (error) {
    console.error("Save WhatsApp config error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save WhatsApp configuration",
    });
  }
});

// =====================================================
// TEST WHATSAPP CONNECTION
// =====================================================

router.post("/test", async (req, res) => {
  try {
    const config = await WhatsAppConfig.findOne();

    if (!config) {
      return res.status(400).json({
        success: false,
        connected: false,
        message: "WhatsApp configuration not found",
      });
    }

    // Meta API connection will be implemented later
    // when real WhatsApp credentials are available.

    res.json({
      success: true,
      connected: false,
      message:
        "WhatsApp configuration is saved. Meta connection is not configured yet.",
    });
  } catch (error) {
    console.error("Test WhatsApp connection error:", error);

    res.status(500).json({
      success: false,
      connected: false,
      message: "Failed to test WhatsApp configuration",
    });
  }
});

module.exports = router;