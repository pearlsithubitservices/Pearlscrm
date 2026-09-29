const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");

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

// Helper to format file size
const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 Kb";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} Kb`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} Mb`;
};

// Helper to purge any previously auto-seeded mock documents from MongoDB
const purgeSeedDocuments = async () => {
  try {
    await Document.deleteMany({
      $or: [
        { name: { $in: ["vishnu.ppt", "pearls.doc", "company.xls", "ai img.jpg"] } },
        { author: "Vishnu R" },
      ],
    });
  } catch (err) {
    console.warn("Could not purge mock seed documents:", err.message);
  }
};

// GET /api/documents - Fetch active documents
router.get("/", async (req, res) => {
  try {
    await purgeSeedDocuments();

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
    await purgeSeedDocuments();
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
    await purgeSeedDocuments();
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

// ============================================================
// E-SIGNATURE DYNAMIC ENDPOINTS
// ============================================================

// GET /api/documents/:id - Get a single document with full signature details
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    });
  }
});

// PATCH /api/documents/:id/sign - Persist electronic signature on a document
router.patch("/:id/sign", async (req, res) => {
  try {
    const { signedBy, signatureData, docName } = req.body;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      doc = await Document.findById(req.params.id);
    }

    if (!doc) {
      // If template document ID (e.g. doc-0), create and persist signed doc in DB
      const createdDoc = await Document.create({
        name: docName || req.body.name || "skills module certificate",
        type: "doc",
        extension: "doc",
        author: signedBy || "Employee",
        size: "32.15 Kb",
        isSigned: true,
        status: "completed",
        signedAt: new Date(),
        signedBy: signedBy || "Employee",
        signatureData: signatureData || null,
        createdOn: "Today",
        modifiedOn: "Just now",
      });

      return res.status(200).json({
        success: true,
        message: "Document successfully signed and saved",
        data: createdDoc,
      });
    }

    doc.isSigned = true;
    doc.status = "completed";
    doc.signedAt = new Date();
    doc.signedBy = signedBy || "Admin";
    if (signatureData) {
      doc.signatureData = signatureData;
    }
    doc.modifiedOn = "Today";

    // Mark any placed signature field as signed
    if (Array.isArray(doc.placedFields) && doc.placedFields.length > 0) {
      doc.placedFields = doc.placedFields.map((f) => {
        if (f.type === "signature" || f.type === "initials") {
          return {
            ...f.toObject?.() || f,
            signed: true,
            value: typeof signatureData === "string" ? signatureData : (signatureData?.text || signedBy || f.value),
          };
        }
        return f;
      });
    }

    // If signers exist, mark the matching signer as signed
    if (Array.isArray(doc.signers) && doc.signers.length > 0) {
      doc.signers = doc.signers.map((s) => {
        if (!signedBy || s.name === signedBy || s.email === signedBy) {
          return {
            ...s.toObject?.() || s,
            status: "signed",
            signedAt: new Date(),
          };
        }
        return s;
      });
    }

    const saved = await doc.save();

    res.status(200).json({
      success: true,
      message: "Document successfully signed and saved",
      data: saved,
    });
  } catch (error) {
    console.error("Error signing document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sign document",
      error: error.message,
    });
  }
});

// PATCH /api/documents/:id/fields - Save placed fields and signers from Editor
router.patch("/:id/fields", async (req, res) => {
  try {
    const { placedFields, signers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(200).json({
        success: true,
        message: "Document fields updated",
        data: { id: req.params.id, placedFields, signers },
      });
    }

    const updatePayload = {
      modifiedOn: "Just now",
    };

    if (Array.isArray(placedFields)) {
      updatePayload.placedFields = placedFields;
    }

    if (Array.isArray(signers)) {
      updatePayload.signers = signers;
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document fields and signers saved successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error saving document fields:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save document fields",
      error: error.message,
    });
  }
});

// PATCH /api/documents/:id/status - Update document status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["waiting", "completed", "draft"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, modifiedOn: "Today" },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
});

module.exports = router;
