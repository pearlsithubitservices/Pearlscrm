const MessageLog = require("../models/WhatsAppCampaign/MessageLog");
const { processCampaign } = require("./sendCampaignJob");
const logger = require("../utils/logger");

const retryFailedMessages = async (campaignId) => {
  const failedLogs = await MessageLog.find({
    campaignId,
    status: "failed",
    retryCount: { $lt: 3 },
  }).limit(50);

  let retried = 0;
  for (const log of failedLogs) {
    log.retryCount += 1;
    log.status = "queued";
    await log.save();
    retried++;
  }

  logger.info("Retry queued", { campaignId, retried });
  return retried;
};

module.exports = { retryFailedMessages };
