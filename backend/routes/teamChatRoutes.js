const express = require("express");
const mongoose = require("mongoose");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const TeamChat = require("../models/Chat/TeamChat");
const TeamChatMessage = require("../models/Message/TeamChatMessage");
const { getTeamChatIO, getOnlineTeamChatUsers } = require("../Socket");

const router = express.Router();
router.use(protect);

const getActiveUser = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "_id name email role status avatar department profile.department",
  );
  if (!user || user.status !== "Active") {
    res.status(403).json({ success: false, message: "An active CRM account is required" });
    return null;
  }
  return user;
};

const getAccessibleChat = async (chatId, user) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) return null;
  const chat = await TeamChat.findById(chatId);
  if (!chat || !(chat.participants || []).some((participant) => String(participant) === String(user._id))) {
    return null;
  }
  const participantIds = Array.from(new Set((chat.participants || []).map(String)));
  const activeParticipants = await User.countDocuments({
    _id: { $in: participantIds },
    status: "Active",
  });
  if (activeParticipants !== participantIds.length) return null;
  return chat;
};

router.get("/directory", async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    const employees = await User.find({ status: "Active" })
      .select("_id name role avatar department profile.department")
      .sort({ name: 1 })
      .lean();
    const onlineIds = new Set(getOnlineTeamChatUsers());

    res.json({
      success: true,
      data: employees
        .filter((employee) => String(employee._id) !== String(user._id))
        .map((employee) => ({
          _id: employee._id,
          name: employee.name,
          role: employee.role,
          avatar: employee.avatar || "",
          department: employee.department || employee.profile?.department || "",
          isOnline: onlineIds.has(String(employee._id)),
        })),
    });
  } catch (error) {
    console.error("Team chat directory fetch failed:", error);
    res.status(500).json({ success: false, message: "Unable to load the employee directory" });
  }
});

router.get("/conversations", async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    const conversations = await TeamChat.find({
      participants: String(user._id),
      chatType: { $in: ["direct", "group"] },
    }).sort({ lastMessageAt: -1 });
    const accessible = [];
    for (const conversation of conversations) {
      if (await getAccessibleChat(conversation._id, user)) accessible.push(conversation);
    }

    const counts = accessible.length
      ? await TeamChatMessage.aggregate([
          {
            $match: {
              chatId: { $in: accessible.map((chat) => String(chat._id)) },
              senderId: { $ne: String(user._id) },
              readBy: { $ne: String(user._id) },
              isDeleted: { $ne: true },
            },
          },
          { $group: { _id: "$chatId", count: { $sum: 1 } } },
        ])
      : [];
    const unreadCounts = new Map(counts.map((item) => [String(item._id), item.count]));

    res.json({
      success: true,
      data: accessible.map((chat) => ({
        ...chat.toObject(),
        unreadCount: unreadCounts.get(String(chat._id)) || 0,
      })),
    });
  } catch (error) {
    console.error("Team chat conversation list failed:", error);
    res.status(500).json({ success: false, message: "Unable to load conversations" });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    const { participantIds, isGroup, name } = req.body;
    if (!Array.isArray(participantIds) || participantIds.length < 1) {
      return res.status(400).json({ success: false, message: "Select at least one employee" });
    }
    if (participantIds.length > 100 || participantIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: "Invalid conversation participants" });
    }

    const uniqueIds = Array.from(new Set([String(user._id), ...participantIds.map(String)]));
    const group = Boolean(isGroup);
    if ((!group && uniqueIds.length !== 2) || (group && uniqueIds.length < 3)) {
      return res.status(400).json({
        success: false,
        message: group ? "A group needs at least two other employees" : "A direct chat needs one employee",
      });
    }
    if (group && (!String(name || "").trim() || String(name).trim().length > 80)) {
      return res.status(400).json({ success: false, message: "Enter a group name of up to 80 characters" });
    }

    const participants = await User.find({
      _id: { $in: uniqueIds },
      status: "Active",
    }).select("_id name role status avatar department profile.department");
    if (participants.length !== uniqueIds.length) {
      return res.status(400).json({ success: false, message: "One or more participants are unavailable" });
    }
    const otherParticipants = participants.filter(
      (participant) => String(participant._id) !== String(user._id),
    );
    if (!group) {
      const existing = await TeamChat.findOne({
        chatType: "direct",
        isGroup: false,
        participants: { $all: uniqueIds, $size: 2 },
      });
      if (existing) return res.json({ success: true, data: existing });
    }

    const chat = await TeamChat.create({
      participants: uniqueIds,
      chatName: group ? String(name).trim() : "",
      name: group ? String(name).trim() : "",
      isGroup: group,
      chatType: group ? "group" : "direct",
      createdBy: String(user._id),
    });
    const io = getTeamChatIO();
    otherParticipants.forEach((participant) => {
      io?.to(`user:${participant._id}`).emit("conversation:new", chat);
    });
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error("Team chat conversation creation failed:", error);
    res.status(500).json({ success: false, message: "Unable to create conversation" });
  }
});

router.get("/conversations/:chatId/messages", async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;
    const chat = await getAccessibleChat(req.params.chatId, user);
    if (!chat) return res.status(404).json({ success: false, message: "Conversation not found" });

    const messages = await TeamChatMessage.find({
      chatId: String(chat._id),
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    console.error("Team chat message history failed:", error);
    res.status(500).json({ success: false, message: "Unable to load messages" });
  }
});

router.post("/conversations/:chatId/messages", async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;
    const chat = await getAccessibleChat(req.params.chatId, user);
    if (!chat) return res.status(404).json({ success: false, message: "Conversation not found" });

    const text = String(req.body.text || "").trim();
    if (!text || text.length > 10000) {
      return res.status(400).json({ success: false, message: "Messages must contain 1 to 10,000 characters" });
    }

    const message = await TeamChatMessage.create({
      chatId: String(chat._id),
      senderId: String(user._id),
      text,
      content: text,
      readBy: [String(user._id)],
    });
    chat.lastMessage = text;
    chat.lastMessageAt = message.createdAt;
    await chat.save();

    const io = getTeamChatIO();
    io?.to(`chat:${chat._id}`).emit("message:new", message);
    (chat.participants || [])
      .forEach((participant) => {
        io?.to(`user:${participant}`).emit("message:new", message);
      });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Team chat message send failed:", error);
    res.status(500).json({ success: false, message: "Unable to send message" });
  }
});

router.post("/conversations/:chatId/read", async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;
    const chat = await getAccessibleChat(req.params.chatId, user);
    if (!chat) return res.status(404).json({ success: false, message: "Conversation not found" });

    const unread = await TeamChatMessage.find({
      chatId: String(chat._id),
      senderId: { $ne: String(user._id) },
      readBy: { $ne: String(user._id) },
      isDeleted: { $ne: true },
    }).select("_id");
    const messageIds = unread.map((message) => String(message._id));
    if (messageIds.length) {
      await TeamChatMessage.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readBy: String(user._id) } },
      );
      getTeamChatIO()?.to(`chat:${chat._id}`).emit("message:read", {
        chatId: String(chat._id),
        userId: String(user._id),
        messageIds,
        readAt: new Date(),
      });
    }
    res.json({ success: true, data: { messageIds, userId: String(user._id) } });
  } catch (error) {
    console.error("Team chat read receipt update failed:", error);
    res.status(500).json({ success: false, message: "Unable to update read receipts" });
  }
});

module.exports = router;
