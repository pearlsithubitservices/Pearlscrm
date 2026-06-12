const express = require('express');
const router = express.Router();
const ticketSchema = require('../models/CommunicationModels.js/HelpDesk');
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

module.exports = router;