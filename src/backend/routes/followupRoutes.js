const express = require("express");
const router = express.Router();
const Followup = require("../models/Followup");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");

// Create Followup
router.post("/", async (req, res) => {
  try {
    const followup = await Followup.create(req.body);

    const io = getIO();
    if (io) {
      io.emit("followupCreated", followup);
      io.emit("followupUpdated", followup);
    }

    // Trigger Notification for assigned employee if present
    let targetEmp = followup.assignedTo;
    if (targetEmp) {
      try {
        const notif = await Notification.create({
          title: `New Follow-up Assigned: ${followup.clientName || "Client"}`,
          sub: "Follow-up Management",
          notificationType: "General",
          employeeId: String(targetEmp),
        });
        if (io) {
          io.to(`user_${targetEmp}`).emit("newNotification", notif);
          io.to(String(targetEmp)).emit("newNotification", notif);
        }
      } catch (nErr) {
        console.warn("Followup notification creation error:", nErr.message);
      }
    }

    res.status(201).json(followup);
  } catch (error) {
    console.error("Error creating followup:", error);
    res.status(500).json({ message: error.message });
  }
});

// Test Followup Reminder Trigger
router.post("/test-reminder", async (req, res) => {
  try {
    const io = getIO();
    const testData = {
      title: "⏰ Test Follow-up Reminder Alert",
      message: "Notification system is 100% working fine! Live socket alert received successfully.",
    };
    if (io) {
      io.emit("followupReminder", testData);
    }
    res.status(200).json({ success: true, message: "Test reminder broadcasted via Socket.io" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Followups
router.get("/", async (req, res) => {
  try {
    const followups = await Followup.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(followups);
  } catch (error) {
    console.error("Error fetching followups:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get Followup by ID
router.get("/:id", async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id);
    if (!followup) {
      return res.status(404).json({ message: "Followup not found" });
    }
    res.status(200).json(followup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Followup
router.put("/:id", async (req, res) => {
  try {
    const existing = await Followup.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Followup not found" });
    }

    const { newNote, author, ...updateFields } = req.body;

    if (updateFields.date || updateFields.followupTime || updateFields.nextFollowupDate) {
      if (updateFields.reminderSent === undefined) {
        updateFields.reminderSent = false;
      }
    }

    let history = existing.history || [];
    if (newNote && newNote.trim()) {
      history.push({
        date: new Date().toLocaleDateString(),
        note: newNote.trim(),
        author: author || "User",
        createdAt: new Date(),
      });
      updateFields.notes = newNote.trim();
    }

    const updatedFollowup = await Followup.findByIdAndUpdate(
      req.params.id,
      {
        ...updateFields,
        history,
      },
      { new: true }
    );

    const io = getIO();
    if (io) {
      io.emit("followupUpdated", updatedFollowup);
    }

    res.status(200).json(updatedFollowup);
  } catch (error) {
    console.error("Error updating followup:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete Followup
router.delete("/:id", async (req, res) => {
  try {
    await Followup.findByIdAndDelete(req.params.id);

    const io = getIO();
    if (io) {
      io.emit("followupUpdated", { deletedId: req.params.id });
    }

    res.status(200).json({ success: true, message: "Followup deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;