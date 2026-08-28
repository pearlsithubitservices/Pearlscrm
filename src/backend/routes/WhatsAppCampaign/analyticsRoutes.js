const express = require("express");
const router = express.Router();
const { success, error } = require("../../utils/response");
const { getDashboard, saveDailySnapshot } = require("../../services/analyticsService");

router.get("/dashboard", async (req, res) => {
  try {
    const period = req.query.period === "all" ? 0 : Number(req.query.period) || 30;
    const dashboard = await getDashboard(period);
    return success(res, dashboard);
  } catch (err) {
    return error(res, err.message);
  }
});

router.post("/refresh", async (req, res) => {
  try {
    await saveDailySnapshot();
    const period = req.query.period === "all" ? 0 : Number(req.query.period) || 30;
    const dashboard = await getDashboard(period);
    return success(res, dashboard, "Analytics refreshed");
  } catch (err) {
    return error(res, err.message);
  }
});

module.exports = router;
