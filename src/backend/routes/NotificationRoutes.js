const express = require('express');
const router = express.Router();
const notificationSchema = require('../models/CommunicationModels/Notifications');

//Get Notification
router.get("/", async (req, res) => {
    try {
        // When an employeeId is passed, return that employee's own notifications
        // PLUS company-wide broadcast notifications (employeeId not set) such as
        // "New Benefit Added" so employees don't miss general HR announcements.
        const filter = req.query.employeeId
            ? {
                  $or: [
                      { employeeId: req.query.employeeId },
                      { employeeId: null },
                      { employeeId: "" },
                  ],
              }
            : {};
        const result = await notificationSchema
            .find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json(result);

    } catch (error) {
        console.error("Not Get Notification:", error);

        res.status(500).json({
            message: error.message,
        });
    }
});

//Create Notifications

router.post("/", async (req, res) => {
    try {
        const result = await notificationSchema.create(
            req.body
        )
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error Notification:", error);
        res.status(500).json({
            message: error.message
        });
    }
});

// Get notifications by employeeId
router.post("/by-employee", async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "employeeId is required",
            });
        }

        const notifications = await notificationSchema
            .find({ employeeId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Mark a single notification as read
router.patch("/:id/read", async (req, res) => {
    try {
        const notification = await notificationSchema.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Mark all notifications for an employee as read
router.patch("/mark-all-read", async (req, res) => {
    try {
        const { employeeId } = req.body;
        const filter = employeeId
            ? { $or: [{ employeeId }, { employeeId: null }, { employeeId: "" }] }
            : {};

        await notificationSchema.updateMany(filter, { isRead: true });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Delete Notification
router.delete("/:id", async (req, res) => {
    try {
        const notification = await notificationSchema.findByIdAndDelete(
            req.params.id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
            notification,
        });
    } catch (error) {
        console.error("Error deleting notification:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
module.exports = router;