const express = require("express");
const router = express.Router();
const WhatsAppConnection = require("../../models/WhatsAppCampaign/WhatsAppConnection");
const { success, error } = require("../../utils/response");
const { isConfigured, getPhoneNumberInfo, getConfig } = require("../../config/whatsapp");

router.get("/status", async (req, res) => {
  try {
    const configured = isConfigured();
    let connection = await WhatsAppConnection.findOne().sort({ updatedAt: -1 });

    if (configured) {
      try {
        const phoneInfo = await getPhoneNumberInfo();
        connection = await WhatsAppConnection.findOneAndUpdate(
          { phoneNumberId: getConfig().phoneNumberId },
          {
            phoneNumberId: getConfig().phoneNumberId,
            businessAccountId: getConfig().businessAccountId,
            displayPhoneNumber: phoneInfo.display_phone_number,
            verifiedName: phoneInfo.verified_name,
            qualityRating: phoneInfo.quality_rating,
            status: "connected",
            lastSyncedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch {
        if (!connection) {
          connection = { status: "disconnected", displayPhoneNumber: null };
        }
      }
    }

    return success(res, {
      configured,
      connected: connection?.status === "connected",
      phoneNumber: connection?.displayPhoneNumber || null,
      verifiedName: connection?.verifiedName || null,
      qualityRating: connection?.qualityRating || null,
      lastSyncedAt: connection?.lastSyncedAt || null,
    });
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/config", async (req, res) => {
  try {
    const cfg = getConfig();
    return success(res, {
      phoneNumberId: cfg.phoneNumberId ? "••••" + cfg.phoneNumberId.slice(-4) : null,
      businessAccountId: cfg.businessAccountId ? "••••" + cfg.businessAccountId.slice(-4) : null,
      hasAccessToken: !!cfg.accessToken,
      hasWebhookToken: !!cfg.webhookVerifyToken,
      configured: isConfigured(),
    });
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
