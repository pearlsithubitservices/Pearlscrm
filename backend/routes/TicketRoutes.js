const express = require('express');
const router = express.Router();
const ticketSchema = require('../models/CommunicationModels/HelpDesk');
const Notification = require('../models/CommunicationModels/Notifications');
const { getIO } = require('../Socket');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = require("path");
        const fs = require("fs");

        const dir = path.join(__dirname, "../uploads");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + file.originalname;
        cb(null, unique);
    },
});

const upload = multer({ storage });


// GET ALL TICKETS
router.get("/", async (req, res) => {
    try {
        const result = await ticketSchema.find().sort({ createdAt: -1 });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});


// CREATE TICKET
router.post("/", upload.single("attachment"), async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.file);

        const result = await ticketSchema.create({
            employeeId: req.body.employeeId,
            employeeName: req.body.employeeName,
            issuedcategory: req.body.issuedcategory,
            priority: req.body.priority,
            subject: req.body.subject,
            description: req.body.description,
            attachment: req.file ? req.file.filename : null,
        });

        // Notify Admin: Employee raised a new Help Desk ticket
        try {
            const io = getIO();

            if (io) {
                io.emit("ticketCreated", result);
            }

            const notif = await Notification.create({
                title: `New Ticket: ${result.subject}`,
                sub: result.employeeName || "Employee",
                notificationType: "General",
                employeeId: null, // null = goes to Admin's notification center
                senderId: result.employeeId,
            });

            if (io) {
                io.emit("newNotification", notif);
            }
        } catch (notifErr) {
            console.warn("Error creating ticket notification:", notifErr.message);
        }

        res.status(201).json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error("TICKET ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// UPDATE TICKET STATUS / ASSIGNED
router.put("/:id", async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        const updated = await ticketSchema.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Notify Employee: Admin updated their ticket
        try {
            const io = getIO();

            if (io) {
                io.emit("ticketUpdated", updated);
            }

            if (updated.employeeId) {
                const notif = await Notification.create({
                    title: `Your ticket "${updated.subject}" was updated`,
                    sub: status ? `Status: ${status}` : "Support Team",
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
            console.warn("Error creating ticket update notification:", notifErr.message);
        }

        res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error("UPDATE TICKET ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;