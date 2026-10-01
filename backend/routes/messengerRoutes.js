const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const Chat = require("../models/Chat/Chat");
const Message = require("../models/Message/message");
const Notification = require("../models/CommunicationModels/Notifications");
const Announcement = require("../models/CommunicationModels/Announcements");
const Document = require("../models/Document");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Client = require("../models/Clients");
const Task = require("../models/TaskModels/Task");
const Project = require("../models/Projects");
const { protect } = require("../middlewares/authMiddleware");
const { requireConversationAccess, resolveMessengerUserId } = require("../middlewares/messengerPermission");

const uploadDir = path.join(__dirname, "../uploads/messenger");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = (file.originalname || "file").replace(/\s+/g, "_");
    const ext = path.extname(safeName);
    cb(null, `messenger-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const safeRegex = (value = "") =>
  new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const getCurrentUserId = (req) => {
  const user = req.user || {};
  return (
    user._id ||
    user.id ||
    user.uid ||
    user.email ||
    user.username ||
    req.query.userId ||
    req.body.userId ||
    req.headers["x-user-id"]
  );
};

router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User is required for messenger access." });
    }

    const conversations = await Chat.find({
      $or: [
        { participants: userId },
        { members: userId },
        { createdBy: userId },
      ],
    }).sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch conversations." });
  }
});

router.post("/conversations", protect, async (req, res) => {
  try {
    const { participants = [], chatName, chatType = "direct", isGroup = false, taskId, projectId, clientId } = req.body;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const members = Array.from(new Set([...(participants || []), String(userId)]));
    const conversation = await Chat.create({
      participants: members,
      members,
      admins: [String(userId)],
      chatName: chatName || "New conversation",
      name: chatName || "New conversation",
      isGroup: Boolean(isGroup) || chatType === "group" || chatType === "task" || chatType === "project" || chatType === "client",
      chatType,
      type: chatType,
      taskId: taskId || null,
      projectId: projectId || null,
      clientId: clientId || null,
      relatedTask: taskId || null,
      relatedProject: projectId || null,
      relatedClient: clientId || null,
      createdBy: String(userId),
      lastMessage: "Conversation started",
      lastMessageAt: new Date(),
    });

    return res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to create conversation." });
  }
});

router.get("/conversations/:id", protect, requireConversationAccess, async (req, res) => {
  return res.status(200).json({ success: true, data: req.conversation });
});

router.put("/conversations/:id", protect, requireConversationAccess, async (req, res) => {
  try {
    const { chatName, description, avatar } = req.body;
    const updated = await Chat.findByIdAndUpdate(
      req.params.id,
      {
        ...(chatName ? { chatName, name: chatName } : {}),
        ...(typeof description !== "undefined" ? { description } : {}),
        ...(typeof avatar !== "undefined" ? { avatar } : {}),
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update conversation." });
  }
});

router.delete("/conversations/:id", protect, requireConversationAccess, async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ chatId: req.params.id });
    return res.status(200).json({ success: true, message: "Conversation deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete conversation." });
  }
});

router.get("/conversations/:id/messages", protect, requireConversationAccess, async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 40), 100);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId: req.params.id, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId: req.params.id, isDeleted: { $ne: true } }),
    ]);

    return res.status(200).json({ success: true, data: [...messages].reverse(), pagination: { page, limit, total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch messages." });
  }
});

router.post("/conversations/:id/messages", protect, requireConversationAccess, async (req, res) => {
  try {
    const { text = "", attachments = [], senderId, messageType = "text", replyTo, mentions = [], taskId, projectId, clientId } = req.body;
    const userId = senderId || getCurrentUserId(req);
    if (!userId || (!text && attachments.length === 0)) {
      return res.status(400).json({ success: false, message: "Message content is required." });
    }

    const message = await Message.create({
      conversationId: req.params.id,
      chatId: req.params.id,
      senderId: String(userId),
      receiverId: null,
      content: text,
      text,
      messageType: attachments.length ? (messageType || "file") : messageType,
      attachments,
      replyTo: replyTo || null,
      mentions,
      readBy: [String(userId)],
      taskId: taskId || null,
      projectId: projectId || null,
      clientId: clientId || null,
    });

    await Chat.findByIdAndUpdate(req.params.id, {
      lastMessage: text || (attachments.length ? "Attachment shared" : "New message"),
      lastMessageAt: new Date(),
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to send message." });
  }
});

router.put("/messages/:id", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Updated message text is required." });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const userId = getCurrentUserId(req);
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "You can only edit your own messages." });
    }

    message.text = text.trim();
    message.content = text.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update message." });
  }
});

router.delete("/messages/:id", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const userId = getCurrentUserId(req);
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages." });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    return res.status(200).json({ success: true, message: "Message deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to delete message." });
  }
});

router.post("/messages/:id/read", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User is required." });
    }

    if (!message.readBy.includes(String(userId))) {
      message.readBy.push(String(userId));
      await message.save();
    }

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to mark message as read." });
  }
});

router.post("/messages/:id/reaction", protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = getCurrentUserId(req);
    if (!emoji || !userId) {
      return res.status(400).json({ success: false, message: "Emoji and authenticated user are required." });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const existing = message.reactions.find((reaction) => String(reaction.userId) === String(userId) && reaction.emoji === emoji);
    if (existing) {
      message.reactions = message.reactions.filter((reaction) => !(String(reaction.userId) === String(userId) && reaction.emoji === emoji));
    } else {
      message.reactions.push({ userId: String(userId), emoji });
    }

    await message.save();
    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unable to update message reaction." });
  }
});

router.get("/search", protect, async (req, res) => {
  try {
    const query = String(req.query.q || req.query.search || "").trim();
    if (!query) {
      return res.status(200).json({ success: true, data: { employees: [], clients: [], conversations: [], messages: [], files: [], projects: [], tasks: [] } });
    }

    const regex = safeRegex(query);

    const [employees, clients, projects, tasks, conversations, messages, documents] = await Promise.all([
      User.find({ $or: [{ name: regex }, { email: regex }, { username: regex }] }).limit(10).lean(),
      Client.find({ $or: [{ companyName: regex }, { email: regex }, { projectName: regex }] }).limit(10).lean(),
      Project.find({ $or: [{ projectName: regex }, { name: regex }, { companyName: regex }] }).limit(10).lean(),
      Task.find({ $or: [{ title: regex }, { description: regex }, { notes: regex }] }).limit(10).lean(),
      Chat.find({ $or: [{ chatName: regex }, { name: regex }, { description: regex }] }).limit(10).lean(),
      Message.find({ $or: [{ text: regex }, { content: regex }] }).limit(10).lean(),
      Document.find({ $or: [{ name: regex }, { author: regex }, { content: regex }] }).limit(10).lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        employees,
        clients,
        projects,
        tasks,
        conversations,
        messages,
        files: documents,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Search failed." });
  }
});

router.get("/documents", protect, async (req, res) => {
  try {
    const documents = await Document.find({}).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch documents." });
  }
});

router.post("/documents", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required." });
    }

    const allowed = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx", "csv", "zip", "txt"];
    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    if (!allowed.includes(ext)) {
      return res.status(400).json({ success: false, message: "Unsupported file type." });
    }

    const document = await Document.create({
      name: req.body.name || req.file.originalname,
      type: ext,
      extension: ext,
      size: `${(req.file.size / 1024).toFixed(1)} KB`,
      sizeBytes: req.file.size,
      url: `/uploads/messenger/${req.file.filename}`,
      author: req.body.author || "Admin",
      authorId: req.body.authorId || getCurrentUserId(req),
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
      status: "completed",
    });

    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to add document." });
  }
});

router.delete("/documents/:id", protect, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    return res.status(200).json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete document." });
  }
});

router.get("/notifications", protect, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const notifications = await Notification.find({
      $or: [{ employeeId: userId }, { employeeId: null }, { employeeId: "" }],
    }).sort({ createdAt: -1 }).limit(50);

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch notifications." });
  }
});

router.put("/notifications/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to mark notification as read." });
  }
});

router.put("/notifications/read-all", protect, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    await Notification.updateMany(
      { $or: [{ employeeId: userId }, { employeeId: null }, { employeeId: "" }] },
      { isRead: true }
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to mark all notifications as read." });
  }
});

router.get("/announcements", protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch announcements." });
  }
});

router.post("/announcements", protect, async (req, res) => {
  try {
    const payload = req.body || {};
    const announcement = await Announcement.create({
      title: payload.title,
      description: payload.description,
      author: payload.author || "Admin",
      role: payload.role || "Admin",
      priority: payload.priority || "Normal",
      date: payload.date || new Date().toISOString(),
      isRead: false,
      pinned: Boolean(payload.pinned),
    });

    return res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to create announcement." });
  }
});

router.put("/announcements/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }

    return res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update announcement." });
  }
});

router.delete("/announcements/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }

    return res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete announcement." });
  }
});

module.exports = router;
