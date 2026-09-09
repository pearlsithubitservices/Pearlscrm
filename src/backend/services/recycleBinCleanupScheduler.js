const Document = require("../models/Document/Document");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

let cleanupRunning = false;

/**
 * Automatically purges recycled documents older than 30 days from MongoDB & disk
 */
const cleanupExpiredRecycleBin = async () => {
  if (cleanupRunning) return;
  if (mongoose.connection.readyState !== 1) {
    console.warn("[RecycleBin-AutoClean] Database not connected, skipping cleanup");
    return;
  }

  cleanupRunning = true;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expiredDocs = await Document.find({
      isRecycled: true,
      recycledAt: { $lt: thirtyDaysAgo },
    }).maxTimeMS(5000);

    if (expiredDocs.length > 0) {
      console.log(`[RecycleBin-AutoClean] Found ${expiredDocs.length} expired document(s) older than 30 days.`);

      // Clean up physical disk files
      for (const doc of expiredDocs) {
        if (doc.url && doc.url.startsWith("/uploads/documents/")) {
          const filePath = path.join(__dirname, "..", doc.url);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (unlinkErr) {
              console.warn("[RecycleBin-AutoClean] Could not unlink file:", filePath, unlinkErr);
            }
          }
        }
      }

      // Delete from MongoDB
      const result = await Document.deleteMany({
        isRecycled: true,
        recycledAt: { $lt: thirtyDaysAgo },
      });

      console.log(`[RecycleBin-AutoClean] Successfully purged ${result.deletedCount} expired document(s).`);
    }
  } catch (error) {
    console.error("[RecycleBin-AutoClean Error] Failed to purge expired documents:", error.message);
  } finally {
    cleanupRunning = false;
  }
};

/**
 * Starts the daily 30-day auto-removal background scheduler
 */
const startRecycleBinCleanupScheduler = () => {
  // 1. Run once on startup
  cleanupExpiredRecycleBin();

  // 2. Run every 24 hours
  setInterval(() => {
    cleanupExpiredRecycleBin();
  }, 24 * 60 * 60 * 1000);
};

module.exports = {
  startRecycleBinCleanupScheduler,
  cleanupExpiredRecycleBin,
};
