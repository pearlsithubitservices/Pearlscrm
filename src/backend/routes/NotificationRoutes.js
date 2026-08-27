const express = require('express');
const router = express.Router();
const notificationSchema = require('../models/CommunicationModels/Notifications');

//Get Notification
router.get("/", async (req, res) => {
    try {
        const filter = req.query.employeeId ? { employeeId: req.query.employeeId } : {};
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