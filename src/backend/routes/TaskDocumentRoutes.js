const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const TaskDocument = require("../models/TaskModels/TaskDocumentModel");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/task-documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "doc-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// POST /api/task-documents (Upload a new document)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { taskId, uploadedBy } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }

    const fileExt = path.extname(req.file.originalname).replace(".", "").toUpperCase() || "FILE";
    const fileSizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);
    const displaySize = fileSizeInMB < 1 
      ? `${(req.file.size / 1024).toFixed(0)} KB` 
      : `${fileSizeInMB} MB`;

    const fileUrl = `/uploads/task-documents/${req.file.filename}`;

    const newDoc = await TaskDocument.create({
      taskId,
      name: req.file.originalname,
      type: fileExt,
      size: displaySize,
      url: fileUrl,
      uploadedBy: uploadedBy || "User",
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: newDoc,
    });
  } catch (error) {
    console.error("Error uploading task document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/task-documents?taskId=... (Get documents for a task)
router.get("/", async (req, res) => {
  try {
    const { taskId } = req.query;
    const filter = {};
    if (taskId) {
      filter.taskId = taskId;
    }

    const documents = await TaskDocument.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching task documents:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/task-documents/:id (Delete a document)
router.delete("/:id", async (req, res) => {
  try {
    const doc = await TaskDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Attempt to delete physical file
    const filePath = path.join(__dirname, "..", doc.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await TaskDocument.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
