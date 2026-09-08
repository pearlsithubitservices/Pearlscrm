const express = require("express");
const router = express.Router();
const Broadcast = require("../../models/WhatsAppCampaign/Broadcast");
const { success, error } = require("../../utils/response");
const validateRequest = require("../../middlewares/validateRequest");
const { createBroadcastSchema } = require("../../validators/broadcastValidator");

router.get("/", async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate("campaignId", "name status stats")
      .sort({ createdAt: -1 });
    return success(res, broadcasts);
  } catch (err) {
    return error(res, err.message);
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Broadcast.countDocuments({
      status: { $in: ["scheduled", "active"] },
    });
    return success(res, { count });
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/", validateRequest(createBroadcastSchema), async (req, res) => {
  try {
    const broadcast = await Broadcast.create(req.body);
    return success(res, broadcast, "Broadcast created", 201);
  } catch (err) {
    return error(res, err.message);
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const broadcast = await Broadcast.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    return success(res, broadcast, "Status updated");
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
