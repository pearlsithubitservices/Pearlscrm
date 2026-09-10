const mongoose = require("mongoose");

const boardFileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      default: "document", // document, spreadsheet, presentation, image, etc.
    },
    filePath: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    uploadedByName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const boardSchema = new mongoose.Schema(
  {
    boardName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    boardCategory: {
      type: String,
      enum: ["sprint", "project", "planning", "general"],
      default: "general",
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      default: "Admin",
    },
    files: [boardFileSchema],
    assignedTo: [
      {
        userId: String,
        userName: String,
        role: {
          type: String,
          enum: ["admin", "manager", "viewer"],
          default: "viewer",
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false, // false = admin only, true = all employees
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
