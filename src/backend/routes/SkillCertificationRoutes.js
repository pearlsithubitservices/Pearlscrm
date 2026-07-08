const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join(__dirname, "../uploads/certificates");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const upload = multer({ storage });


const SkillCertification = require("../models/Performance/SkillCertification");

// Create skills
router.post("/skill", async (req, res) => {
    try {
        const { employee_uid, name, level, progress } = req.body;

        const data =
            await SkillCertification.findOneAndUpdate(
                { employee_uid },
                {
                    $push: {
                        skills: {
                            name,
                            level,
                            progress,
                        },
                    },
                },
                {
                    new: true,
                    upsert: true,
                }
            );

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get All
router.get("/", async (req, res) => {
    try {
        const data = await SkillCertification.find();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//CREATE CERTIFICATE

router.post(
    "/certification",
    upload.single("image"),
    async (req, res) => {
        console.log("Body:", req.body);
        console.log("File:", req.file);
        try {
            const {
                employee_uid,
                title,
                issuer,
                issued,
            } = req.body;

            const image = req.file
                ? `/uploads/certificates/${req.file.filename}`
                : "";

            const data = await SkillCertification.findOneAndUpdate(
                { employee_uid },
                {
                    $push: {
                        certifications: {
                            title,
                            issuer,
                            issued,
                            image,
                        },
                    },
                },
                {
                    new: true,
                    upsert: true,
                }
            );

            res.json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

// Get By Id
router.get("/:id", async (req, res) => {
    try {
        const data = await SkillCertification.findById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Update skills
router.put("/skill/:employee_uid/:skill_id", async (req, res) => {
    try {
        const { employee_uid, skill_id } = req.params;
        const { name, level, progress } = req.body;

        const data = await SkillCertification.findOneAndUpdate(
            {
                employee_uid,
                "skills._id": skill_id,
            },
            {
                $set: {
                    "skills.$.name": name,
                    "skills.$.level": level,
                    "skills.$.progress": progress,
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//UPDATE CERTIFICATIONS

router.put(
    "/certification/:employee_uid/:cert_id",
    upload.single("image"),
    async (req, res) => {
        try {
            const { employee_uid, cert_id } = req.params;
            const { title, issuer, issued } = req.body;

            const updateData = {
                "certifications.$.title": title,
                "certifications.$.issuer": issuer,
                "certifications.$.issued": issued,
            };

            if (req.file) {
                updateData["certifications.$.image"] =
                    `/uploads/certificates/${req.file.filename}`;
            }

            const data = await SkillCertification.findOneAndUpdate(
                {
                    employee_uid,
                    "certifications._id": cert_id,
                },
                {
                    $set: updateData,
                },
                {
                    new: true,
                }
            );

            res.json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);

// Delete skills
router.delete("/skill/:employee_uid/:skill_id", async (req, res) => {
    try {
        const { employee_uid, skill_id } = req.params;

        const data = await SkillCertification.findOneAndUpdate(
            { employee_uid },
            {
                $pull: {
                    skills: { _id: skill_id },
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully",
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//DELETE CERTIFICATIONS

router.delete("/certification/:employee_uid/:cert_id", async (req, res) => {
    try {
        const { employee_uid, cert_id } = req.params;

        const data = await SkillCertification.findOneAndUpdate(
            { employee_uid },
            {
                $pull: {
                    certifications: { _id: cert_id },
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Certification deleted successfully",
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;