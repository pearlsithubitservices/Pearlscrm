const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    priority: {
      type: String,

      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
      default: Date.now,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Announcement", announcementSchema)