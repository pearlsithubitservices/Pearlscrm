const express = require("express");
const router = express.Router();

const Message = require("../models/message/messagemodel");
const Chat = require("../models/chat/chat");
const { getIO } = require("../Socket");

// GET ALL MESSAGES FOR A CHAT
// Usage: GET /api/messages/:chatId
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// SEND A NEW MESSAGE
// Usage: POST /api/messages/:chatId
router.post("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text, attachments } = req.body;

    if (!senderId || (!text && (!attachments || attachments.length === 0))) {
      return res.status(400).json({
        success: false,
        message: "senderId and either text or attachments are required",
      });
    }

    const message = await Message.create({
      chatId,
      senderId,
      text: text || "",
      attachments: attachments || [],
      readBy: [senderId],
    });

    // Keep parent chat preview updated if valid ObjectId
    const mongoose = require("mongoose");
    if (mongoose.Types.ObjectId.isValid(chatId)) {
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: text && text.length > 0 ? text : "Sent an attachment",
        lastMessageAt: message.createdAt,
      });
    }

    // Emit live message globally and to room for instant sync
    try {
      const io = getIO();
      io.to(chatId.toString()).emit("newMessage", message);
      io.emit("newMessage", message);
      io.emit("chatUpdated", {
        chatId,
        lastMessage: text && text.length > 0 ? text : "Sent an attachment",
        lastMessageAt: message.createdAt,
      });

      // Create Notification in DB for recipient alerts
      const Notification = require("../models/CommunicationModels/Notifications");
      const notif = await Notification.create({
        title: `New message in chat`,
        sub: text && text.length > 0 ? text : "Sent an attachment",
        notificationType: "General",
        employeeId: null,
      });
      io.emit("newNotification", notif);
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE A MESSAGE ("Delete for everyone")
// Usage: DELETE /api/messages/:chatId/:messageId
router.delete("/:chatId/:messageId", async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Emit live message deletion event
    try {
      const io = getIO();
      io.to(chatId.toString()).emit("messageDeleted", {
        messageId,
        chatId,
      });
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;