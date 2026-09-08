const express = require("express");
const router = express.Router();
const Campaign = require("../../models/WhatsAppCampaign/Campaign");
const Broadcast = require("../../models/WhatsAppCampaign/Broadcast");
const { success, error } = require("../../utils/response");
const validateRequest = require("../../middlewares/validateRequest");
const { createCampaignSchema, updateCampaignSchema } = require("../../validators/campaignValidator");
const { buildAudience, getBuilderConfig } = require("../../services/campaignBuilderService");
const { queueCampaign } = require("../../jobs/workers");

router.get("/builder-config", async (req, res) => {
  try {
    const config = await getBuilderConfig();
    return success(res, config);
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return success(res, campaigns);
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("templateId");
    if (!campaign) return error(res, "Campaign not found", 404);
    return success(res, campaign);
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/", validateRequest(createCampaignSchema), async (req, res) => {
  try {
    const audience = await buildAudience(req.body.audienceFilters || {});
    const campaign = await Campaign.create({
      ...req.body,
      recipients: audience,
      audienceCount: audience.length,
      stats: { total: audience.length },
    });
    return success(res, campaign, "Campaign created", 201);
  } catch (err) {
    return error(res, err.message);
  }
});

router.put("/:id", validateRequest(updateCampaignSchema), async (req, res) => {
  try {
    if (req.body.audienceFilters) {
      const audience = await buildAudience(req.body.audienceFilters);
      req.body.recipients = audience;
      req.body.audienceCount = audience.length;
      req.body["stats.total"] = audience.length;
    }
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return error(res, "Campaign not found", 404);
    return success(res, campaign, "Campaign updated");
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/:id/queue", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return error(res, "Campaign not found", 404);

    if (campaign.deliveryMode === "schedule" && campaign.scheduledAt && new Date(campaign.scheduledAt) > new Date()) {
      campaign.status = "queued";
      await campaign.save();

      const scheduleLabel = new Date(campaign.scheduledAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      await Broadcast.findOneAndUpdate(
        { campaignId: campaign._id },
        {
          name: campaign.name,
          campaignId: campaign._id,
          audienceLabel: `${campaign.audienceCount} contacts`,
          audienceCount: campaign.audienceCount,
          scheduleLabel,
          scheduledAt: campaign.scheduledAt,
          status: "scheduled",
        },
        { upsert: true, new: true }
      );

      return success(res, campaign, `Campaign scheduled for ${scheduleLabel}`);
    }

    campaign.status = "queued";
    await campaign.save();

    await Broadcast.findOneAndUpdate(
      { campaignId: campaign._id },
      {
        name: campaign.name,
        campaignId: campaign._id,
        audienceLabel: `${campaign.audienceCount} contacts`,
        audienceCount: campaign.audienceCount,
        scheduleLabel:
          campaign.deliveryMode === "recurring"
            ? `Recurring ${campaign.recurring?.frequency || "weekly"}`
            : "Send Now",
        status: "active",
      },
      { upsert: true, new: true }
    );

    queueCampaign(campaign._id.toString());
    return success(res, campaign, "Campaign queued for sending");
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/audience-preview", async (req, res) => {
  try {
    const audience = await buildAudience(req.body);
    return success(res, { count: audience.length, sample: audience.slice(0, 5) });
  } catch (err) {
    return error(res, err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    return success(res, null, "Campaign deleted");
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
