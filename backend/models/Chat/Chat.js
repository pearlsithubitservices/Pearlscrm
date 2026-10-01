const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // Existing compatibility fields used everywhere in the CRM
    participants: [
      {
        type: String,
        required: true,
      },
    ],

    members: [
      {
        type: String,
      },
    ],

    admins: [
      {
        type: String,
      },
    ],

    chatName: {
      type: String,
      trim: true,
      default: "",
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    chatType: {
      type: String,
      enum: ["direct", "group", "collab", "task", "project", "client"],
      default: "direct",
    },

    type: {
      type: String,
      enum: ["direct", "group", "collab", "task", "project", "client"],
      default: "direct",
    },

    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
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

    relatedTask: {
      type: String,
      default: null,
    },

    relatedProject: {
      type: String,
      default: null,
    },

    relatedClient: {
      type: String,
      default: null,
    },

    pinnedBy: [
      {
        type: String,
      },
    ],

    archivedBy: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

chatSchema.index({ members: 1, lastMessageAt: -1 });
chatSchema.index({ participants: 1, lastMessageAt: -1 });
chatSchema.index({ createdBy: 1, lastMessageAt: -1 });
chatSchema.index({ taskId: 1 });
chatSchema.index({ clientId: 1 });
chatSchema.index({ projectId: 1 });

module.exports = mongoose.model("Chat", chatSchema);