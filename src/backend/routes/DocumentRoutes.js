const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/Document/Document");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
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

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Default PDF mock documents for auto-seeding
const SEED_DOCUMENTS = [
  {
    name: "vishnu.ppt",
    type: "ppt",
    extension: "ppt",
    size: "24.82 Kb",
    sizeBytes: 25416,
    createdOn: "37 minutes ago",
    modifiedOn: "Jul, 21",
    author: "Vishnu R",
    isRecycled: false,
  },
  {
    name: "pearls.doc",
    type: "doc",
    extension: "doc",
    size: "24.35 Kb",
    sizeBytes: 24934,
    createdOn: "today, 02:18",
    modifiedOn: "Jun, 06",
    author: "Vishnu R",
    isRecycled: false,
  },
  {
    name: "company.xls",
    type: "xls",
    extension: "xls",
    size: "21.24 Kb",
    sizeBytes: 21750,
    createdOn: "today, 01:18",
    modifiedOn: "Aug, 13",
    author: "Vishnu R",
    isRecycled: false,
  },
];

const SEED_RECYCLE_BIN = [
  {
    name: "ai img.jpg",
    type: "ai",
    extension: "jpg",
    badgeText: "Ai",
    badgeColor: "bg-purple-700",
    size: "18.50 Kb",
    sizeBytes: 18944,
    createdOn: "yesterday",
    modifiedOn: "Aug, 10",
    author: "Vishnu R",
    isRecycled: true,
    recycledAt: new Date(),
    retentionDays: 30,
  },
];

// Helper to format file size
const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 Kb";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} Kb`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} Mb`;
};

// GET /api/documents - Fetch active documents (auto-seeds if database is empty)
router.get("/", async (req, res) => {
  try {
    const totalCount = await Document.countDocuments();
    if (totalCount === 0) {
      await Document.insertMany([...SEED_DOCUMENTS, ...SEED_RECYCLE_BIN]);
    }

    const documents = await Document.find({ isRecycled: false }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
});

// GET /api/documents/recycle-bin - Fetch deleted/recycled documents with 30-day auto-purge
router.get("/recycle-bin", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Auto-clean expired items older than 30 days
    const expiredDocs = await Document.find({
      isRecycled: true,
      recycledAt: { $lt: thirtyDaysAgo },
    });

    if (expiredDocs.length > 0) {
      for (const doc of expiredDocs) {
        if (doc.url && doc.url.startsWith("/uploads/documents/")) {
          const filePath = path.join(__dirname, "..", doc.url);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              console.warn("Could not delete expired file from disk:", filePath, e);
            }
          }
        }
      }
      await Document.deleteMany({
        isRecycled: true,
        recycledAt: { $lt: thirtyDaysAgo },
      });
    }

    // 2. Query active recycled items
    const recycledItems = await Document.find({ isRecycled: true }).sort({
      recycledAt: -1,
      updatedAt: -1,
    });

    // 3. Compute dynamic daysRemaining for each item
    const formatted = recycledItems.map((doc) => {
      const docObj = doc.toObject();
      const recDate = doc.recycledAt || doc.updatedAt || doc.createdAt || new Date();
      const diffMs = Date.now() - new Date(recDate).getTime();
      const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(1, 30 - daysPassed);

      return {
        ...docObj,
        id: docObj._id,
        daysRemaining,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching recycle bin items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recycle bin items",
      error: error.message,
    });
  }
});

// GET /api/documents/stats - Get My Drive storage & file statistics
router.get("/stats", async (req, res) => {
  try {
    const activeDocs = await Document.find({ isRecycled: false });
    const recycledDocs = await Document.find({ isRecycled: true });

    let totalBytes = 0;
    activeDocs.forEach((d) => {
      totalBytes += d.sizeBytes || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        activeCount: activeDocs.length,
        recycledCount: recycledDocs.length,
        totalBytes,
        formattedSize: formatFileSize(totalBytes),
      },
    });
  } catch (error) {
    console.error("Error fetching drive stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drive stats",
      error: error.message,
    });
  }
});

// GET /api/documents/:id/download - Direct attachment download for any file
router.get("/:id/download", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    if (doc.url && doc.url.startsWith("/uploads/documents/")) {
      const filePath = path.join(__dirname, "..", doc.url);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, doc.name);
      }
    }

    // Fallback: send as attachment with proper headers
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(doc.name)}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    return res.send(doc.content || `Content of ${doc.name}`);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download document",
      error: error.message,
    });
  }
});

// Strict format extension mapping for validation
const ALLOWED_EXTENSIONS_MAP = {
  doc: ["doc", "docx", "odt", "txt", "rtf"],
  xls: ["xls", "xlsx", "csv", "ods"],
  ppt: ["ppt", "pptx", "odp"],
  board: ["brd", "board", "json", "canvas", "drawio", "pdf", "png", "jpg", "jpeg", "svg"],
};

