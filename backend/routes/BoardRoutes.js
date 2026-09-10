const express = require("express");
const router = express.Router();
const Board = require("../models/Board");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const boardUploadDirectory = path.join(__dirname, "../uploads/boards");
fs.mkdirSync(boardUploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, boardUploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `board-file-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// =====================================================
// GET ALL BOARDS (Admin sees all, Employees see assigned)
// =====================================================
router.get("/", async (req, res) => {
  try {
    const { userId, role } = req.query;
    let boards;

    if (role === "admin") {
      // Admin sees all boards
      boards = await Board.find()
        .sort({ createdAt: -1 })
        .lean();
    } else if (userId) {
      // Employees see only public boards or boards assigned to them
      boards = await Board.find({
        $or: [
          { isPublic: true },
          { "assignedTo.userId": userId },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // If no userId provided, return public boards only
      boards = await Board.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .lean();
    }

    res.status(200).json({
      success: true,
      count: boards.length,
      data: boards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET SINGLE BOARD
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// CREATE BOARD (Admin only)
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      boardName,
      description,
      boardCategory,
      createdBy,
      createdByName,
      assignedTo,
      isPublic,
      projectId,
    } = req.body;

    if (!boardName || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Board name and creator are required",
      });
    }

    const board = await Board.create({
      boardName,
      description,
      boardCategory,
      createdBy,
      createdByName,
      assignedTo: assignedTo || [],
      isPublic: isPublic || false,
      projectId,
      files: [],
    });

    res.status(201).json({
      success: true,
      message: "Board created successfully",
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// UPDATE BOARD
// =====================================================
router.put("/:id", async (req, res) => {
  try {
    const {
      boardName,
      description,
      boardCategory,
      assignedTo,
      isPublic,
      status,
    } = req.body;

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      {
        boardName,
        description,
        boardCategory,
        assignedTo,
        isPublic,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Board updated successfully",
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// UPLOAD FILE TO BOARD
// =====================================================
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const { uploadedBy, uploadedByName } = req.body;

    if (!uploadedBy) {
      return res.status(400).json({
        success: false,
        message: "Uploaded by user ID is required",
      });
    }

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let fileType = "document";

    if ([".xlsx", ".xls", ".csv"].includes(fileExt)) {
      fileType = "spreadsheet";
    } else if ([".ppt", ".pptx"].includes(fileExt)) {
      fileType = "presentation";
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileExt)) {
      fileType = "image";
    } else if ([".pdf"].includes(fileExt)) {
      fileType = "pdf";
    }

    const fileObj = {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType,
      filePath: `/uploads/boards/${req.file.filename}`,
      uploadedBy,
      uploadedByName,
    };

    board.files.push(fileObj);
    await board.save();

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// DELETE FILE FROM BOARD
// =====================================================
router.delete("/:id/file/:fileId", async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const fileIndex = board.files.findIndex((f) => f._id.toString() === req.params.fileId);

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "..", "uploads", "boards", board.files[fileIndex].filePath.split("/").pop());
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    board.files.splice(fileIndex, 1);
    await board.save();

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// DELETE BOARD
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Delete all files associated with the board
    for (let file of board.files) {
      const filePath = path.join(__dirname, "..", "uploads", "boards", file.filePath.split("/").pop());
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Board.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Board deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
