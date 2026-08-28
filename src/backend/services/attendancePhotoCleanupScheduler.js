const EmpAttendanceModel = require("../models/EmpAttendanceModel");

const cleanupOldPhotos = async () => {
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
    );

    if (result.modifiedCount > 0) {
      console.log(`[Auto-Clean] Successfully erased ${result.modifiedCount} attendance photo(s) older than 7 days.`);
    }
  } catch (error) {
    console.error("[Auto-Clean Error] Failed to erase old attendance photos:", error);
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
