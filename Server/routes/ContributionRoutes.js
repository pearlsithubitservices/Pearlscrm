const express = require("express");
const router = express.Router();

const Contribution = require("../models/TaskModels/TaskContribution");


// CREATE CONTRIBUTION
router.post("/", async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const contribution = await Contribution.create(req.body);

        res.status(201).json({
            success: true,
            contribution,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// GET ALL CONTRIBUTIONS
router.get("/", async (req, res) => {
    try {
        const contributions = await Contribution.find().sort({
            createdAt: -1,
        });

        res.status(200).json(contributions);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// GET CONTRIBUTIONS BY EMPLOYEE
router.post("/by-employee", async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "employeeId is required",
            });
        }

        const contributions = await Contribution.find({
            employeeId,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            contributions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// UPDATE CONTRIBUTION
router.put("/:id", async (req, res) => {
    try {
        const contribution = await Contribution.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!contribution) {
            return res.status(404).json({
                success: false,
                message: "Contribution not found",
            });
        }

        res.status(200).json({
            success: true,
            contribution,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;