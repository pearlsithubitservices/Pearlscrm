const express = require("express");
const router = express.Router();
const { verifyWebhook, verifySignature } = require("../../middlewares/webhook");
const { handleWebhookPayload } = require("../../jobs/analyticsJob");

router.get("/", verifyWebhook);

router.post("/", verifySignature, async (req, res) => {
  try {
    await handleWebhookPayload(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200);
  }
});

module.exports = router;
