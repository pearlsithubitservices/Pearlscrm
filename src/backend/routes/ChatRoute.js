const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat/Chat");
const { getIO } = require("../Socket");

// GET ALL CHATS FOR A USER
// Usage: GET /api/chats?userId=EMPLOYEE_ID
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    let chats;
    if (!userId || userId === "undefined" || userId === "null" || userId === "admin") {
      chats = await Chat.find({}).sort({ lastMessageAt: -1 });
    } else {
      chats = await Chat.find({
        $or: [
          { participants: { $in: [userId, new RegExp(userId, "i")] } },
          { createdBy: userId },
        ],
      }).sort({ lastMessageAt: -1 });
    }

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

// GET OR CREATE TASK CHAT FOR A SPECIFIC TASK
router.get("/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, taskTitle } = req.query;

    let chat = await Chat.findOne({
      $or: [
        { taskId: taskId },
        { chatType: "task", chatName: { $regex: taskId, $options: "i" } }
      ]
    });

    if (!chat) {
      chat = await Chat.create({
        participants: userId ? [userId, "admin"] : ["admin"],
        chatName: taskTitle ? `Task Chat: ${taskTitle}` : `Task #${taskId}`,
        isGroup: true,
        chatType: "task",
        taskId: taskId,
        createdBy: userId || "admin",
        lastMessage: "Task discussion room initialized",
        lastMessageAt: new Date(),
      });

      try {
        const io = getIO();
        io.emit("newChatCreated", chat);
      } catch (err) {
        console.error("Socket emit error:", err);
      }
    } else if (userId && !chat.participants.includes(userId)) {
      chat.participants.push(userId);
      await chat.save();
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

// CREATE A NEW CHAT (1-on-1, group, task, collab)
router.post("/", async (req, res) => {
  try {
    const { participants, chatName, isGroup, chatType, createdBy, taskId } = req.body;

    if (!participants || participants.length < 1) {
      return res.status(400).json({
        success: false,
        message: "A chat needs at least 1 participant",
      });
    }

    const type = chatType || (isGroup ? "group" : "direct");

    // Avoid duplicate 1-on-1 chats between the same two people
    if (!isGroup && type === "direct" && participants.length >= 2) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        chatType: "direct",
        participants: { $in: participants },
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          data: existingChat,
          message: "Chat already exists",
        });
      }
    }

    // Check existing task chat if taskId is provided
    if (taskId && type === "task") {
      const existingTaskChat = await Chat.findOne({ taskId });
      if (existingTaskChat) {
        return res.status(200).json({
          success: true,
          data: existingTaskChat,
          message: "Task chat already exists",
        });
      }
    }

    const chat = await Chat.create({
      participants,
      chatName: chatName || "",
      isGroup: isGroup || type === "group" || type === "collab" || type === "channel" || type === "task",
      chatType: type,
      taskId: taskId || null,
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
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndDelete(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Emit live chatDeleted event
    try {
      const io = getIO();
      io.emit("chatDeleted", { chatId });
    } catch (err) {
      console.error("Socket emit error:", err);
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

// ADD PARTICIPANT TO A CHAT
router.put("/:chatId/participants", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newParticipantId } = req.body;

    if (!newParticipantId) {
      return res.status(400).json({ success: false, message: "newParticipantId is required" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: newParticipantId }, isGroup: true },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    try {
      const io = getIO();
      io.emit("chatUpdated", { chat: updatedChat });
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    res.status(200).json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;