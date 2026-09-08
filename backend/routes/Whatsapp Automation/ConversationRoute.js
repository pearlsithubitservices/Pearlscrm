const express = require("express");

const router = express.Router();

const Conversation = require("../../models/Conversation");


// =========================================================
// GET ALL CONVERSATIONS
// =========================================================

router.get("/", async (req, res) => {
  try {

    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);

  } catch (error) {

    console.error(
      "Conversation GET Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// GET SINGLE CONVERSATION
// =========================================================

router.get("/:id", async (req, res) => {
  try {

    const conversation =
      await Conversation.findById(
        req.params.id
      );

    if (!conversation) {

      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Conversation GET BY ID Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// CREATE NEW CONVERSATION
// =========================================================

router.post("/", async (req, res) => {
  try {

    console.log(
      "Creating conversation:",
      req.body
    );

    const conversation =
      await Conversation.create(req.body);

    res.status(201).json({
      success: true,
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Conversation CREATE Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
});


// =========================================================
// ADD MESSAGE
// =========================================================

router.post("/:id/messages", async (req, res) => {
  try {

    const {
      sender,
      message,
    } = req.body;


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!sender || !message) {

      return res.status(400).json({
        success: false,
        message:
          "sender and message are required",
      });
    }


    // -----------------------------------------------------
    // VALID SENDER
    // -----------------------------------------------------

    if (
      ![
        "customer",
        "ai",
        "agent",
      ].includes(sender)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "sender must be customer, ai, or agent",
      });
    }


    // -----------------------------------------------------
    // FIND CONVERSATION
    // -----------------------------------------------------

    const conversation =
      await Conversation.findById(
        req.params.id
      );

    if (!conversation) {

      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }


    // -----------------------------------------------------
    // ADD MESSAGE
    // -----------------------------------------------------

    conversation.messages.push({
      sender,
      message,
      timestamp: new Date(),
    });


    // -----------------------------------------------------
    // UPDATE HANDLER
    // -----------------------------------------------------

    if (sender === "agent") {

      conversation.handledBy = "Human";
    }

    if (sender === "ai") {

      conversation.handledBy = "AI";
    }


    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

    await conversation.save();


    res.status(201).json({
      success: true,
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Message CREATE Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// TAKE OVER CONVERSATION
// =========================================================
//
// Admin clicks:
// "Take Over"
//
// AI → Human
// Status → In Progress
//
// =========================================================

router.put("/:id/take-over", async (req, res) => {
  try {

    const conversation =
      await Conversation.findById(
        req.params.id
      );

    if (!conversation) {

      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }


    conversation.handledBy = "Human";

    conversation.status = "In Progress";


    await conversation.save();


    res.status(200).json({
      success: true,
      message:
        "Conversation taken over by human agent",
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Take Over Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// RESOLVE CONVERSATION
// =========================================================
//
// Admin clicks:
// "Resolved"
//
// Status → Completed
//
// =========================================================

router.put("/:id/resolve", async (req, res) => {
  try {

    const conversation =
      await Conversation.findById(
        req.params.id
      );

    if (!conversation) {

      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }


    conversation.status = "Completed";


    await conversation.save();


    res.status(200).json({
      success: true,
      message:
        "Conversation resolved successfully",
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Resolve Conversation Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// BLOCK CONVERSATION
// =========================================================
//
// Admin clicks:
// "Block"
//
// Status → Blocked
//
// =========================================================

router.put("/:id/block", async (req, res) => {
  try {

    const conversation =
      await Conversation.findById(
        req.params.id
      );

    if (!conversation) {

      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }


    conversation.status = "Blocked";


    await conversation.save();


    res.status(200).json({
      success: true,
      message:
        "Conversation blocked successfully",
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Block Conversation Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// UPDATE CONVERSATION
// =========================================================
//
// Can update:
// status
// intent
// handledBy
//
// =========================================================

router.put("/:id", async (req, res) => {
  try {

    const {
      status,
      intent,
      handledBy,
    } = req.body;


    const updateData = {};


    if (status !== undefined) {
      updateData.status = status;
    }

    if (intent !== undefined) {
      updateData.intent = intent;
    }

    if (handledBy !== undefined) {
      updateData.handledBy = handledBy;
    }


    const conversation =
      await Conversation.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );


    if (!conversation) {

      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }


    res.status(200).json({
      success: true,
      data: conversation,
    });

  } catch (error) {

    console.error(
      "Conversation UPDATE Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// DELETE CONVERSATION
// =========================================================
//
// Optional admin functionality
//
// =========================================================

router.delete("/:id", async (req, res) => {
  try {

    const conversation =
      await Conversation.findByIdAndDelete(
        req.params.id
      );


    if (!conversation) {

      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }


    res.status(200).json({
      success: true,
      message:
        "Conversation deleted successfully",
    });

  } catch (error) {

    console.error(
      "Conversation DELETE Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;