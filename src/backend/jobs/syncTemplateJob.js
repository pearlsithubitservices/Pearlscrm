const { fetchTemplates, isConfigured } = require("../config/whatsapp");
const Template = require("../models/WhatsAppCampaign/Template");
const logger = require("../utils/logger");

const syncTemplatesFromMeta = async () => {
  if (!isConfigured()) {
    logger.warn("WhatsApp not configured, skipping template sync");
    return { synced: 0 };
  }

  const metaTemplates = await fetchTemplates();
  let synced = 0;

  for (const tpl of metaTemplates) {
  const bodyComponent = tpl.components?.find((c) => c.type === "BODY");
    await Template.findOneAndUpdate(
      { name: tpl.name },
      {
        name: tpl.name,
        category: tpl.category,
        language: tpl.language,
        status: tpl.status,
        body: bodyComponent?.text || "",
        metaTemplateId: tpl.id,
        syncedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    synced++;
  }

  return { synced };
};

module.exports = { syncTemplatesFromMeta };
