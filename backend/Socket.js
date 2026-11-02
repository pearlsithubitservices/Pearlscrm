const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const TeamChat = require("./models/Chat/TeamChat");

let io;
let teamChatIO;
const onlineUserSockets = new Map();

const canAccessChat = async (chat, user) => {
  const userId = String(user._id);
  if (!chat || !(chat.participants || []).some((participant) => String(participant) === userId)) {
    return false;
  }

  const participantIds = Array.from(new Set((chat.participants || []).map(String)));
  const participantUsers = await User.find({ _id: { $in: participantIds }, status: "Active" })
    .select("_id")
    .lean();
  return participantUsers.length === participantIds.length;
};

function initSocket(server) {
  io = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    // console.log("Socket connected:", socket.id);

    // Join personal user room
    socket.on("joinUser", (userId) => {
      if (userId) {
        socket.join("user_" + userId);
        socket.join(userId.toString());
        // console.log(`Socket ${socket.id} joined personal room for user: ${userId}`);
      }
    });

    // Join room for a specific chat room
    socket.on("joinChat", (chatId) => {
      if (chatId) {
        socket.join(chatId.toString());
        // console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
      }
    });

    // Leave room
    socket.on("leaveChat", (chatId) => {
      if (chatId) {
        socket.leave(chatId.toString());
        // console.log(`Socket ${socket.id} left chat room: ${chatId}`);
      }
    });

    // Typing indicators
    socket.on("typing", ({ chatId, userName }) => {
      if (chatId) {
        socket.to(chatId.toString()).emit("userTyping", { chatId, userName });
      }
    });

    socket.on("stopTyping", ({ chatId, userName }) => {
      if (chatId) {
        socket.to(chatId.toString()).emit("userStopTyping", { chatId, userName });
      }
    });

    socket.on("disconnect", () => {
      // console.log("Socket disconnected:", socket.id);
    });
  });

  teamChatIO = io.of("/team-chat");
  teamChatIO.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "_id name role status department profile.department",
      );
      if (!user || user.status !== "Active") {
        return next(new Error("An active CRM account is required"));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  teamChatIO.on("connection", (socket) => {
    const userId = String(socket.data.user._id);
    const userSockets = onlineUserSockets.get(userId) || new Set();
    userSockets.add(socket.id);
    onlineUserSockets.set(userId, userSockets);
    socket.join(`user:${userId}`);

    socket.emit("presence:snapshot", Array.from(onlineUserSockets.keys()));
    teamChatIO.emit("presence:update", { userId, isOnline: true });

    socket.on("chat:join", async (chatId, acknowledge) => {
      const respond = (result) => {
        if (typeof acknowledge === "function") acknowledge(result);
      };
      try {
        if (typeof chatId !== "string" || !/^[a-f\d]{24}$/i.test(chatId)) {
          respond({ success: false, message: "Invalid conversation" });
          return socket.emit("chat:error", { message: "Invalid conversation" });
        }
        const chat = await TeamChat.findById(chatId);
        if (!(await canAccessChat(chat, socket.data.user))) {
          respond({ success: false, message: "Conversation access denied" });
          return socket.emit("chat:error", { message: "Conversation access denied" });
        }
        socket.join(`chat:${chatId}`);
        respond({ success: true });
      } catch (error) {
        console.error("Team chat room authorization failed:", error);
        respond({ success: false, message: "Unable to join conversation" });
        socket.emit("chat:error", { message: "Unable to join conversation" });
      }
    });

    socket.on("chat:leave", (chatId) => {
      if (typeof chatId === "string") socket.leave(`chat:${chatId}`);
    });

    socket.on("call:signal", async (signal = {}, acknowledge) => {
      const respond = (result) => {
        if (typeof acknowledge === "function") acknowledge(result);
      };
      try {
        const { chatId, targetUserId, callId, kind, data } = signal;
        const allowedKinds = ["offer", "answer", "ice", "reject", "end"];
        if (
          typeof chatId !== "string" ||
          !/^[a-f\d]{24}$/i.test(chatId) ||
          typeof targetUserId !== "string" ||
          !/^[a-f\d]{24}$/i.test(targetUserId) ||
          typeof callId !== "string" ||
          !/^[\w-]{1,64}$/.test(callId) ||
          !allowedKinds.includes(kind)
        ) {
          respond({ success: false, message: "Invalid call signal." });
          return;
        }

        const chat = await TeamChat.findById(chatId).select("participants isGroup chatType").lean();
        const participants = (chat?.participants || []).map(String);
        const peerId = participants.find((participantId) => participantId !== userId);
        if (
          !chat ||
          chat.isGroup ||
          chat.chatType !== "direct" ||
          participants.length !== 2 ||
          !(await canAccessChat(chat, socket.data.user)) ||
          !participants.includes(userId) ||
          peerId !== targetUserId ||
          (data !== undefined && JSON.stringify(data).length > 100_000)
        ) {
          respond({ success: false, message: "This call is not allowed for that conversation." });
          return;
        }

        const recipientRoom = `user:${targetUserId}`;
        const callSignal = {
          chatId,
          callId,
          kind,
          data,
          fromUserId: userId,
        };
        if (kind === "offer") {
          teamChatIO.to(recipientRoom).timeout(5000).emit("call:signal", callSignal, (deliveryError, responses) => {
            if (deliveryError || !responses?.some((response) => response?.success)) {
              respond({
                success: false,
                message: responses?.find((response) => response?.message)?.message ||
                  "The other person's WebMail did not receive the call. Refresh their WebMail and try again.",
              });
              return;
            }
            respond({ success: true });
          });
          return;
        }

        teamChatIO.to(recipientRoom).emit("call:signal", callSignal);
        respond({ success: true });
      } catch (error) {
        console.error("Team chat call signaling failed:", error);
        respond({ success: false, message: "Unable to deliver the call signal." });
      }
    });

    socket.on("typing:update", async ({ chatId, isTyping } = {}) => {
      try {
        const room = `chat:${chatId}`;
        if (
          typeof chatId !== "string" ||
          !/^[a-f\d]{24}$/i.test(chatId) ||
          !socket.rooms.has(room)
        ) {
          return;
        }
        socket.to(room).emit("typing:update", {
          chatId,
          userId,
          name: socket.data.user.name,
          isTyping: Boolean(isTyping),
        });
      } catch (error) {
        console.error("Team chat typing event failed:", error);
      }
    });

    socket.on("disconnect", () => {
      const activeSockets = onlineUserSockets.get(userId);
      activeSockets?.delete(socket.id);
      if (!activeSockets?.size) {
        onlineUserSockets.delete(userId);
        teamChatIO.emit("presence:update", { userId, isOnline: false });
      }
    });
  });

  return io;
}

function getIO() {
  return io || null;
}

function getTeamChatIO() {
  return teamChatIO || null;
}

function getOnlineTeamChatUsers() {
  return Array.from(onlineUserSockets.keys());
}

module.exports = { initSocket, getIO, getTeamChatIO, getOnlineTeamChatUsers };