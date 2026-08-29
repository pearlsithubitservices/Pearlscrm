const EmpAttendanceModel = require("../models/EmpAttendanceModel");
const mongoose = require("mongoose");

let cleanupRunning = false;

const cleanupOldPhotos = async () => {
  // Skip if already running or database not connected
  if (cleanupRunning) return;
  if (mongoose.connection.readyState !== 1) {
    console.warn("[Auto-Clean] Database not connected, skipping cleanup");
    return;
  }

  cleanupRunning = true;

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await EmpAttendanceModel.updateMany(
      {
        photo: { $ne: null },
        createdAt: { $lt: sevenDaysAgo }
      },
      {
        $set: { photo: null, photoStatus: "expired" }
      }
    ).maxTimeMS(5000); // 5 second timeout

    if (result.modifiedCount > 0) {
      console.log(`[Auto-Clean] Successfully erased ${result.modifiedCount} attendance photo(s) older than 7 days.`);
    }
  } catch (error) {
    console.error("[Auto-Clean Error] Failed to erase old attendance photos:", error.message);
  } finally {
    cleanupRunning = false;
  }
};

const startAttendancePhotoCleanupScheduler = () => {
  // Run once immediately on server startup
  cleanupOldPhotos();

  // Run every 24 hours
  setInterval(() => {
    cleanupOldPhotos();
  }, 24 * 60 * 60 * 1000);
};

module.exports = { startAttendancePhotoCleanupScheduler, cleanupOldPhotos };
