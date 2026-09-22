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
    // E-Signature Dynamic Fields
    isSigned: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "completed", "draft"],
      default: "waiting",
      index: true,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    signedBy: {
      type: String,
      default: "",
      trim: true,
    },
    signatureData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    signers: [
      {
        id: String,
        name: String,
        email: String,
        role: { type: String, default: "Signer" },
        status: { type: String, default: "pending" },
        color: String,
        signedAt: Date,
      },
    ],
    placedFields: [
      {
        id: String,
        type: { type: String },
        label: String,
        value: String,
        prefill: { type: String, default: "" },
        validation: { type: String, default: "None" },
        required: { type: Boolean, default: false },
        selected: { type: Boolean, default: false },
        options: [String],
        font: String,
        fontName: String,
        color: String,
        sigType: String,
        dataUrl: String,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        signer: String,
        signed: Boolean,
      },
    ],
    assignedTo: [
      {
        employeeId: String,
        name: String,
        email: String,
        assignedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ isRecycled: 1, createdAt: -1 });
documentSchema.index({ isRecycled: 1, recycledAt: 1 });

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = Document;
