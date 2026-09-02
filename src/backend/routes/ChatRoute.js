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
      const cleanUserId = String(userId).trim();
      const searchRegex = new RegExp(cleanUserId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      chats = await Chat.find({
        $or: [
          { participants: { $in: [cleanUserId, searchRegex] } },
          { createdBy: cleanUserId },
          { createdBy: searchRegex }
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
const mongoose = require("mongoose");
const Task = require("../models/TaskModels/Task");

router.get("/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, taskTitle } = req.query;

    let taskDoc = null;
    try {
      if (mongoose.Types.ObjectId.isValid(taskId)) {
        taskDoc = await Task.findById(taskId);
      }
    } catch (err) {
      console.log("Error finding task:", err);
    }

    const defaultParticipants = [userId || "admin"];
    if (taskDoc) {
      if (taskDoc.assignedTo) {
        const assignedVal = typeof taskDoc.assignedTo === "object"
          ? (taskDoc.assignedTo._id || taskDoc.assignedTo.id || taskDoc.assignedTo.email || taskDoc.assignedTo.name)
          : taskDoc.assignedTo;
        if (assignedVal && assignedVal !== "Unassigned") defaultParticipants.push(assignedVal);
      }
      if (taskDoc.assignedBy) {
        const assignedByVal = typeof taskDoc.assignedBy === "object"
          ? (taskDoc.assignedBy._id || taskDoc.assignedBy.id || taskDoc.assignedBy.email || taskDoc.assignedBy.name)
          : taskDoc.assignedBy;
        if (assignedByVal) defaultParticipants.push(assignedByVal);
      }
    }

    const uniqueParticipants = Array.from(new Set(defaultParticipants.filter(Boolean)));

    let chat = await Chat.findOne({
      $or: [
        { taskId: taskId },
        { chatType: "task", chatName: { $regex: taskId, $options: "i" } }
      ]
    });

    if (!chat) {
      const name = taskDoc ? `Task Chat: ${taskDoc.title}` : (taskTitle ? `Task Chat: ${taskTitle}` : `Task #${taskId}`);
      chat = await Chat.create({
        participants: uniqueParticipants,
        chatName: name,
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
    } else {
      // Ensure assigned participants are present in existing chat
      let updated = false;
      uniqueParticipants.forEach((p) => {
        if (!chat.participants.includes(p)) {
          chat.participants.push(p);
          updated = true;
        }
      });
      if (updated) {
        await chat.save();
      }
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

    // Avoid duplicate 1-on-1 chats between the exact same two people
    if (!isGroup && type === "direct" && participants.length >= 2) {
      const creatorId = createdBy || participants[0];
      const otherParticipants = participants.filter((p) => String(p) !== String(creatorId));
      if (otherParticipants.length > 0) {
        const targetId = otherParticipants[0];
        const existingChat = await Chat.findOne({
          isGroup: false,
          chatType: "direct",
          $and: [
            { participants: { $in: [creatorId, "admin"] } },
            { participants: targetId }
          ]
        });

        if (existingChat) {
          return res.status(200).json({
            success: true,
            data: existingChat,
            message: "Chat already exists",
          });
        }
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