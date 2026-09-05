const express = require("express");
const router = express.Router();
const Feedback = require("../models/CommunicationModels/Feedback");
const Notification = require("../models/CommunicationModels/Notifications");
const { getIO } = require("../Socket");

// CREATE FEEDBACK
router.post("/", async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);

    // Notify Admin: Employee submitted new feedback
    try {
      const io = getIO();

      if (io) {
        io.emit("feedbackCreated", feedback);
      }

      const notif = await Notification.create({
        title: `New Feedback: ${feedback.subject}`,
        sub: feedback.anonymous ? "Anonymous Employee" : (req.body.employeeName || "Employee"),
        notificationType: "General",
        employeeId: null, // null = goes to Admin's notification center
        senderId: feedback.anonymous ? null : feedback.employeeId,
      });

      if (io) {
        io.emit("newNotification", notif);
      }
    } catch (notifErr) {
      console.warn("Error creating feedback notification:", notifErr.message);
    }

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL FEEDBACK
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE FEEDBACK STATUS
router.put("/:id", async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(adminComment !== undefined && { adminComment }) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Notify Employee: Admin responded to their feedback
    try {
      const io = getIO();

      if (io) {
        io.emit("feedbackUpdated", updated);
      }

      if (updated.employeeId && !updated.anonymous) {
        const notif = await Notification.create({
          title: `Update on your feedback "${updated.subject}"`,
          sub: adminComment || (status ? `Status: ${status}` : "HR Team"),
          notificationType: "General",
          employeeId: String(updated.employeeId),
          senderId: "admin",
        });

        if (io) {
          io.to(`user_${updated.employeeId}`).emit("newNotification", notif);
          io.to(String(updated.employeeId)).emit("newNotification", notif);
        }
      }
    } catch (notifErr) {
      console.warn("Error creating feedback update notification:", notifErr.message);
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;