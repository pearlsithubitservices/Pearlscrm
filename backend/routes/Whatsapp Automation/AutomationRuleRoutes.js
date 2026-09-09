const express = require("express");

const router = express.Router();

const AutomationRule = require("../../models/AutomationRule");

// =====================================================
// GET ALL AUTOMATION RULES
// =====================================================

router.get("/", async (req, res) => {
  try {
    const rules = await AutomationRule.find()
      .sort({ createdAt: -1 });

    res.status(200).json(rules);
  } catch (error) {
    console.error(
      "Get Automation Rules Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// CREATE AUTOMATION RULE
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      trigger,
      condition,
      action,
      status,
    } = req.body;

    const rule = await AutomationRule.create({
      name,
      trigger,
      condition,
      action,
      status,
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error(
      "Create Automation Rule Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// UPDATE AUTOMATION RULE
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      trigger,
      condition,
      action,
      status,
    } = req.body;

    const rule =
      await AutomationRule.findByIdAndUpdate(
        req.params.id,
        {
          name,
          trigger,
          condition,
          action,
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Automation rule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error(
      "Update Automation Rule Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// ENABLE / DISABLE AUTOMATION RULE
// =====================================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["Active", "Inactive"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Active or Inactive",
      });
    }

    const rule =
      await AutomationRule.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Automation rule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error(
      "Update Automation Rule Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// DELETE AUTOMATION RULE
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const rule =
      await AutomationRule.findByIdAndDelete(
        req.params.id
      );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Automation rule not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Automation rule deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Automation Rule Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;