const express = require("express");
const router = express.Router();
const Template = require("../../models/WhatsAppCampaign/Template");
const { success, error } = require("../../utils/response");
const validateRequest = require("../../middlewares/validateRequest");
const { createTemplateSchema } = require("../../validators/templateValidator");
const { syncTemplatesFromMeta } = require("../../jobs/syncTemplateJob");

router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    return success(res, templates);
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/", validateRequest(createTemplateSchema), async (req, res) => {
  try {
    const template = await Template.create(req.body);
    return success(res, template, "Template created", 201);
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/sync", async (req, res) => {
  try {
    const result = await syncTemplatesFromMeta();
    const templates = await Template.find().sort({ createdAt: -1 });
    return success(res, { ...result, templates }, "Templates synced from Meta");
  } catch (err) {
    return error(res, err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    return success(res, null, "Template deleted");
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
