const express = require("express");

const router = express.Router();

const Lead = require("../models/Leads");
const Task = require("../models/Task");
const Followup = require("../models/Followup");

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

    const followupsToday =
      await Followup.countDocuments();

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
      followupsToday,
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