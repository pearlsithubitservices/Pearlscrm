const MessageLog = require("../models/WhatsAppCampaign/MessageLog");
const Campaign = require("../models/WhatsAppCampaign/Campaign");
const logger = require("../utils/logger");
const { saveDailySnapshot } = require("../services/analyticsService");

const updateMessageStatus = async (whatsappMessageId, status, timestamp) => {
  const log = await MessageLog.findOne({ whatsappMessageId });
  if (!log) return;

  log.status = status;
  if (status === "delivered") log.deliveredAt = timestamp || new Date();
  if (status === "read") log.readAt = timestamp || new Date();
  await log.save();

  if (log.campaignId) {
    const campaign = await Campaign.findById(log.campaignId);
    if (campaign) {
      if (status === "delivered") campaign.stats.delivered += 1;
      if (status === "read") campaign.stats.read += 1;
      if (status === "clicked") campaign.stats.clicked = (campaign.stats.clicked || 0) + 1;
      if (status === "failed") campaign.stats.failed += 1;
      await campaign.save();
    }
  }
};

const handleWebhookPayload = async (body) => {
  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value;
      if (!value?.statuses) continue;

      for (const statusUpdate of value.statuses) {
        const { id, status, timestamp } = statusUpdate;
        await updateMessageStatus(id, status, timestamp ? new Date(timestamp * 1000) : new Date());
        logger.info("Webhook status update", { id, status });
      }
    }
  }
};

const computeDailyAnalytics = async () => saveDailySnapshot();

module.exports = { handleWebhookPayload, computeDailyAnalytics, updateMessageStatus };
