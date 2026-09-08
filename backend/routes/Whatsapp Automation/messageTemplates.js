const express = require("express");

const router = express.Router();

const MessageTemplate = require("../../models/MessageTemplate");

// =====================================================
// GET ALL MESSAGE TEMPLATES
// =====================================================

router.get("/", async (req, res) => {
  try {
    const templates = await MessageTemplate.find()
      .sort({ createdAt: -1 });

    res.status(200).json(templates);
  } catch (error) {
    console.error(
      "Get Message Templates Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// CREATE MESSAGE TEMPLATE
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      category,
      message,
      status,
    } = req.body;

    const template = await MessageTemplate.create({
      name,
      category,
      message,
      status,
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error(
      "Create Message Template Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// UPDATE MESSAGE TEMPLATE
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      category,
      message,
      status,
    } = req.body;

    const template =
      await MessageTemplate.findByIdAndUpdate(
        req.params.id,
        {
          name,
          category,
          message,
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Message template not found",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error(
      "Update Message Template Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// ENABLE / DISABLE MESSAGE TEMPLATE
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

    const template =
      await MessageTemplate.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Message template not found",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error(
      "Update Message Template Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// DELETE MESSAGE TEMPLATE
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const template =
      await MessageTemplate.findByIdAndDelete(
        req.params.id
      );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Message template not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Message template deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Message Template Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;