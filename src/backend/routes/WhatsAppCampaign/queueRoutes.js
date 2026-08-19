const express = require("express");
const router = express.Router();
const Queue = require("../../models/WhatsAppCampaign/Queue");
const Campaign = require("../../models/WhatsAppCampaign/Campaign");
const MessageLog = require("../../models/WhatsAppCampaign/MessageLog");
const { success, error } = require("../../utils/response");
const { buildAudience } = require("../../services/campaignBuilderService");
const { getActiveCount } = require("../../jobs/workers");

router.get("/live", async (req, res) => {
  try {
    const activeQueue = await Queue.findOne({ status: "running" }).sort({ updatedAt: -1 });
    const runningCampaign = await Campaign.findOne({ status: "running" }).sort({ startedAt: -1 });

    const stats = {
      messagesSent: runningCampaign?.stats?.sent || 0,
      delivered: runningCampaign?.stats?.delivered || 0,
      failed: runningCampaign?.stats?.failed || 0,
      total: runningCampaign?.stats?.total || activeQueue?.totalMessages || 0,
      deliveryRate: runningCampaign?.stats?.sent
        ? ((runningCampaign.stats.delivered / runningCampaign.stats.sent) * 100).toFixed(1)
        : "0",
      failRate: runningCampaign?.stats?.sent
        ? ((runningCampaign.stats.failed / runningCampaign.stats.sent) * 100).toFixed(1)
        : "0",
      queue: activeQueue,
      activeWorkers: getActiveCount(),
      isLive: !!runningCampaign || !!activeQueue,
    };

    return success(res, stats);
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/logs/:campaignId", async (req, res) => {
  try {
    const logs = await MessageLog.find({ campaignId: req.params.campaignId })
      .sort({ createdAt: -1 })
      .limit(100);
    return success(res, logs);
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/audience-preview", async (req, res) => {
  try {
    const audience = await buildAudience(req.body);
    return success(res, { count: audience.length });
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
