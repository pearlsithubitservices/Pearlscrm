const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // Everyone who is part of this chat (1-on-1: 2 people, group: many)
    participants: [
      {
        type: String,
        required: true,
      },
    ],

    // Name for group chats, collabs, channels (e.g. "Sales Team", "Project Collab")
    chatName: {
      type: String,
      trim: true,
      default: "",
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    // Category of chat: "direct" | "group" | "collab" | "task" | "channel" | "copilot"
    chatType: {
      type: String,
      enum: ["direct", "group", "collab", "task", "channel", "copilot"],
      default: "direct",
    },

    // Denormalized preview text + timestamp so the chat list (left sidebar)
    // can be sorted/rendered without joining the Message collection every time
    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // Who created the chat
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);