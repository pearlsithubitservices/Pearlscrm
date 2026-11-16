const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    chatId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    receiverId: {
      type: String,
      default: null,
    },

    content: {
      type: String,
      trim: true,
      default: "",
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file", "system", "announcement"],
      default: "text",
    },

    attachments: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    mentions: [
      {
        type: String,
      },
    ],

    reactions: [
      {
        userId: String,
        emoji: String,
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    readBy: [
      {
        type: String,
      },
    ],

    deliveredTo: [
      {
        type: String,
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    taskId: {
      type: String,
      default: null,
    },

    projectId: {
      type: String,
      default: null,
    },

    clientId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ taskId: 1, createdAt: -1 });
messageSchema.index({ projectId: 1, createdAt: -1 });
messageSchema.index({ clientId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);