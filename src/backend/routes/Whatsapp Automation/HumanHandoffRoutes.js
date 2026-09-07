const express = require("express");

const HumanHandoff = require(
  "../../models/HumanHandoff"
);

const router = express.Router();


// =====================================================
// CREATE HUMAN HANDOFF
// =====================================================

// =====================================================
// CREATE HUMAN HANDOFF
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      message,
      source,
      employee_name,
      conversation_id,
    } = req.body;

    // =================================================
    // VALIDATE MESSAGE
    // =================================================

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required.",
      });
    }

    // =================================================
    // VALIDATE CONVERSATION
    //
    // Every handoff must belong to an existing
    // conversation. Do not allow separate handoff chats.
    // =================================================

    if (!conversation_id) {
      return res.status(400).json({
        message:
          "conversation_id is required for a Human Handoff request.",
      });
    }

    // =================================================
    // CREATE HANDOFF REQUEST
    //
    // This creates only a handoff request.
    // It does NOT create a new conversation.
    // =================================================

    const handoff = await HumanHandoff.create({
      message: message.trim(),
      source: source || "admin",
      employee_name: employee_name || null,
      conversation_id,
      status: "waiting",
    });

    return res.status(201).json(
      handoff
    );

  } catch (error) {

    console.error(
      "Failed to create human handoff:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create human handoff.",
    });
  }
});


// =====================================================
// GET WAITING HANDOFF REQUESTS
// =====================================================

router.get("/waiting", async (req, res) => {
  try {
    const requests = await HumanHandoff
      .find({
        status: "waiting",
      })
      .sort({
        created_at: -1,
      });

    return res.status(200).json({
      count: requests.length,
      requests,
    });

  } catch (error) {
    console.error(
      "Failed to get waiting handoffs:",
      error
    );

    return res.status(500).json({
      message: "Failed to get waiting handoffs.",
    });
  }
});


// =====================================================
// GET ALL HANDOFF REQUESTS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const requests = await HumanHandoff
      .find()
      .sort({
        created_at: -1,
      });

    return res.status(200).json({
      count: requests.length,
      requests,
    });

  } catch (error) {
    console.error(
      "Failed to get human handoffs:",
      error
    );

    return res.status(500).json({
      message: "Failed to get human handoffs.",
    });
  }
});


// =====================================================
// RESOLVE HUMAN HANDOFF
// =====================================================

router.patch(
  "/:handoffId/resolve",
  async (req, res) => {
    try {
      const { handoffId } = req.params;

      const handoff = await HumanHandoff
        .findByIdAndUpdate(
          handoffId,
          {
            status: "resolved",
            resolved_at: new Date(),
          },
          {
            new: true,
          }
        );

      if (!handoff) {
        return res.status(404).json({
          message:
            "Human handoff request not found.",
        });
      }

      return res.status(200).json(handoff);

    } catch (error) {
      console.error(
        "Failed to resolve human handoff:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to resolve human handoff.",
      });
    }
  }
);


module.exports = router;