// POST /api/documents - Create new document (file upload OR JSON template)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    let docData = {};

    if (req.file) {
      const ext = path.extname(req.file.originalname).replace(".", "").toLowerCase();
      const requestedType = (req.body.type || "").toLowerCase();

      // Enforce strict file extension check if format was selected
      if (requestedType && ALLOWED_EXTENSIONS_MAP[requestedType]) {
        const allowed = ALLOWED_EXTENSIONS_MAP[requestedType];
        if (!allowed.includes(ext)) {
          // Remove invalid file from disk
          if (fs.existsSync(req.file.path)) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
              console.warn("Could not delete invalid upload:", unlinkErr);
            }
          }
          return res.status(400).json({
            success: false,
            message: `Invalid file! For ${requestedType.toUpperCase()}, only [${allowed.map((e) => "." + e).join(", ")}] are permitted.`,
          });
        }
      }

      let docType = requestedType || "file";
      if (!requestedType) {
        if (["ppt", "pptx"].includes(ext)) docType = "ppt";
        else if (["doc", "docx", "txt", "rtf"].includes(ext)) docType = "doc";
        else if (["xls", "xlsx", "csv"].includes(ext)) docType = "xls";
        else if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) docType = "ai";
      }

      docData = {
        name: req.body.name || req.file.originalname,
        type: docType,
        extension: ext,
        size: formatFileSize(req.file.size),
        sizeBytes: req.file.size,
        url: `/uploads/documents/${req.file.filename}`,
        author: req.body.author || "Admin",
        authorId: req.body.authorId || "",
        createdOn: "Just now",
        modifiedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    } else {
      const { name, type, extension, size, content, author, authorId } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Document name is required" });
      }

      const requestedType = (type || "doc").toLowerCase();
      const ext = extension || (name.includes(".") ? name.split(".").pop().toLowerCase() : requestedType);

      // Validate name extension if present
      if (name.includes(".") && ALLOWED_EXTENSIONS_MAP[requestedType]) {
        const fileExt = name.split(".").pop().toLowerCase();
        const allowed = ALLOWED_EXTENSIONS_MAP[requestedType];
        if (!allowed.includes(fileExt)) {
          return res.status(400).json({
            success: false,
            message: `Document name extension (.${fileExt}) does not match ${requestedType.toUpperCase()} format.`,
          });
        }
      }

      docData = {
        name,
        type: requestedType,
        extension: ext,
        size: size || "12.50 Kb",
        sizeBytes: 12800,
        content: content || "",
        author: author || "Admin",
        authorId: authorId || "",
        createdOn: "Just now",
        modifiedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    }

    const createdDoc = await Document.create(docData);

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: createdDoc,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create document",
      error: error.message,
    });
  }
});

// PATCH /api/documents/:id/rename - Rename a document
router.patch("/:id/rename", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Valid document name is required" });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        modifiedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document renamed successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error renaming document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rename document",
      error: error.message,
    });
  }
});

// PATCH /api/documents/:id/recycle - Move document to Recycle Bin
router.patch("/:id/recycle", async (req, res) => {
  try {
    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        isRecycled: true,
        recycledAt: new Date(),
        retentionDays: 30,
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document moved to Recycle Bin",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error moving document to recycle bin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recycle document",
      error: error.message,
    });
  }
});

// PATCH /api/documents/:id/restore - Restore document from Recycle Bin to Drive
router.patch("/:id/restore", async (req, res) => {
  try {
    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        isRecycled: false,
        recycledAt: null,
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document restored to Drive",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error restoring document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore document",
      error: error.message,
    });
  }
});

// DELETE /api/documents/recycle-bin/empty - Empty the entire Recycle Bin
router.delete("/recycle-bin/empty", async (req, res) => {
  try {
    const recycledDocs = await Document.find({ isRecycled: true });

    // Clean up any uploaded files from disk
    for (const doc of recycledDocs) {
      if (doc.url && doc.url.startsWith("/uploads/documents/")) {
        const filePath = path.join(__dirname, "..", doc.url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn("Could not delete file from disk:", filePath, e);
          }
        }
      }
    }

    const deleteResult = await Document.deleteMany({ isRecycled: true });

    res.status(200).json({
      success: true,
      message: "Recycle Bin emptied successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error emptying recycle bin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to empty recycle bin",
      error: error.message,
    });
  }
});

// DELETE /api/documents/:id - Permanently delete a single document
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Clean up uploaded file if present
    if (doc.url && doc.url.startsWith("/uploads/documents/")) {
      const filePath = path.join(__dirname, "..", doc.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete file from disk:", filePath, e);
        }
      }
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document permanently deleted",
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
});

module.exports = router;
