// routes/reimbursementRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ReimbursementClaim = require("../models/ReimbursementClaim");

const uploadDir = path.join(__dirname, "../uploads/reimbursements");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        cb(
            null,
            `${Date.now()}-${file.originalname}`
        );
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "application/pdf",
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG and PDF files are allowed"
                )
            );
        }
    },
});
//GET ALL CLAIM
router.get("/", async (req, res) => {
    try {
        const claims =
            await ReimbursementClaim.find().sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            data: claims,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

//Get Employee Claim
router.get("/:employee_uid", async (req, res) => {
    try {
        const claims =
            await ReimbursementClaim.find({
                employee_uid:
                    req.params.employee_uid,
            }).sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            data: claims,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});
//UPDATE sTATUS
router.patch("/:id/status", async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const claim =
            await ReimbursementClaim.findByIdAndUpdate(
                req.params.id,
                {
                    status,
                    remarks,
                },
                {
                    new: true,
                }
            );

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: "Claim not found",
            });
        }

        res.json({
            success: true,
            data: claim,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

//CREATE CLAIM
router.post(
    "/",
    upload.single("receipt"),
    async (req, res) => {
        try {
            const {
                employee_uid,
                employee_name,
                claimType,
                amount,
                expenseDate,
                description,
            } = req.body;

            const claim =
                await ReimbursementClaim.create({
                    employee_uid,
                    employee_name,
                    claimType,
                    amount,
                    expenseDate,
                    description,
                    receipt: req.file
                        ? req.file.path
                        : null,
                });

            res.status(201).json({
                success: true,
                message:
                    "Claim submitted successfully",
                data: claim,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }
);

module.exports = router;