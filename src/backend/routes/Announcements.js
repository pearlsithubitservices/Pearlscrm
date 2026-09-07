const express = require('express');
const router = express.Router();
const announcementSchema = require('../models/CommunicationModels/Announcements');
const notificationSchema = require('../models/CommunicationModels/Notifications');

//Get Announcements
router.get("/", async (req, res) => {
    try {
        const result = await announcementSchema.find().sort({ createdAt: -1 });
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Failed to fetch Announcements" });
    }
});

//CREATE ANNOUNCEMENT

router.post("/", async (req, res) => {
    try {
        const result = await announcementSchema.create(
            req.body
        );

        // Auto create system notification for employees
        try {
            await notificationSchema.create({
                title: req.body.title ? `Announcement: ${req.body.title}` : "New Company Announcement",
                sub: req.body.role || req.body.author || "HR Manager",
                notificationType: "General",
                isImportant: true,
                isRead: false
            });
        } catch (notifErr) {
            console.error("Error creating auto notification:", notifErr);
        }

        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error creating Announcement:", error);
        res.status(500).json({ message: "Failed to create Announcement" });
    }
});

//Update IsRead
router.patch("/:id", async (req, res) => {
    try {
        const result = await announcementSchema.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcement marked as read",
            data: result,
        });
    } catch (error) {
        console.error("Error updating read status:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update announcement",
        });
    }
});

//PINNED FUNCTION

router.patch("/:id/pin", async (req, res) => {
    try {
        const announcement = await announcementSchema.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found",
            });
        }
        announcement.pinned = !announcement.pinned;
        await announcement.save();

        res.status(200).json(announcement);

    } catch (error) {
        console.error("Pin Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
});


// DELETE ANNOUNCEMENT
router.delete("/:id", async (req, res) => {
    try {
        const result = await announcementSchema.findByIdAndDelete(
            req.params.id
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
            data: result,
        });

    } catch (error) {
        console.error("Delete Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete announcement",
            error: error.message,
        });
    }
});

module.exports = router;