const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Document name is required"],
      trim: true,
    },
    type: {
      type: String,
      default: "doc",
      trim: true,
      lowercase: true,
    },
    extension: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    size: {
      type: String,
      default: "0 Kb",
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    badgeText: {
      type: String,
      default: "",
    },
    badgeColor: {
      type: String,
      default: "",
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
      trim: true,
    },
    authorId: {
      type: String,
      default: "",
    },
    createdOn: {
      type: String,
      default: "Just now",
    },
    modifiedOn: {
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
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ isRecycled: 1, createdAt: -1 });
documentSchema.index({ isRecycled: 1, recycledAt: 1 });

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = Document;
