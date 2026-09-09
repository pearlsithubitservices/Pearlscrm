const { Server } = require("socket.io");

let io;

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

  return io;
}

function getIO() {
  return io || null;
}

module.exports = { initSocket, getIO };