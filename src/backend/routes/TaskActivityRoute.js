const express = require("express");
const router = express.Router();

const Activity = require("../models/TaskModels/TaskActivityModel");

// Create Activity
router.post("/", async (req, res) => {
    try {
        const activity = await Activity.create(req.body);

        res.status(201).json({
            success: true,
            data: activity,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
// Get All Activities
router.get("/", async (req, res) => {
    try {
        const activities = await Activity.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Get Activities by employee_uid
router.get("/:employee_uid", async (req, res) => {
    try {
        const activities = await Activity.find({
            employee_uid: req.params.employee_uid,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: activities,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Update Activity
router.put("/:id", async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        res.status(200).json({
            success: true,
            data: activity,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Delete Activity
router.delete("/:id", async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Activity deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;