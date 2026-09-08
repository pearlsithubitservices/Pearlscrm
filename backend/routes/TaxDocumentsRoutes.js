const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const TaxDocument = require("../models/Payroll&Benefits/TaxDocument");


// ================= MULTER =================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/taxdocuments");
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                path.extname(file.originalname)
        );
    },

});

const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

    fileFilter: (req, file, cb) => {

        const allowed = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, JPG and PNG files are allowed."));
        }

    },

});


// ================= CREATE =================

router.post(
    "/",
    upload.single("document"),
    async (req, res) => {

        try {

            const document = await TaxDocument.create({

                title: req.body.title,

                description: req.body.description,

                financialYear: req.body.financialYear,

                documentType: req.body.documentType,

                documentUrl: req.file
                    ? `/uploads/taxdocuments/${req.file.filename}`
                    : "",

            });

            res.json(document);

        } catch (err) {

            res.status(500).json({
                message: err.message,
            });

        }

    }
);


// ================= GET ALL =================

router.get("/", async (req, res) => {

    try {

        const documents = await TaxDocument
            .find()
            .sort({ createdAt: -1 });

        res.json(documents);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

});


// ================= GET ONE =================

router.get("/:id", async (req, res) => {

    try {

        const document =
            await TaxDocument.findById(req.params.id);

        res.json(document);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

});


// ================= UPDATE =================

router.put(
    "/:id",
    upload.single("document"),
    async (req, res) => {

        try {

            const updateData = {

                title: req.body.title,

                description: req.body.description,

                financialYear: req.body.financialYear,

                documentType: req.body.documentType,

            };

            if (req.file) {

                updateData.documentUrl =
                    `/uploads/taxdocuments/${req.file.filename}`;

            }

            const document =
                await TaxDocument.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {
                        new: true,
                        runValidators: true,
                    }

                );

            res.json(document);

        } catch (err) {

            res.status(500).json({
                message: err.message,
            });

        }

    }
);


// ================= DELETE =================

router.delete("/:id", async (req, res) => {

    try {

        await TaxDocument.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Deleted Successfully",
        });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

});


module.exports = router;