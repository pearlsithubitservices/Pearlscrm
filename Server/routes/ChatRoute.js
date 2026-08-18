const express = require("express");
const router = express.Router();
const Chat = require("../models/chat/chat");
const { getIO } = require("../Socket");

// GET ALL CHATS FOR A USER
// Usage: GET /api/chats?userId=EMPLOYEE_ID
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const chats = await Chat.find({
      participants: userId,
    }).sort({
      lastMessageAt: -1,
    });

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE A NEW CHAT (1-on-1 or group)
router.post("/", async (req, res) => {
  try {
    const { participants, chatName, isGroup, chatType, createdBy } = req.body;

    if (!participants || participants.length < 1) {
      return res.status(400).json({
        success: false,
        message: "A chat needs at least 1 participant",
      });
    }

    const type = chatType || (isGroup ? "group" : "direct");

    // Avoid duplicate 1-on-1 chats between the same two people
    if (!isGroup && type === "direct" && participants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        chatType: "direct",
        participants: { $all: participants, $size: 2 },
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          data: existingChat,
          message: "Chat already exists",
        });
      }
    }

    const chat = await Chat.create({
      participants,
      chatName: chatName || "",
      isGroup: isGroup || type === "group" || type === "collab" || type === "channel",
      chatType: type,
      createdBy: createdBy || participants[0],
    });

    // Emit live newChatCreated socket event
    try {
      const io = getIO();
      io.emit("newChatCreated", chat);
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET SINGLE CHAT BY ID
router.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE A CHAT
router.delete("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;