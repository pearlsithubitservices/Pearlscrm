const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    attachments: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],

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
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);