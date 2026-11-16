const mongoose = require("mongoose");

const teamChatMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    readBy: [
      {
        type: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

teamChatMessageSchema.index({ chatId: 1, createdAt: -1 });

module.exports = mongoose.model("TeamChatMessage", teamChatMessageSchema);
