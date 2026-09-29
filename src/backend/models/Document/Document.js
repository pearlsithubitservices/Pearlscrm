const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "doc", // "ppt", "doc", "xls", "board", "ai", "file"
      lowercase: true,
      trim: true,
    },
    extension: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    size: {
      type: String,
      default: "0 Kb",
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    url: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      default: "Admin",
    },
    authorId: {
      type: String,
      default: "",
    },
    isRecycled: {
      type: Boolean,
      default: false,
      index: true,
    },
    recycledAt: {
      type: Date,
      default: null,
    },
    retentionDays: {
      type: Number,
      default: 30,
    },
    badgeText: {
      type: String,
      default: "",
    },
    badgeColor: {
      type: String,
      default: "",
    },
    createdOn: {
      type: String,
      default: "",
    },
    modifiedOn: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// MongoDB TTL index: automatically deletes document 30 days (2,592,000 seconds) after recycledAt
documentSchema.index(
  { recycledAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { isRecycled: true },
  }
);

module.exports = mongoose.model("Document", documentSchema);
