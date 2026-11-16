const mongoose = require("mongoose");

const teamChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: String,
        required: true,
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
    isGroup: {
      type: Boolean,
      default: false,
    },
    chatType: {
      type: String,
      enum: ["direct", "group"],
      required: true,
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
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

teamChatSchema.index({ participants: 1, lastMessageAt: -1 });

module.exports = mongoose.model("TeamChat", teamChatSchema);
