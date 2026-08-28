let activeCampaigns = new Map();

const queueCampaign = (campaignId) => {
  if (activeCampaigns.has(campaignId)) {
    return { alreadyRunning: true };
  }

  const { processCampaign } = require("./sendCampaignJob");
  const job = processCampaign(campaignId)
    .catch((err) => console.error("Campaign job error:", err))
    .finally(() => activeCampaigns.delete(campaignId));

  activeCampaigns.set(campaignId, job);
  return { queued: true };
};

const getActiveCount = () => activeCampaigns.size;

module.exports = { queueCampaign, getActiveCount };
