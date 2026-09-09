const Followup = require("../models/Followup");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");
const mongoose = require("mongoose");

let schedulerStarted = false;
let schedulerRunning = false;

/**
 * Checks for follow-ups due for reminder every 60 seconds
 */
const checkFollowupReminders = async () => {
  // Skip if already running or database not connected
  if (schedulerRunning) return;
  if (mongoose.connection.readyState !== 1) {
    console.warn("[FollowupScheduler] Database not connected, skipping check");
    return;
  }

  schedulerRunning = true;

  try {
    const io = getIO();
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const now = new Date();

    // Query non-completed followups where reminder hasn't been sent yet
    const pendingFollowups = await Followup.find({
      status: { $ne: "Completed" },
      isCompleted: { $ne: true },
      reminderSent: { $ne: true },
    }).maxTimeMS(5000); // 5 second timeout instead of default 10

    for (const item of pendingFollowups) {
      let isDue = false;

      // Robust check for date, nextFollowupDate, or fallback to today
      if (item.date) {
        const itemDateStr = String(item.date).split("T")[0];
        // If date format is YYYY-MM-DD or earlier
        if (itemDateStr <= todayStr) {
          isDue = true;
        } else {
          // Try parsing date string
          const parsed = new Date(item.date);
          if (!isNaN(parsed.getTime()) && parsed <= now) {
            isDue = true;
          }
        }
      } else if (item.nextFollowupDate) {
        if (new Date(item.nextFollowupDate) <= now) {
          isDue = true;
        }
      } else {
        // Fallback: If no date specified, pending followup is due for today
        isDue = true;
      }

      if (isDue) {
        const notifTitle = `⏰ Follow-up Reminder: ${item.clientName || "Client"}`;
        const notifMsg = `Follow-up (${item.type || "Call"}) scheduled for ${item.followupTime || "Today"} with ${item.clientName}.`;

        // Create Notification record for assigned employee
        if (item.assignedTo) {
          try {
            const notif = await Notification.create({
              title: notifTitle,
              sub: notifMsg,
              notificationType: "General",
              employeeId: String(item.assignedTo),
            });

            if (io) {
              io.to(`user_${item.assignedTo}`).emit("newNotification", notif);
            }
          } catch (nErr) {
            console.warn("Error creating reminder notification:", nErr.message);
          }
        }

        // Mark reminderSent as true so it doesn't duplicate
        await Followup.findByIdAndUpdate(item._id, { reminderSent: true });
        console.log(`[FollowupScheduler] Reminder sent for Follow-up: ${item.clientName} (${item._id})`);
      }
    }
  } catch (error) {
    console.error("[FollowupScheduler] Error in checkFollowupReminders:", error.message);
  } finally {
    schedulerRunning = false;
  }
};

const startFollowupReminderScheduler = () => {
  console.log("⏰ [FollowupScheduler] Automated background follow-up scheduler disabled (Page notifications active).");
};

module.exports = { startFollowupReminderScheduler, checkFollowupReminders };
