const express = require("express");

const router = express.Router();

const Lead = require("../models/Leads");
const Task = require("../models/TaskModels/Task");
const Payment = require("../models/Payment");

router.get("/", async (req, res) => {

  try {

    const totalLeads =
      await Lead.countDocuments();

    const pendingTasks =
      await Task.countDocuments({
        status: "Pending",
      });

    const completedTasks =
      await Task.countDocuments({
        status: "Completed",
      });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await Payment.aggregate([
      {
        $match: {
          issuedDate: { $gte: monthStart },
          status: { $nin: ["Cancelled", "cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$budget" },
        },
      },
    ]);

    const recentLeads =
      await Lead.find()
        .sort({ createdAt: -1 })
        .limit(5);

    const todayTasks =
      await Task.find()
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
      totalLeads,
      pendingTasks,
      completedTasks,
      monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
      recentLeads,
      todayTasks,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

module.exports = router;