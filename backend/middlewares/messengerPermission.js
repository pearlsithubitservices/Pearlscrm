const Chat = require("../models/Chat/Chat");

const resolveMessengerUserId = (req) => {
  const user = req.user || {};

  const candidate =
    user._id ||
    user.id ||
    user.uid ||
    user.email ||
    user.username ||
    req.query?.userId ||
    req.body?.userId ||
    req.headers?.["x-user-id"];

  return candidate ? String(candidate) : null;
};

const requireConversationAccess = async (req, res, next) => {
  try {
    const userId = resolveMessengerUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to access this conversation.",
      });
    }

    const chatId = req.params.id || req.params.chatId;
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Conversation id is required.",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const participantIds = [
      ...(chat.participants || []),
      ...(chat.members || []),
      chat.createdBy,
    ].map((item) => String(item));

    if (!participantIds.includes(String(userId))) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this conversation.",
      });
    }

    req.conversation = chat;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to validate conversation access.",
    });
  }
};

module.exports = {
  resolveMessengerUserId,
  requireConversationAccess,
};
